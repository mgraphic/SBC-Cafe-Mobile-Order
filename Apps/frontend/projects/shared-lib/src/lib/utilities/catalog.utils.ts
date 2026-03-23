export function convertUnitPrice(price: number | string): number {
  return Number(price) / 100;
}
