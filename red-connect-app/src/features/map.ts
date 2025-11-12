import { Donor, Location } from "./types";

export function distanceKm(a: Location, b: Location): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function filterNearbyDonors(donors: Donor[], center: Location, radiusKm: number, bloodType?: string): Donor[] {
  return donors.filter((d) => {
    if (!d.location) return false;
    if (bloodType && d.bloodType !== bloodType) return false;
    return distanceKm(center, d.location) <= radiusKm;
  });
}

