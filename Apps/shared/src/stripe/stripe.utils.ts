export function isProductId(item: string): boolean {
    const isProductId = /^prod_[A-Za-z0-9]+$/.test(item);
    return isProductId;
}
