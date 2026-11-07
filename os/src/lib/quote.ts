import type { QuotationItem, QuotationTotals } from "./types";

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Same formula as the database view `quotation_totals`, used for the live
 * preview while editing. The saved numbers always come from the database.
 */
export function calcTotals(
  items: Pick<QuotationItem, "quantity" | "unit_price">[],
  discountType: "amount" | "percent",
  discountValue: number,
  taxRate: number,
): QuotationTotals {
  const subtotal = r2(items.reduce((s, i) => s + r2((Number(i.quantity) || 0) * (Number(i.unit_price) || 0)), 0));
  const rawDiscount =
    discountType === "percent" ? r2((subtotal * Math.min(Number(discountValue) || 0, 100)) / 100) : Number(discountValue) || 0;
  const discount = Math.min(subtotal, rawDiscount);
  const taxable = subtotal - discount;
  const rate = Number(taxRate) || 0;
  return { subtotal, discount: r2(discount), tax: r2((taxable * rate) / 100), total: r2(taxable * (1 + rate / 100)) };
}
