import { Coupon, ShippingRule } from '../types';

/**
 * Calculates the discount amount based on the provided coupon and subtotal.
 */
export const calculateDiscount = (subtotal: number, coupon: Coupon | null): number => {
  if (!coupon || !coupon.is_active) return 0;

  // Check if coupon meets minimum spend requirement
  if (subtotal < coupon.min_spend) return 0;
  
  // Check expiration
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return 0;
  
  // Check usage limits
  if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) return 0;

  if (coupon.discount_type === 'percentage') {
    return Number(((subtotal * coupon.discount_value) / 100).toFixed(2));
  }
  
  return Number(Math.min(subtotal, coupon.discount_value).toFixed(2));
};

/**
 * Calculates shipping cost based on the subtotal (after discount) and active shipping rules.
 */
export const calculateShipping = (orderTotal: number, rules: ShippingRule[]): number => {
  if (!rules || rules.length === 0) return 0;

  const activeRules = rules.filter(r => r.is_active);
  
  // Find the matching tier
  const matchingRule = activeRules.find(rule => {
    const meetsMin = orderTotal >= rule.min_order_value;
    const meetsMax = rule.max_order_value === null || orderTotal < rule.max_order_value;
    return meetsMin && meetsMax;
  });

  return matchingRule ? matchingRule.cost : 0;
};

/**
 * Calculates tax on the taxable amount (Subtotal - Discount).
 * Defaults to 18% GST.
 */
export const calculateTax = (taxableAmount: number, taxRatePercentage: number = 18): number => {
  if (taxableAmount <= 0) return 0;
  return Number(((taxableAmount * taxRatePercentage) / 100).toFixed(2));
};

/**
 * Comprehensive Order Totals Calculator
 */
export const calculateOrderTotals = (
  cartSubtotal: number, 
  coupon: Coupon | null, 
  shippingRules: ShippingRule[],
  taxRate: number = 18
) => {
  const discountAmount = calculateDiscount(cartSubtotal, coupon);
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  
  const taxAmount = calculateTax(taxableAmount, taxRate);
  const shippingAmount = calculateShipping(taxableAmount, shippingRules);
  
  const total = taxableAmount + taxAmount + shippingAmount;

  return {
    subtotal: cartSubtotal,
    discount_amount: discountAmount,
    taxable_amount: taxableAmount,
    tax_amount: taxAmount,
    shipping_amount: shippingAmount,
    total: Number(total.toFixed(2))
  };
};
