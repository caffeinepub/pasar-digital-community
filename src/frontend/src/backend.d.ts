import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export type VehicleStatus = {
    __kind__: "LOST";
    LOST: {
        timeReported: Time;
        reportNote: string;
    };
} | {
    __kind__: "FOUND";
    FOUND: {
        finderReport: string;
        timeReported: Time;
        foundBy: Principal;
    };
} | {
    __kind__: "ACTIVE";
    ACTIVE: null;
};
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export type Time = bigint;
export interface Notification {
    id: string;
    read: boolean;
    recipient: Principal;
    message: string;
    timestamp: Time;
    vehicleId: string;
}
export interface Vehicle {
    id: string;
    engineNumber: string;
    status: VehicleStatus;
    model: string;
    transferCode?: string;
    vehiclePhoto: ExternalBlob;
    owner: Principal;
    year: bigint;
    chassisNumber: string;
    brand: string;
    location: string;
}
export interface UserProfile {
    country: string;
    city: string;
    fullName: string;
    email: string;
    onboarded: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptTransfer(transferCode: string): Promise<void>;
    adminUpdateVehicleStatus(vehicleId: string, newStatus: VehicleStatus): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeOnboarding(inviteToken: string, profile: UserProfile): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getInviteTokenReport(): Promise<{
        totalGenerated: bigint;
        totalUsed: bigint;
    }>;
    getLostVehicles(): Promise<Array<Vehicle>>;
    getMyNotifications(): Promise<Array<Notification>>;
    getRegisteredVehicles(): Promise<Array<Vehicle>>;
    getSystemStats(): Promise<{
        totalLostReports: bigint;
        totalVehicles: bigint;
        totalFoundReports: bigint;
        totalUsers: bigint;
    }>;
    getUserVehicles(): Promise<Array<Vehicle>>;
    getVehicle(vehicleId: string): Promise<Vehicle>;
    initiateTransfer(vehicleId: string, pin: string): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationRead(notificationId: string): Promise<void>;
    markVehicleLost(vehicleId: string, reportNote: string): Promise<void>;
    registerVehicle(engineNumber: string, chassisNumber: string, brand: string, model: string, year: bigint, location: string, vehiclePhoto: ExternalBlob): Promise<string>;
    reportVehicleFound(vehicleId: string, finderReport: string): Promise<void>;
    setupPIN(pin: string): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updatePIN(oldPin: string, newPin: string): Promise<void>;
}
