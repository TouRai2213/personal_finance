"use client"

import { useState, useEffect } from "react"
import { AddStockDialog } from "@/components/add-stock-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit3, X, Search } from "lucide-react"

interface StockData {
  symbol: string
  name: string
  currentPrice: number
  changePercent: number
  type: 'stock' | 'fund' | 'forex'
  currency: string
}

interface PortfolioHoldingsProps {
  onStockClick?: (stockName: string) => void
  title?: string
  showEditButton?: boolean
}

export function PortfolioHoldings({ onStockClick, title = "Portfolio Holdings", showEditButton = true }: PortfolioHoldingsProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [funds, setFunds] = useState<StockData[]>([])
  const [forex, setForex] = useState<StockData[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Load initial data
  useEffect(() => {
    // You can add some default stocks here or load from localStorage
    const defaultStocks: StockData[] = [
      {
        symbol: "AAPL",
        name: "Apple Inc",
        currentPrice: 120.50,
        changePercent: 15.2,
        type: "stock",
        currency: "USD"
      },
      {
        symbol: "TSLA",
        name: "Tesla Stock",
        currentPrice: 2400.00,
        changePercent: 54.6,
        type: "stock",
        currency: "USD"
      },
      {
        symbol: "MSFT",
        name: "Microsoft",
        currentPrice: 1200.00,
        changePercent: 27.3,
        type: "stock",
        currency: "USD"
      }
    ]
    setStocks(defaultStocks)
  }, [])

  const handleAddStock = (newStock: StockData) => {
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
  }

  const handleDeleteStock = (symbol: string, type: 'stock' | 'fund' | 'forex') => {
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
  }

  const renderStockItem = (stock: StockData) => (
    <div
      key={stock.symbol}
      className="flex items-center hover:bg-muted/50 p-2 rounded-md transition-colors"
    >
      <div
        className="space-y-1 flex-1 cursor-pointer"
        onClick={() => !isEditMode && onStockClick?.(stock.name)}
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
  )

  const filterItems = (items: StockData[]) => {
    if (!searchQuery) return items
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
          placeholder="Search stocks, funds, or forex..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <AddStockDialog onAddStock={handleAddStock} />
        </div>
      </div>

      {/* Portfolio Sections */}
      <div className="space-y-6">
        {renderSection("Stocks", "📈", stocks, "stocks")}
        {renderSection("Funds", "🏦", funds, "funds")}
        {renderSection("Forex", "💱", forex, "forex")}
      </div>
    </div>
  )
}