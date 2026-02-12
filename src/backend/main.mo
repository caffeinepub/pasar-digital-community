import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Random "mo:core/Random";
import MixinAuthorization "authorization/MixinAuthorization";
import InviteLinksModule "invite-links/invite-links-module";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  let inviteState = InviteLinksModule.initState();

  type UserProfile = {
    fullName : Text;
    email : Text;
    city : Text;
    country : Text;
    onboarded : Bool;
  };

  type Notification = {
    id : Text;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
    read : Bool;
    vehicleId : Text;
  };

  type VehicleStatus = {
    #LOST : { reportNote : Text; timeReported : Time.Time };
    #STOLEN : { reportNote : Text; timeReported : Time.Time };
    #PAWNED : { reportNote : Text; timeReported : Time.Time };
    #FOUND : { finderReport : Text; timeReported : Time.Time; foundBy : Principal };
    #ACTIVE;
  };

  type Vehicle = {
    id : Text;
    owner : Principal;
    engineNumber : Text;
    chassisNumber : Text;
    brand : Text;
    model : Text;
    year : Nat;
    location : Text;
    vehiclePhoto : Storage.ExternalBlob;
    status : VehicleStatus;
    transferCode : ?Text;
  };

  type ActivationToken = {
    token : Text;
    userId : Principal;
    admin : Principal;
    createdAt : Time.Time;
    redeemed : Bool;
    redeemedAt : ?Time.Time;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userPINs = Map.empty<Principal, Text>();
  let notifications = Map.empty<Text, Notification>();
  let vehicleState = Map.empty<Text, Vehicle>();
  let usedInviteTokens = Map.empty<Text, Principal>();

  let allowlistAdmin = Principal.fromText("dcama-lvxhu-qf6zb-u75wm-yapdd-dosl4-b3rvi-pxrax-sznjy-3yq47-bae");

  var notificationCounter : Nat = 0;

  type VehicleCheckStatus = {
    vehicle : Vehicle;
    statusNote : Text;
  };

  // Persistent activation data
  var activationTokens : Map.Map<Text, ActivationToken> = Map.empty<Text, ActivationToken>();
  var userActivations : Map.Map<Principal, Bool> = Map.empty<Principal, Bool>();

  // Helper function to check if allowlist admin is onboarded
  func isAllowlistAdminOnboarded() : Bool {
    switch (userProfiles.get(allowlistAdmin)) {
      case (?profile) { profile.onboarded };
      case (null) { false };
    };
  };

  // Helper function to check if caller is allowlist admin (onboarded or not)
  func isCallerAllowlistAdmin(caller : Principal) : Bool {
    caller == allowlistAdmin;
  };

  // Helper function to check if user is onboarded
  func isUserOnboarded(principal : Principal) : Bool {
    switch (userProfiles.get(principal)) {
      case (?profile) { profile.onboarded };
      case (null) { false };
    };
  };

  // Helper function to check if caller has admin permission (including allowlist admin)
  func hasAdminPermission(caller : Principal) : Bool {
    if (isCallerAllowlistAdmin(caller)) { return true };
    AccessControl.hasPermission(accessControlState, caller, #admin);
  };

  // Helper function to check if caller has user permission (onboarded users or allowlist admin)
  func hasUserPermission(caller : Principal) : Bool {
    if (isCallerAllowlistAdmin(caller)) { return true };
    if (isUserOnboarded(caller)) { return true };
    AccessControl.hasPermission(accessControlState, caller, #user);
  };

  // --------------------------------- Prefab Invite Links API (DO NOT REMOVE: router dependency) ---------------------------------
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };

    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot submit RSVPs");
    };

    let inviteCodes = InviteLinksModule.getInviteCodes(inviteState);
    switch (inviteCodes.find(func(code) { code.code == inviteCode })) {
      case (null) { Runtime.trap("Invalid invitation code") };
      case (?_code) {
        InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
      };
    };
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // --------------------------------- User Profile Management ---------------------------------
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    // Anonymous principals cannot have profiles
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Admins can view any profile
    if (hasAdminPermission(caller)) {
      return userProfiles.get(user);
    };

    // Users can only view their own profile
    if (caller != user) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    // Anonymous principals cannot view profiles
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view profiles");
    };

    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    // Anonymous principals cannot save profiles
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot save profiles");
    };

    // Only onboarded users can save profiles (must have completed onboarding first)
    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can save profiles");
    };

    userProfiles.add(caller, profile);
  };

  // New onboarding - any authenticated principal can onboard
  public shared ({ caller }) func completeOnboarding(_inviteToken : Text, profile : UserProfile) : async () {
    // Anonymous principals cannot onboard
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot complete onboarding");
    };

    let isAllowlistAdminNotOnboarded = not isAllowlistAdminOnboarded();
    let isClaimingFirstAdmin = isCallerAllowlistAdmin(caller) and isAllowlistAdminNotOnboarded;

    if (isClaimingFirstAdmin) {
      // Special case: allowlist admin claiming first admin role
      let adminProfile = {
        fullName = profile.fullName;
        email = profile.email;
        city = profile.city;
        country = profile.country;
        onboarded = true;
      };
      userProfiles.add(caller, adminProfile);
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      // Regular onboarding for any authenticated principal
      switch (userProfiles.get(caller)) {
        case (?existingProfile) {
          if (existingProfile.onboarded) {
            Runtime.trap("Already onboarded");
          };
        };
        case null {};
      };

      let onboardedProfile = {
        fullName = profile.fullName;
        email = profile.email;
        city = profile.city;
        country = profile.country;
        onboarded = true;
      };
      userProfiles.add(caller, onboardedProfile);

      // Note: We don't call AccessControl.assignRole here because it has admin-only guards.
      // Instead, we rely on the onboarded flag in the profile and use hasUserPermission
      // helper function to check authorization throughout the application.
    };
  };

  // --------------------------------- PIN Management ---------------------------------
  public query ({ caller }) func hasPIN(callerToCheck : ?Principal) : async Bool {
    let principalToCheck = switch (callerToCheck) {
      case (?p) { p };
      case (null) { caller };
    };
    userPINs.containsKey(principalToCheck);
  };

  public shared ({ caller }) func setupPIN(pin : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot setup PIN");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can setup PIN");
    };

    userPINs.add(caller, pin);
  };

  public shared ({ caller }) func updatePIN(oldPin : Text, newPin : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot update PIN");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can update PIN");
    };

    switch (userPINs.get(caller)) {
      case null { Runtime.trap("No PIN set for this user") };
      case (?storedPin) {
        if (storedPin != oldPin) {
          Runtime.trap("Incorrect old PIN");
        };
        userPINs.add(caller, newPin);
      };
    };
  };

  func verifyPIN(principal : Principal, pin : Text) : Bool {
    switch (userPINs.get(principal)) {
      case null { false };
      case (?storedPin) { storedPin == pin };
    };
  };

  // --------------------------------- Vehicle Registration ---------------------------------

  // Admin method to generate activation token for a specific user
  public shared ({ caller }) func generateActivationToken(userId : Principal) : async Text {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can generate activation tokens");
    };

    let tokenBlob = await Random.blob();

    let token = InviteLinksModule.generateUUID(tokenBlob);

    let activationToken : ActivationToken = {
      token = token;
      userId = userId;
      admin = caller;
      createdAt = Time.now();
      redeemed = false;
      redeemedAt = null;
    };

    activationTokens.add(token, activationToken);
    token;
  };

  // Method for user to redeem their activation token
  public shared ({ caller }) func redeemActivationToken(token : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot redeem activation tokens");
    };

    switch (activationTokens.get(token)) {
      case (null) { Runtime.trap("Invalid activation token") };
      case (?activationToken) {
        if (activationToken.redeemed) {
          Runtime.trap("Activation token already redeemed");
        };

        if (caller != activationToken.userId) {
          Runtime.trap("Activation token not valid for this user");
        };

        let updatedToken = {
          activationToken with
          redeemed = true;
          redeemedAt = ?Time.now();
        };
        activationTokens.add(token, updatedToken);
        userActivations.add(caller, true);
      };
    };
  };

  // Query method to check caller activation status (with allowlist admin always activated)
  public query ({ caller }) func isCallerActivatedForVehicleRegistration() : async Bool {
    if (caller == allowlistAdmin) {
      // Always return true for the allowlist admin
      return true;
    };
    switch (userActivations.get(caller)) {
      case (null) { false }; // Not found means not activated
      case (?activated) { activated };
    };
  };

  // Vehicle registration now gated by activation status
  public shared ({ caller }) func registerVehicle(
    engineNumber : Text,
    chassisNumber : Text,
    brand : Text,
    model : Text,
    year : Nat,
    location : Text,
    vehiclePhoto : Storage.ExternalBlob,
  ) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot register vehicles");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can register vehicles");
    };

    // Check activation status (except for allowlist admin)
    if (not isCallerAllowlistAdmin(caller)) {
      switch (userActivations.get(caller)) {
        case (null) {
          Runtime.trap("Vehicle registration blocked: Account not activated. Please complete activation before registering vehicles.");
        };
        case (?activated) {
          if (not activated) {
            Runtime.trap("Vehicle registration blocked: Account not activated. Please complete activation before registering vehicles.");
          };
        };
      };
    };

    let id = engineNumber.concat(chassisNumber);
    switch (vehicleState.get(id)) {
      case (?_) { Runtime.trap("Vehicle already registered") };
      case null {};
    };

    let newVehicle : Vehicle = {
      id;
      owner = caller;
      engineNumber;
      chassisNumber;
      brand;
      model;
      year;
      location;
      vehiclePhoto;
      status = #ACTIVE;
      transferCode = null;
    };
    vehicleState.add(id, newVehicle);
    id;
  };

  public query ({ caller }) func getUserVehicles() : async [Vehicle] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view vehicles");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can view vehicles");
    };

    let iter = vehicleState.values();
    let filtered = iter.filter(func(vehicle : Vehicle) : Bool { vehicle.owner == caller });
    filtered.toArray();
  };

  public query ({ caller }) func getVehicle(vehicleId : Text) : async Vehicle {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view vehicle details");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can view vehicle details");
    };

    switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) { vehicle };
    };
  };

  // Vehicle check API that returns the status based on engine number
  // Public access for safety - anyone can check a vehicle's status
  public query func checkVehicle(engineNumber : Text) : async VehicleCheckStatus {
    switch (vehicleState.values().toArray().find(func(vehicle) { vehicle.engineNumber == engineNumber })) {
      case (null) { Runtime.trap("No vehicle matching engine number found") };
      case (?vehicle) {
        let statusNote = switch (vehicle.status) {
          case (#LOST(_)) { "Lost" };
          case (#STOLEN(_)) { "Stolen" };
          case (#PAWNED(_)) { "Pawned" };
          case (#FOUND(_)) { "Found" };
          case (#ACTIVE) { "Active" };
        };
        { vehicle; statusNote };
      };
    };
  };

  // Public access for community safety - anyone can see lost/stolen/pawned vehicles
  public query func getLostVehicles() : async [Vehicle] {
    let iter = vehicleState.values();
    let filtered = iter.filter(func(vehicle : Vehicle) : Bool {
      switch (vehicle.status) {
        case (#LOST(_)) { true };
        case (#STOLEN(_)) { true };
        case (#PAWNED(_)) { true };
        case _ { false };
      };
    });
    return filtered.toArray();
  };

  public shared ({ caller }) func markVehicleAsLostStolenOrPawned(
    vehicleId : Text,
    category : { #lost; #stolen; #pawned },
    reportNote : Text,
  ) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot report vehicle status");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can report vehicle status");
    };

    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) {
        // Ownership check
        if (vehicle.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can update vehicle status");
        };
        {
          vehicle with status = switch (category) {
            case (#lost) { #LOST({ reportNote; timeReported = Time.now() }) };
            case (#stolen) { #STOLEN({ reportNote; timeReported = Time.now() }) };
            case (#pawned) { #PAWNED({ reportNote; timeReported = Time.now() }) };
          }
        };
      };
    };
    vehicleState.add(vehicleId, vehicle);
  };

  public shared ({ caller }) func reportVehicleFound(vehicleId : Text, finderReport : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot report found vehicles");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can report found vehicles");
    };

    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) {
        switch (vehicle.status) {
          case (#LOST(_)) {};
          case (#STOLEN(_)) {};
          case (#PAWNED(_)) {};
          case _ { Runtime.trap("Vehicle is not marked as lost/stolen/pawned") };
        };
        let updatedVehicle = {
          id = vehicle.id;
          owner = vehicle.owner;
          engineNumber = vehicle.engineNumber;
          chassisNumber = vehicle.chassisNumber;
          brand = vehicle.brand;
          model = vehicle.model;
          year = vehicle.year;
          location = vehicle.location;
          vehiclePhoto = vehicle.vehiclePhoto;
          status = #FOUND({ finderReport; timeReported = Time.now(); foundBy = caller });
          transferCode = vehicle.transferCode;
        };

        notificationCounter += 1;
        let notificationId = notificationCounter.toText();
        let notification : Notification = {
          id = notificationId;
          recipient = vehicle.owner;
          message = "Your vehicle " # vehicleId # " has been reported as found";
          timestamp = Time.now();
          read = false;
          vehicleId = vehicleId;
        };
        notifications.add(notificationId, notification);

        updatedVehicle;
      };
    };
    vehicleState.add(vehicleId, vehicle);
  };

  // --------------------------------- New Feature: Vehicle Ownership Revocation  ---------------------------------
  public shared ({ caller }) func revokeVehicleOwnership(vehicleId : Text, pin : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot revoke vehicle ownership");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can revoke vehicle ownership");
    };

    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) {
        // Ownership check
        if (vehicle.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can revoke their vehicle ownership");
        };

        // PIN check (trap on missing PIN so message is clear)
        let pinCheckResult = switch (userPINs.get(caller)) {
          case (null) { Runtime.trap("No PIN set for this user. Please set up a PIN to revoke vehicle ownership."); };
          case (?storedPin) { storedPin == pin };
        };

        if (not pinCheckResult) {
          Runtime.trap("Incorrect PIN");
        };

        // Transfer code check (allow null or otherwise, always clear)
        let clearedVehicle = {
          vehicle with
          owner = Principal.fromText("2vxsx-fae");
          transferCode = null; // Always clear existing transfer code
        };
        clearedVehicle;
      };
    };
    vehicleState.add(vehicleId, vehicle);
  };

  // --------------------------------- Notifications ---------------------------------
  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot view notifications");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can view notifications");
    };

    let iter = notifications.values();
    let filtered = iter.filter(func(notif : Notification) : Bool { notif.recipient == caller });
    filtered.toArray();
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot mark notifications as read");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can mark notifications as read");
    };

    switch (notifications.get(notificationId)) {
      case null { Runtime.trap("Notification not found") };
      case (?notif) {
        if (notif.recipient != caller) {
          Runtime.trap("Unauthorized: Only the recipient can mark this notification as read");
        };
        let updatedNotif = {
          id = notif.id;
          recipient = notif.recipient;
          message = notif.message;
          timestamp = notif.timestamp;
          read = true;
          vehicleId = notif.vehicleId;
        };
        notifications.add(notificationId, updatedNotif);
      };
    };
  };

  // --------------------------------- Transfer System ---------------------------------
  public shared ({ caller }) func initiateTransfer(vehicleId : Text, pin : Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot initiate transfers");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can initiate transfers");
    };

    if (not verifyPIN(caller, pin)) {
      Runtime.trap("Incorrect PIN");
    };

    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) {
        // Ownership check
        if (vehicle.owner != caller) {
          Runtime.trap("Unauthorized: Only the owner can transfer their vehicle");
        };
        let timestamp = Int.abs(Time.now()).toText();
        let transferCode = vehicleId.concat("-").concat(timestamp);

        {
          id = vehicle.id;
          owner = vehicle.owner;
          engineNumber = vehicle.engineNumber;
          chassisNumber = vehicle.chassisNumber;
          brand = vehicle.brand;
          model = vehicle.model;
          year = vehicle.year;
          location = vehicle.location;
          vehiclePhoto = vehicle.vehiclePhoto;
          status = vehicle.status;
          transferCode = ?transferCode;
        };
      };
    };
    vehicleState.add(vehicleId, vehicle);
    switch (vehicle.transferCode) {
      case (null) { Runtime.trap("Transfer code generation failed") };
      case (?code) { code };
    };
  };

  public shared ({ caller }) func acceptTransfer(transferCode : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot accept transfers");
    };

    if (not hasUserPermission(caller)) {
      Runtime.trap("Unauthorized: Only onboarded users can accept transfers");
    };

    switch (vehicleState.values().toArray().find(func(v) { switch (v.transferCode) { case (?code) { code == transferCode }; case null { false } } })) {
      case (null) { Runtime.trap("Invalid or expired transfer code") };
      case (?vehicle) {
        let newVehicle = {
          id = vehicle.id;
          owner = caller;
          engineNumber = vehicle.engineNumber;
          chassisNumber = vehicle.chassisNumber;
          brand = vehicle.brand;
          model = vehicle.model;
          year = vehicle.year;
          location = vehicle.location;
          vehiclePhoto = vehicle.vehiclePhoto;
          status = vehicle.status;
          transferCode = null;
        };
        vehicleState.add(vehicle.id, newVehicle);
      };
    };
  };

  // --------------------------------- Admin Functions ---------------------------------
  public query ({ caller }) func getRegisteredVehicles() : async [Vehicle] {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all vehicles");
    };
    vehicleState.values().toArray();
  };

  public shared ({ caller }) func adminUpdateVehicleStatus(vehicleId : Text, newStatus : VehicleStatus) : async () {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can update vehicle status");
    };
    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Vehicle not found") };
      case (?vehicle) {
        {
          id = vehicle.id;
          owner = vehicle.owner;
          engineNumber = vehicle.engineNumber;
          chassisNumber = vehicle.chassisNumber;
          brand = vehicle.brand;
          model = vehicle.model;
          year = vehicle.year;
          location = vehicle.location;
          vehiclePhoto = vehicle.vehiclePhoto;
          status = newStatus;
          transferCode = vehicle.transferCode;
        };
      };
    };
    vehicleState.add(vehicleId, vehicle);
  };

  public query ({ caller }) func getSystemStats() : async {
    totalVehicles : Nat;
    totalLostReports : Nat;
    totalStolenReports : Nat;
    totalPawnedReports : Nat;
    totalFoundReports : Nat;
    totalUsers : Nat;
  } {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view system stats");
    };
    let vehicles = vehicleState.values().toArray();
    let totalVehicles = vehicles.size();

    let lostCount = vehicles.filter(
      func(v : Vehicle) : Bool {
        switch (v.status) {
          case (#LOST(_)) { true };
          case _ { false };
        };
      }
    ).size();

    let stolenCount = vehicles.filter(
      func(v : Vehicle) : Bool {
        switch (v.status) {
          case (#STOLEN(_)) { true };
          case _ { false };
        };
      }
    ).size();

    let pawnedCount = vehicles.filter(
      func(v : Vehicle) : Bool {
        switch (v.status) {
          case (#PAWNED(_)) { true };
          case _ { false };
        };
      }
    ).size();

    let foundCount = vehicles.filter(
      func(v : Vehicle) : Bool {
        switch (v.status) {
          case (#FOUND(_)) { true };
          case _ { false };
        };
      }
    ).size();

    let totalUsers = userProfiles.size();

    {
      totalVehicles = totalVehicles;
      totalLostReports = lostCount;
      totalStolenReports = stolenCount;
      totalPawnedReports = pawnedCount;
      totalFoundReports = foundCount;
      totalUsers = totalUsers;
    };
  };

  public query ({ caller }) func getInviteTokenReport() : async {
    totalGenerated : Nat;
    totalUsed : Nat;
  } {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Only admins can view invite token reports");
    };
    let totalGenerated = InviteLinksModule.getInviteCodes(inviteState).size();
    let totalUsed = usedInviteTokens.size();

    {
      totalGenerated = totalGenerated;
      totalUsed = totalUsed;
    };
  };

  // --------------------------------- Is Onboarding Allowed ---------------------------------
  public query ({ caller }) func isOnboardingAllowed() : async Bool {
    // Any authenticated (non-anonymous) principal can onboard
    if (caller.isAnonymous()) {
      return false;
    };
    true;
  };

  // --------------------------------- Internal Allowlist Check ---------------------------------
  public query ({ caller }) func isAllowlistAdmin() : async Bool {
    isCallerAllowlistAdmin(caller);
  };

  // --------------------------------- Backend Health Diagnostics ---------------------------------
  public query func getBackendDiagnostics() : async {
    build : Text;
    time : Time.Time;
  } {
    {
      build = "v0.1.4";
      time = Time.now();
    };
  };
};
