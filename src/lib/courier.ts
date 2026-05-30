export type Zone = "Inside Dhaka" | "Sub-Dhaka" | "Outside Dhaka";

export const ZONES: Zone[] = ["Inside Dhaka", "Sub-Dhaka", "Outside Dhaka"];

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


export interface CourierRateSlab {
  id: string;
  courier_name: string;
  zone: string;
  min_weight: number;
  max_weight: number;
  price: number;
  cod_percent: number;
  cod_fixed_fee: number;
  estimated_delivery_time: string | null;
  notes: string | null;
  source_url: string | null;
  last_verified_date: string | null;
  active: boolean;
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
}

/**
 * Slab-based pricing engine. For each courier in the selected zone, picks the
 * slab where: min_weight < weight <= max_weight (with min=0 inclusive).
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
    const slab = sorted.find((s) => {
      const min = Number(s.min_weight);
      const max = Number(s.max_weight);
      if (min === 0) return input.weight >= 0 && input.weight <= max;
      return input.weight > min && input.weight <= max;
    });
    if (!slab) continue;

    const deliveryCharge = Number(slab.price) || 0;
    const percentFee = (input.codAmount * Number(slab.cod_percent || 0)) / 100;
    const codFee = Math.max(Number(slab.cod_fixed_fee) || 0, percentFee);
    const total = deliveryCharge + codFee;

    results.push({
      courier_name: courier,
      slab,
      deliveryCharge,
      codFee: Math.round(codFee * 100) / 100,
      total: Math.round(total * 100) / 100,
      weightRangeLabel: `${slab.min_weight}–${slab.max_weight} kg slab`,
    });
  }

  return results.sort((a, b) => a.total - b.total);
}


