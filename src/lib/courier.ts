export type Zone =
  | "Inside Dhaka"
  | "Dhaka Suburbs"
  | "Outside Dhaka"
  | "Outside Dhaka → Outside Dhaka";

export const ZONES: Zone[] = [
  "Inside Dhaka",
  "Dhaka Suburbs",
  "Outside Dhaka",
  "Outside Dhaka → Outside Dhaka",
];

export const COURIERS = ["Pathao", "REDX", "Steadfast", "Delivery Tiger"] as const;
export type CourierName = (typeof COURIERS)[number];

export const CITIES = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Khulna",
  "Rajshahi",
  "Barishal",
  "Rangpur",
  "Mymensingh",
  "Cumilla",
  "Narayanganj",
  "Gazipur",
  "Cox's Bazar",
  "Jessore",
  "Bogura",
  "Tangail",
];

export type VerificationStatus =
  | "VERIFIED"
  | "COMMUNITY_VERIFIED"
  | "ESTIMATED"
  | "OUTDATED"
  | "DISPUTED";

/** Numeric confidence 0..1. */
export type ConfidenceScore = number;

export type CanonicalZone =
  | "INSIDE_DHAKA"
  | "SUBURBAN"
  | "OUTSIDE_DHAKA"
  | "INTER_DISTRICT";

export const CANONICAL_ZONE_LABELS: Record<CanonicalZone, string> = {
  INSIDE_DHAKA: "Inside Dhaka",
  SUBURBAN: "Dhaka Suburbs",
  OUTSIDE_DHAKA: "Outside Dhaka",
  INTER_DISTRICT: "Outside Dhaka → Outside Dhaka",
};

export const VERIFICATION_STATUSES: VerificationStatus[] = [
  "VERIFIED",
  "COMMUNITY_VERIFIED",
  "ESTIMATED",
  "OUTDATED",
  "DISPUTED",
];

export interface CourierRateSlab {
  id: string;
  courier_name: string;
  zone: string;
  min_weight: number;
  max_weight: number;
  price: number;
  cod_percent: number;
  cod_fixed_fee: number;
  extra_kg_price: number;
  min_charge: number;
  estimated_delivery_time: string | null;
  notes: string | null;
  source_url: string | null;
  source_type: string | null;
  verification_status: VerificationStatus;
  confidence_score: ConfidenceScore;
  estimated_flag: boolean;
  verified_by: string | null;
  last_verified_date: string | null;
  last_verified_at: string | null;
  active: boolean;
  canonical_zone: CanonicalZone | string;
}

export interface QuoteInput {
  zone: string;
  weight: number;
  codAmount: number;
}

export interface SlabQuoteResult {
  courier_name: string;
  slab: CourierRateSlab;
  deliveryCharge: number;
  codFee: number;
  total: number;
  weightRangeLabel: string;
  /** True when computed by extrapolating beyond the largest published slab. */
  overflow: boolean;
}

/**
 * Slab-based pricing engine with dynamic extra-kg pricing and minimum-charge support.
 *
 * For each courier in the selected zone:
 *  - find slab where min_weight < weight <= max_weight (min=0 inclusive); OR
 *  - if weight exceeds every slab, use the largest slab + (weight - max) * extra_kg_price.
 *  - delivery charge = max(min_charge, slab price + overflow kg charge).
 *  - COD fee = max(cod_fixed_fee, codAmount * cod_percent / 100).
 *
 * Returns one result per courier, sorted cheapest first.
 */
export function rankSlabQuotes(
  slabs: CourierRateSlab[],
  input: QuoteInput,
): SlabQuoteResult[] {
  const byCourier = new Map<string, CourierRateSlab[]>();
  for (const s of slabs) {
    if (!s.active || s.zone !== input.zone) continue;
    if (!byCourier.has(s.courier_name)) byCourier.set(s.courier_name, []);
    byCourier.get(s.courier_name)!.push(s);
  }

  const results: SlabQuoteResult[] = [];
  for (const [courier, list] of byCourier) {
    const sorted = [...list].sort(
      (a, b) => Number(a.min_weight) - Number(b.min_weight),
    );

    let slab = sorted.find((s) => {
      const min = Number(s.min_weight);
      const max = Number(s.max_weight);
      if (min === 0) return input.weight >= 0 && input.weight <= max;
      return input.weight > min && input.weight <= max;
    });

    let overflow = false;
    let overflowCharge = 0;

    if (!slab) {
      const largest = sorted[sorted.length - 1];
      if (!largest) continue;
      const extra = Number(largest.extra_kg_price) || 0;
      if (extra <= 0) continue; // no way to extrapolate
      const overWeight = Math.max(0, input.weight - Number(largest.max_weight));
      overflowCharge = Math.ceil(overWeight) * extra;
      slab = largest;
      overflow = true;
    }

    const basePrice = Number(slab.price) || 0;
    const minCharge = Number(slab.min_charge) || 0;
    const deliveryCharge = Math.max(minCharge, basePrice + overflowCharge);

    let codFee = 0;
    if (input.codAmount > 0) {
      const percentFee = (input.codAmount * Number(slab.cod_percent || 0)) / 100;
      codFee = Math.max(Number(slab.cod_fixed_fee) || 0, percentFee);
    }
    const total = deliveryCharge + codFee;

    const weightRangeLabel = overflow
      ? `${slab.max_weight}+ kg (extrapolated)`
      : `${slab.min_weight}–${slab.max_weight} kg slab`;

    results.push({
      courier_name: courier,
      slab,
      deliveryCharge: Math.round(deliveryCharge * 100) / 100,
      codFee: Math.round(codFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      weightRangeLabel,
      overflow,
    });
  }

  return results.sort((a, b) => a.total - b.total);
}

export function confidenceLabel(slab: CourierRateSlab): {
  label: string;
  tone: "success" | "warning" | "muted";
} {
  const score = Number(slab.confidence_score) || 0;
  if (slab.verification_status === "VERIFIED") {
    return { label: "Verified", tone: "success" };
  }
  if (slab.verification_status === "COMMUNITY_VERIFIED") {
    return { label: "Community Verified", tone: "warning" };
  }
  if (slab.verification_status === "ESTIMATED" || slab.estimated_flag) {
    return { label: "Estimated", tone: "muted" };
  }
  if (slab.verification_status === "OUTDATED") {
    return { label: "Outdated", tone: "warning" };
  }
  if (slab.verification_status === "DISPUTED") {
    return { label: "Disputed", tone: "warning" };
  }
  return { label: score >= 0.5 ? "Likely accurate" : "Unverified", tone: "muted" };
}
