import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  type Notification = {
    id : Text;
    recipient : Principal;
    message : Text;
    timestamp : Time.Time;
    read : Bool;
    vehicleId : Text;
  };

  type UserProfile = {
    fullName : Text;
    email : Text;
    city : Text;
    country : Text;
    onboarded : Bool;
  };

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

  type Actor = {
    var vehicleState : Map.Map<Text, Vehicle>;
    var notifications : Map.Map<Text, Notification>;
    var userProfiles : Map.Map<Principal, UserProfile>;
    var usedInviteTokens : Map.Map<Text, Principal>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
