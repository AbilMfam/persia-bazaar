/** محاسبهٔ درصد تخفیف برای نمایش در UI */
export function calcDiscount(price: number, oldPrice?: number): number | undefined {
  if (!oldPrice || oldPrice <= price) return undefined;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
