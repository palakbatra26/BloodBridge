import { BloodType } from "./types";

export interface DailyDemand {
  date: string;
  type: BloodType;
  units: number;
}

export interface ForecastResult {
  type: BloodType;
  next7DayAvg: number;
  trend: "up" | "down" | "flat";
  riskLevel: "low" | "medium" | "high";
}

export function forecastDemand(history: DailyDemand[], window = 7): ForecastResult[] {
  const byType: Record<BloodType, DailyDemand[]> = {
    "O-": [], "O+": [], "A-": [], "A+": [], "B-": [], "B+": [], "AB-": [], "AB+": [],
  } as Record<BloodType, DailyDemand[]>;

  for (const item of history) byType[item.type].push(item);

  const results: ForecastResult[] = [];

  (Object.keys(byType) as BloodType[]).forEach((type) => {
    const series = byType[type].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (series.length === 0) {
      results.push({ type, next7DayAvg: 0, trend: "flat", riskLevel: "low" });
      return;
    }

    const lastWindow = series.slice(-window);
    const prevWindow = series.slice(-window * 2, -window);

    const avg = (arr: DailyDemand[]) => arr.reduce((sum, x) => sum + x.units, 0) / (arr.length || 1);
    const lastAvg = avg(lastWindow);
    const prevAvg = avg(prevWindow);

    let trend: ForecastResult["trend"] = "flat";
    if (lastAvg > prevAvg * 1.1) trend = "up";
    else if (lastAvg < prevAvg * 0.9) trend = "down";

    let risk: ForecastResult["riskLevel"] = "low";
    if (trend === "up" && lastAvg >= 10) risk = "high";
    else if (trend === "up") risk = "medium";

    results.push({ type, next7DayAvg: Number(lastAvg.toFixed(2)), trend, riskLevel: risk });
  });

  return results;
}

