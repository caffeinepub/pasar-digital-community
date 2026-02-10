import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";
import Int "mo:core/Int";
import Random "mo:core/Random";
import MixinAuthorization "authorization/MixinAuthorization";
import InviteLinksModule "invite-links/invite-links-module";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Include Authorization (handles getCallerUserProfile & saveCallerUserProfile)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage for image/files
  include MixinStorage();

  // Invite links component
  let inviteState = InviteLinksModule.initState();

  // User profile type
  public type UserProfile = {
    fullName : Text;
    email : Text;
    city : Text;
    country : Text;
    onboarded : Bool;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // PIN system
  let userPINs = Map.empty<Principal, Text>();

  // Notification system
  type Notification = {
    id : Text;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
    read : Bool;
    vehicleId : Text;
  };
  let notifications = Map.empty<Text, Notification>();
  var notificationCounter : Nat = 0;

  // Vehicle system
  type VehicleStatus = {
    #LOST : { reportNote : Text; timeReported : Time.Time };
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

  let vehicleState = Map.empty<Text, Vehicle>();
  let usedInviteTokens = Map.empty<Text, Principal>();

  //---------------------- Prefab Invite Links API (DO NOT REMOVE: router dependency) ----------------------

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };

    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);

    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // ---------------------- Onboarding ----------------------

  public shared ({ caller }) func completeOnboarding(inviteToken : Text, profile : UserProfile) : async () {
    // Validate invite code
    let inviteCodes = InviteLinksModule.getInviteCodes(inviteState);
    switch (inviteCodes.find(func(code) { code.code == inviteToken })) {
      case (null) { Runtime.trap("Invalid or expired invitation token") };
      case (?_code) {
        switch (usedInviteTokens.get(inviteToken)) {
          case (?_) { Runtime.trap("Invitation token already used") };
          case null {};
        };
      };
    };

    switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        if (existingProfile.onboarded) {
          Runtime.trap("Already onboarded");
        };
      };
      case null {};
    };

    usedInviteTokens.add(inviteToken, caller);

    AccessControl.assignRole(accessControlState, caller, caller, #user);

    let onboardedProfile = {
      fullName = profile.fullName;
      email = profile.email;
      city = profile.city;
      country = profile.country;
      onboarded = true;
    };
    userProfiles.add(caller, onboardedProfile);
  };

  // ---------------------- PIN Management ----------------------

  public shared ({ caller }) func setupPIN(pin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can setup PIN");
    };
    userPINs.add(caller, pin);
  };

  public shared ({ caller }) func updatePIN(oldPin : Text, newPin : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update PIN");
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

  // ---------------------- Vehicle Registration ----------------------

  public shared ({ caller }) func registerVehicle(
    engineNumber : Text,
    chassisNumber : Text,
    brand : Text,
    model : Text,
    year : Nat,
    location : Text,
    vehiclePhoto : Storage.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can register vehicles");
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can view vehicles");
    };
    let iter = vehicleState.values();
    let filtered = iter.filter(func(vehicle : Vehicle) : Bool { vehicle.owner == caller });
    filtered.toArray();
  };

  public query ({ caller }) func getVehicle(vehicleId : Text) : async Vehicle {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can view vehicles");
    };
    switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Not found") };
      case (?vehicle) { vehicle };
    };
  };

  // ---------------------- Lost/Found Vehicles ----------------------

  public query ({ caller }) func getLostVehicles() : async [Vehicle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can view lost vehicles");
    };
    let iter = vehicleState.values();
    let filtered = iter.filter(func(vehicle : Vehicle) : Bool {
      switch (vehicle.status) {
        case (#LOST(_)) { true };
        case _ { false };
      };
    });
    filtered.toArray();
  };

  public shared ({ caller }) func markVehicleLost(vehicleId : Text, reportNote : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can mark as lost");
    };
    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Not found") };
      case (?vehicle) {
        if (vehicle.owner != caller) {
          Runtime.trap("Only the owner can mark as lost");
        };
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
          status = #LOST({ reportNote; timeReported = Time.now() });
          transferCode = vehicle.transferCode;
        };
      };
    };
    vehicleState.add(vehicleId, vehicle);
  };

  public shared ({ caller }) func reportVehicleFound(vehicleId : Text, finderReport : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can report found vehicles");
    };
    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Not found") };
      case (?vehicle) {
        switch (vehicle.status) {
          case (#LOST(_)) {};
          case _ { Runtime.trap("Not lost") };
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

  // ---------------------- Notifications ----------------------

  public query ({ caller }) func getMyNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can view notifications");
    };
    let iter = notifications.values();
    let filtered = iter.filter(func(notif : Notification) : Bool { notif.recipient == caller });
    filtered.toArray();
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can mark as read");
    };
    switch (notifications.get(notificationId)) {
      case null { Runtime.trap("Not found") };
      case (?notif) {
        if (notif.recipient != caller) {
          Runtime.trap("Only the recipient can mark as read");
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

  // ---------------------- Transfer System ----------------------

  public shared ({ caller }) func initiateTransfer(vehicleId : Text, pin : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can initiate transfers");
    };
    if (not verifyPIN(caller, pin)) {
      Runtime.trap("Incorrect PIN");
    };
    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Not found") };
      case (?vehicle) {
        if (vehicle.owner != caller) {
          Runtime.trap("Only the owner can transfer");
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
      case (null) { Runtime.trap("Unexpected") };
      case (?code) { code };
    };
  };

  public shared ({ caller }) func acceptTransfer(transferCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can accept transfers");
    };
    func optMatch(v : ?Vehicle) : Bool { false };
    switch (vehicleState.values().toArray().find(func(v) { switch (v.transferCode) { case (?code) { code == transferCode }; case null { false } } })) {
      case (null) { Runtime.trap("Not found") };
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

  // ---------------------- Admin Functions ----------------------

  public query ({ caller }) func getRegisteredVehicles() : async [Vehicle] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can view all vehicles");
    };
    vehicleState.values().toArray();
  };

  public shared ({ caller }) func adminUpdateVehicleStatus(vehicleId : Text, newStatus : VehicleStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can update vehicle status");
    };
    let vehicle = switch (vehicleState.get(vehicleId)) {
      case (null) { Runtime.trap("Not found") };
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
    totalFoundReports : Nat;
    totalUsers : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can view stats");
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
      totalFoundReports = foundCount;
      totalUsers = totalUsers;
    };
  };

  public query ({ caller }) func getInviteTokenReport() : async {
    totalGenerated : Nat;
    totalUsed : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can view reports");
    };
    let totalGenerated = InviteLinksModule.getInviteCodes(inviteState).size();
    let totalUsed = usedInviteTokens.size();

    {
      totalGenerated = totalGenerated;
      totalUsed = totalUsed;
    };
  };
};
