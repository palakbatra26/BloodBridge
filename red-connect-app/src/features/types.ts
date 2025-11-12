export type BloodType =
  | "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+";

export interface Location {
  lat: number;
  lng: number;
}

export interface Donor {
  id: string;
  name: string;
  bloodType: BloodType;
  lastDonationDate?: string;
  location?: Location;
  available?: boolean;
}

export interface Recipient {
  id: string;
  name: string;
  requiredBloodType: BloodType;
  location?: Location;
}

export interface BloodRequest {
  id: string;
  hospital: string;
  bloodType: BloodType;
  unitsNeeded: number;
  location?: Location;
  timePosted?: string;
}

export interface RankedDonor extends Donor {
  score: number;
  distanceKm?: number;
  eligible: boolean;
  nextEligibleDate?: string;
}

