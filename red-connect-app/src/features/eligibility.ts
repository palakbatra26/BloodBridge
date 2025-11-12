import { Donor } from "./types";

const MIN_DAYS_BETWEEN_DONATIONS = 56;

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

export function computeNextEligibleDate(lastDonationDate?: string): string | undefined {
  if (!lastDonationDate) return undefined;
  const last = new Date(lastDonationDate);
  const next = new Date(last);
  next.setDate(next.getDate() + MIN_DAYS_BETWEEN_DONATIONS);
  return next.toISOString();
}

export function isEligible(donor: Donor, asOf: Date = new Date()): boolean {
  if (donor.available === false) return false;
  if (!donor.lastDonationDate) return true;
  const next = computeNextEligibleDate(donor.lastDonationDate);
  if (!next) return true;
  return new Date(next) <= asOf;
}

export function nextDonationHint(donor: Donor): string | undefined {
  const next = computeNextEligibleDate(donor.lastDonationDate);
  if (!next) return undefined;
  const d = new Date(next);
  return d.toLocaleDateString();
}

