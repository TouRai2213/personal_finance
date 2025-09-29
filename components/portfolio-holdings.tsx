"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit3, X, Search, Plus, TrendingUp, Building2, DollarSign } from "lucide-react"

interface StockData {
  symbol: string
  name: string
  currentPrice: number
  changePercent: number
  type: 'stock' | 'fund' | 'forex'
  currency: string
  buyPrice?: number
  buyShares?: number
  sellPrice?: number
  sellShares?: number
}

interface PortfolioHoldingsProps {
  onStockClick?: (symbol: string, name: string) => void
  title?: string
  showEditButton?: boolean
}

export function PortfolioHoldings({ onStockClick, title = "Portfolio Holdings", showEditButton = true }: PortfolioHoldingsProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [funds, setFunds] = useState<StockData[]>([])
  const [forex, setForex] = useState<StockData[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Load portfolio data from server
  const loadPortfolioData = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setStocks(data.stocks || [])
        setFunds(data.funds || [])
        setForex(data.forex || [])
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error)
    }
  }

  // Save stock to server
  const saveStockToServer = async (stock: StockData) => {
    try {
      const response = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock })
      })
      return response.ok
    } catch (error) {
      console.error('Error saving stock:', error)
      return false
    }
  }

  // Remove stock from server
  const removeStockFromServer = async (symbol: string, type: 'stock' | 'fund' | 'forex') => {
    try {
      const response = await fetch('/api/portfolio/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, type })
      })
      return response.ok
    } catch (error) {
      console.error('Error removing stock:', error)
      return false
    }
  }

  // Load initial data
  useEffect(() => {
    loadPortfolioData()
  }, [])

  const determineStockType = (symbol: string, name: string): 'stock' | 'fund' | 'forex' => {
    const upperSymbol = symbol.toUpperCase()
    const upperName = name.toUpperCase()

    // Forex pairs
    if (upperSymbol.includes('=X') || upperSymbol.includes('USD') ||
        upperSymbol.includes('EUR') || upperSymbol.includes('GBP') ||
        upperSymbol.includes('JPY') || upperSymbol.includes('CAD')) {
      return 'forex'
    }

    // Fund keywords
    if (upperName.includes('FUND') || upperName.includes('ETF') ||
        upperName.includes('INDEX') || upperName.includes('TRUST') ||
        upperSymbol.includes('FUND') || upperSymbol.includes('ETF')) {
      return 'fund'
    }

    // Default to stock
    return 'stock'
  }

  const handleAddStock = async (newStock: StockData) => {
    // Check if already exists
    const allItems = [...stocks, ...funds, ...forex]
    if (allItems.some(item => item.symbol === newStock.symbol)) {
      return // Already exists, don't add
    }

    // Save to server first
    const success = await saveStockToServer(newStock)
    if (success) {
      // Update local state only if server save was successful
      switch (newStock.type) {
        case 'stock':
          setStocks(prev => [...prev, newStock])
          break
        case 'fund':
          setFunds(prev => [...prev, newStock])
          break
        case 'forex':
          setForex(prev => [...prev, newStock])
          break
      }

      // Clear search
      setSearchQuery("")
      setSearchResults([])
      setShowSearchResults(false)
    } else {
      // Show error message or retry logic
      console.error('Failed to add stock to server')
    }
  }

  const searchStock = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsSearching(true)
    setShowSearchResults(true)

    try {
      const response = await fetch(`/api/stock/${query.toUpperCase()}`)

      if (!response.ok) {
        throw new Error('Stock not found')
      }

      const data = await response.json()

      const stockData: StockData = {
        symbol: data.symbol,
        name: data.name,
        currentPrice: data.currentPrice,
        changePercent: data.changePercent || 0,
        type: determineStockType(data.symbol, data.name),
        currency: data.currency || 'USD'
      }

      setSearchResults([stockData])
    } catch (err) {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchStock(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchStock])

  const handleDeleteStock = async (symbol: string, type: 'stock' | 'fund' | 'forex') => {
    // Remove from server first
    const success = await removeStockFromServer(symbol, type)
    if (success) {
      // Update local state only if server deletion was successful
      switch (type) {
        case 'stock':
          setStocks(prev => prev.filter(stock => stock.symbol !== symbol))
          break
        case 'fund':
          setFunds(prev => prev.filter(fund => fund.symbol !== symbol))
          break
        case 'forex':
          setForex(prev => prev.filter(fx => fx.symbol !== symbol))
          break
      }
    } else {
      // Show error message or retry logic
      console.error('Failed to remove stock from server')
    }
  }

  const [editingPrices, setEditingPrices] = useState<{[key: string]: {buyPrice?: number, buyShares?: number, sellPrice?: number, sellShares?: number}}>({})

  const handlePriceChange = (symbol: string, fieldType: 'buyPrice' | 'buyShares' | 'sellPrice' | 'sellShares', value: string) => {
    const numValue = parseFloat(value)
    setEditingPrices(prev => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [fieldType]: isNaN(numValue) ? undefined : numValue
      }
    }))
  }

  const savePriceToServer = async (symbol: string, type: string, fieldType: 'buyPrice' | 'buyShares' | 'sellPrice' | 'sellShares', value: number | undefined) => {
    try {
      const response = await fetch('/api/portfolio/update-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, type, fieldType, value })
      })
      if (response.ok) {
        // Update local state
        if (type === 'stock') {
          setStocks(prev => prev.map(s =>
            s.symbol === symbol ? {...s, [fieldType]: value} : s
          ))
        } else if (type === 'fund') {
          setFunds(prev => prev.map(f =>
            f.symbol === symbol ? {...f, [fieldType]: value} : f
          ))
        } else if (type === 'forex') {
          setForex(prev => prev.map(f =>
            f.symbol === symbol ? {...f, [fieldType]: value} : f
          ))
        }
      }
    } catch (error) {
      console.error('Error saving price:', error)
    }
  }

  const renderStockItem = (stock: StockData) => (
    <div
      key={stock.symbol}
      className={`flex flex-col hover:bg-muted/50 p-2 rounded-md transition-colors ${isEditMode ? 'space-y-2' : ''}`}
    >
      <div className="flex items-center">
        <div
          className="space-y-1 flex-1 cursor-pointer"
          onClick={() => !isEditMode && onStockClick?.(stock.symbol, stock.name)}
        >
          <p className="text-sm font-medium leading-none">{stock.name}</p>
          <p className="text-sm text-muted-foreground">{stock.symbol}</p>
        </div>
        <div className="ml-auto font-medium w-24 text-right">
          <span className={stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}>
            {stock.changePercent >= 0 ? '+' : ''}${stock.currentPrice.toFixed(2)}
          </span>
        </div>
        <Badge variant="outline" className="ml-2">
          {stock.changePercent.toFixed(1)}%
        </Badge>
        {isEditMode && (
          <Button
            size="sm"
            variant="ghost"
            className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleDeleteStock(stock.symbol, stock.type)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {isEditMode && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground w-10">Buy:</span>
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={editingPrices[stock.symbol]?.buyPrice ?? stock.buyPrice ?? ''}
                onChange={(e) => handlePriceChange(stock.symbol, 'buyPrice', e.target.value)}
                onBlur={(e) => savePriceToServer(stock.symbol, stock.type, 'buyPrice', parseFloat(e.target.value) || undefined)}
                className="h-7 w-20 text-xs"
              />
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                step="1"
                placeholder="Shares"
                value={editingPrices[stock.symbol]?.buyShares ?? stock.buyShares ?? ''}
                onChange={(e) => handlePriceChange(stock.symbol, 'buyShares', e.target.value)}
                onBlur={(e) => savePriceToServer(stock.symbol, stock.type, 'buyShares', parseFloat(e.target.value) || undefined)}
                className="h-7 w-16 text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground w-10">Sell:</span>
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={editingPrices[stock.symbol]?.sellPrice ?? stock.sellPrice ?? ''}
                onChange={(e) => handlePriceChange(stock.symbol, 'sellPrice', e.target.value)}
                onBlur={(e) => savePriceToServer(stock.symbol, stock.type, 'sellPrice', parseFloat(e.target.value) || undefined)}
                className="h-7 w-20 text-xs"
              />
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                step="1"
                placeholder="Shares"
                value={editingPrices[stock.symbol]?.sellShares ?? stock.sellShares ?? ''}
                onChange={(e) => handlePriceChange(stock.symbol, 'sellShares', e.target.value)}
                onBlur={(e) => savePriceToServer(stock.symbol, stock.type, 'sellShares', parseFloat(e.target.value) || undefined)}
                className="h-7 w-16 text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

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

  const renderSearchResult = (stock: StockData) => (
    <div
      key={stock.symbol}
      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border rounded-lg"
      onClick={() => handleAddStock(stock)}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
          <Plus className="h-3 w-3 text-green-600" />
        </div>
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
          ${stock.currentPrice?.toFixed(2) || 'N/A'}
        </div>
        <div className={`text-xs ${
          (stock.changePercent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {(stock.changePercent || 0) >= 0 ? '+' : ''}
          {stock.changePercent?.toFixed(2) || '0.00'}%
        </div>
      </div>
    </div>
  )

  const filterItems = (items: StockData[]) => {
    if (!searchQuery || showSearchResults) return items
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const renderSection = (title: string, emoji: string, items: StockData[], type: string) => {
    const filteredItems = filterItems(items)

    return (
      <div>
        <h3 className="text-sm font-medium mb-3 bg-gray-100 px-3 py-2 rounded-md">
          {emoji} {title}
        </h3>
        <div className="space-y-2">
          {filteredItems.length > 0 ? (
            filteredItems.map(renderStockItem)
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              {searchQuery ? `No ${title.toLowerCase()} found matching "${searchQuery}"` : `No ${title.toLowerCase()} added yet`}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {showEditButton && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button
            size="sm"
            variant={isEditMode ? "default" : "outline"}
            onClick={() => setIsEditMode(!isEditMode)}
            className="h-8"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            {isEditMode ? "Done" : "Edit"}
          </Button>
        </div>
      )}

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search to add stocks, funds, or forex..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="space-y-2">
          {isSearching ? (
            <div className="text-sm text-gray-600 text-center py-4">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Search Results:</div>
              {searchResults.map(renderSearchResult)}
            </div>
          ) : searchQuery && (
            <div className="text-sm text-gray-600 text-center py-4 border rounded-lg">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}

      {/* Portfolio Sections */}
      {!showSearchResults && (
        <div className="space-y-6">
          {renderSection("Stocks", "📈", stocks, "stocks")}
          {renderSection("Funds", "🏦", funds, "funds")}
          {renderSection("Forex", "💱", forex, "forex")}
        </div>
      )}
    </div>
  )
}