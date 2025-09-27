"use client"

import { useState, useEffect } from "react"
import { AddStockDialog } from "@/components/add-stock-dialog"
import { Badge } from "@/components/ui/badge"

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
}

export function PortfolioHoldings({ onStockClick }: PortfolioHoldingsProps) {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [funds, setFunds] = useState<StockData[]>([])
  const [forex, setForex] = useState<StockData[]>([])

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

  const renderStockItem = (stock: StockData) => (
    <div
      key={stock.symbol}
      className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
      onClick={() => onStockClick?.(stock.name)}
    >
      <div className="space-y-1">
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
    </div>
  )

  const renderSection = (title: string, emoji: string, items: StockData[], type: string) => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium bg-gray-100 px-3 py-2 rounded-md flex-1">
          {emoji} {title}
        </h3>
        <AddStockDialog onAddStock={handleAddStock} />
      </div>
      <div className="space-y-8">
        {items.length > 0 ? (
          items.map(renderStockItem)
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No {title.toLowerCase()} added yet
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderSection("Stocks", "📈", stocks, "stocks")}
      {renderSection("Funds", "🏦", funds, "funds")}
      {renderSection("Forex", "💱", forex, "forex")}
    </div>
  )
}