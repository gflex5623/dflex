export const CURRENCY_SYMBOLS = {
  USD: '$', NGN: '₦', GBP: '£', EUR: '€',
  GHS: 'GH₵', KES: 'KSh', ZAR: 'R', CAD: 'CA$',
  AUD: 'A$', AED: 'AED'
}

export function formatPrice(price, currency = 'USD') {
  if (price == null) return null
  const symbol = CURRENCY_SYMBOLS[currency] || currency + ' '
  return `${symbol}${price.toLocaleString()}`
}
