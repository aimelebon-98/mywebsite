export interface Bundle {
  id: string;
  name: string;
  nameFr?: string | null;
  description?: string | null;
  descriptionFr?: string | null;
  minItems: number;
  discountPercent: number;
  category?: string | null;
  active: boolean;
  priority: number;
}

export interface CartItemForBundle {
  quantity: number;
  category?: string;
}

// Given cart items, returns the best matching bundle (highest discount that applies)
export function findApplicableBundle(items: CartItemForBundle[], bundles: Bundle[]): Bundle | null {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const eligible = bundles.filter(b => {
    if (!b.active) return false;
    if (b.category) {
      const catQty = items.filter(i => i.category === b.category).reduce((s, i) => s + i.quantity, 0);
      return catQty >= b.minItems;
    }
    return totalQty >= b.minItems;
  });
  if (eligible.length === 0) return null;
  // Sort by best discount for user (highest %), then priority
  eligible.sort((a, b) => b.discountPercent - a.discountPercent || b.priority - a.priority);
  return eligible[0];
}

export function calcDiscount(subtotal: number, bundle: Bundle | null): number {
  if (!bundle) return 0;
  return Math.round(subtotal * bundle.discountPercent) / 100;
}
