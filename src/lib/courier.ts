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

export interface CourierRate {
  id: string;
  courier_name: string;
  zone: string;
  base_weight_limit: number;
  base_price: number;
  extra_kg_price: number;
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

export interface QuoteResult {
  rate: CourierRate;
  deliveryCharge: number;
  extraWeightCharge: number;
  codFee: number;
  total: number;
}

export function computeQuote(rate: CourierRate, input: QuoteInput): QuoteResult {
  const deliveryCharge = Number(rate.base_price) || 0;
  const overWeight = Math.max(0, input.weight - Number(rate.base_weight_limit || 0));
  const extraWeightCharge = Math.ceil(overWeight) * (Number(rate.extra_kg_price) || 0);
  const percentFee = (input.codAmount * Number(rate.cod_percent || 0)) / 100;
  const codFee = Math.max(Number(rate.cod_fixed_fee) || 0, percentFee);
  const total = deliveryCharge + extraWeightCharge + codFee;
  return {
    rate,
    deliveryCharge,
    extraWeightCharge,
    codFee: Math.round(codFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function rankQuotes(rates: CourierRate[], input: QuoteInput): QuoteResult[] {
  return rates
    .filter((r) => r.zone === input.zone && r.active)
    .map((r) => computeQuote(r, input))
    .sort((a, b) => a.total - b.total);
}

export const ADMIN_PASSPHRASE_FALLBACK = "courierwise-admin";
