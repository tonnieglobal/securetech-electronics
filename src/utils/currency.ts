/**
 * Currency utility for Nigerian Naira (NGN - ₦)
 */

export const CURRENCY_SYMBOL = '₦';
export const CURRENCY_CODE = 'NGN';

export function formatNaira(amount: number, includeDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${CURRENCY_SYMBOL}0`;
  }
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  })}`;
}
