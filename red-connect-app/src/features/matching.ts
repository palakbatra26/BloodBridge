import { Donor, BloodRequest, RankedDonor, Location } from "./types";
import { isEligible, nextDonationHint } from "./eligibility";

function haversineDistanceKm(a: Location | undefined, b: Location | undefined): number | undefined {
  if (!a || !b) return undefined;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function bloodTypeCompatible(donorType: string, requestType: string): boolean {
  const compat: Record<string, string[]> = {
    "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "A-": ["A-", "A+", "AB-", "AB+"],
    "A+": ["A+", "AB+"],
    "B-": ["B-", "B+", "AB-", "AB+"],
    "B+": ["B+", "AB+"],
    "AB-": ["AB-", "AB+"],
    "AB+": ["AB+"],
  };
  return (compat[donorType] || []).includes(requestType);
}

export type RankingOptions = {
  maxDistanceKm?: number;
  distanceWeight?: number;
  typeWeight?: number;
  eligibilityWeight?: number;
};

const DEFAULT_OPTIONS: Required<RankingOptions> = {
  maxDistanceKm: 50,
  distanceWeight: 0.4,
  typeWeight: 0.4,
  eligibilityWeight: 0.2,
};

export function rankDonorsForRequest(
  donors: Donor[],
  request: BloodRequest,
  opts: RankingOptions = {}
): RankedDonor[] {
  const options = { ...DEFAULT_OPTIONS, ...opts };

  const ranked: RankedDonor[] = donors.map((donor) => {
    const distanceKm = haversineDistanceKm(donor.location, request.location);
    const distanceScore = distanceKm == null
      ? 0.5
      : Math.max(0, 1 - Math.min(distanceKm, options.maxDistanceKm) / options.maxDistanceKm);

    const compatible = bloodTypeCompatible(donor.bloodType, request.bloodType);
    const typeScore = compatible ? 1 : 0;

    const eligible = isEligible(donor);
    const eligibilityScore = eligible ? 1 : 0;

    const score =
      options.distanceWeight * distanceScore +
      options.typeWeight * typeScore +
      options.eligibilityWeight * eligibilityScore;

    return {
      ...donor,
      score,
      distanceKm,
      eligible,
      nextEligibleDate: nextDonationHint(donor),
    };
  });

  return ranked.sort((a, b) => b.score - a.score);
}

