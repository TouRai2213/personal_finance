export function formatPrice(price: number | undefined, currency?: string): string {
  if (price === undefined || price === null) return 'N/A'

  switch (currency) {
    case 'JPY':
      return `¥${price.toFixed(0)}`
    case 'USD':
      return `$${price.toFixed(2)}`
    case 'EUR':
      return `€${price.toFixed(2)}`
    case 'GBP':
      return `£${price.toFixed(2)}`
    default:
      // If no currency specified, assume USD
      return `$${price.toFixed(2)}`
  }
}

export function getCurrencyFromSymbol(symbol: string): string {
  // Japanese fund codes (8 digits)
  if (/^\d{8}$/.test(symbol)) {
    return 'JPY'
  }

  // Japanese stocks (ending with .T)
  if (symbol.endsWith('.T')) {
    return 'JPY'
  }

  // Add more market detection logic here if needed
  return 'USD'
}