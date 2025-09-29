"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus, TrendingUp, Building2, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AddStockDialogProps {
  onAddStock: (stock: StockData) => void
}

interface StockData {
  symbol: string
  name: string
  currentPrice: number
  changePercent: number
  type: 'stock' | 'fund' | 'forex'
  currency: string
}

export function AddStockDialog({ onAddStock }: AddStockDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const determineStockType = (symbol: string, name: string): 'stock' | 'fund' | 'forex' => {
    const upperSymbol = symbol.toUpperCase()
    const upperName = name.toUpperCase()

    // Japanese fund codes (8 digits)
    if (/^\d{8}$/.test(symbol)) {
      return 'fund'
    }

    // Forex pairs
    if (upperSymbol.includes('=X') || upperSymbol.includes('USD') ||
        upperSymbol.includes('EUR') || upperSymbol.includes('GBP') ||
        upperSymbol.includes('JPY') || upperSymbol.includes('CAD')) {
      return 'forex'
    }

    // Fund keywords (including Japanese terms)
    if (upperName.includes('FUND') || upperName.includes('ETF') ||
        upperName.includes('INDEX') || upperName.includes('TRUST') ||
        upperSymbol.includes('FUND') || upperSymbol.includes('ETF') ||
        upperName.includes('投資信託') || upperName.includes('ファンド') ||
        upperName.includes('EMAXIS') || upperName.includes('基準価額')) {
      return 'fund'
    }

    // Default to stock
    return 'stock'
  }

  const formatSymbol = (query: string): string => {
    const trimmedQuery = query.trim()

    // Check if it's a 4-digit number (Japanese stock)
    if (/^\d{4}$/.test(trimmedQuery)) {
      return `${trimmedQuery}.T`
    }

    return trimmedQuery.toUpperCase()
  }

  const searchStock = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError("")

    try {
      const formattedSymbol = formatSymbol(query)
      const response = await fetch(`/api/stock/${formattedSymbol}`)

      if (!response.ok) {
        throw new Error('Stock not found')
      }

      const data = await response.json()

      // Debug logging
      console.log('API Response:', data)
      console.log('Detected type:', data.type || determineStockType(data.symbol, data.name))

      const stockData: StockData = {
        symbol: data.symbol,
        name: data.name,
        currentPrice: data.currentPrice,
        changePercent: data.changePercent || 0,
        type: data.type || determineStockType(data.symbol, data.name),
        currency: data.currency || 'USD'
      }

      console.log('Final stockData:', stockData)

      setSearchResults([stockData])
    } catch (err) {
      setError('Stock not found. Please check the symbol and try again.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearch = () => {
    searchStock(searchQuery)
  }

  const handleAddStock = (stock: StockData) => {
    onAddStock(stock)
    setOpen(false)
    setSearchQuery("")
    setSearchResults([])
    setError("")
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <TrendingUp className="h-4 w-4" />
      case 'fund':
        return <Building2 className="h-4 w-4" />
      case 'forex':
        return <DollarSign className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stock':
        return 'Stock'
      case 'fund':
        return 'Fund'
      case 'forex':
        return 'Forex'
      default:
        return 'Stock'
    }
  }

  const formatPrice = (price: number | undefined, currency: string) => {
    if (!price) return 'N/A'

    switch (currency) {
      case 'JPY':
        return `¥${price.toFixed(0)}`
      case 'USD':
        return `$${price.toFixed(2)}`
      default:
        return `${currency} ${price.toFixed(2)}`
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
          <DialogDescription>
            Search for stocks, funds, or forex pairs to add to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right">
              Symbol
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="symbol"
                placeholder="e.g., AAPL, TSLA, 7974 (日股), EURUSD=X"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center py-2">
              {error}
            </div>
          )}

          {isSearching && (
            <div className="text-sm text-gray-600 text-center py-4">
              Searching...
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search Results:</Label>
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAddStock(stock)}
                >
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(stock.type)}
                    <div>
                      <div className="font-medium text-sm">{stock.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{stock.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(stock.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {formatPrice(stock.currentPrice, stock.currency)}
                    </div>
                    <div className={`text-xs ${
                      (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(stock.changePercent || 0) >= 0 ? '+' : ''}
                      {stock.changePercent?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}