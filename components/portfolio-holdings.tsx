"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit3, X, Search, Plus, TrendingUp, Building2, DollarSign } from "lucide-react"
import { formatPrice, getCurrencyFromSymbol } from "@/lib/currency"

interface Transaction {
  type: 'buy' | 'sell'
  price: number
  shares: number
  date: string
  id: string
}

interface StockData {
  symbol: string
  name: string
  currentPrice: number
  changePercent: number
  type: 'stock' | 'fund' | 'forex'
  currency: string
  transactions?: Transaction[]
  // Keep old fields for backward compatibility
  buyPrice?: number
  buyShares?: number
  buyDate?: string
  sellPrice?: number
  sellShares?: number
  sellDate?: string
}

interface PortfolioHoldingsProps {
  onStockClick?: (symbol: string, name: string, stockData: { transactions?: Transaction[]; buyPrice?: number; buyDate?: string; sellPrice?: number; sellDate?: string }) => void
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

  // Update real-time prices for all stocks
  const updateRealTimePrices = useCallback(async () => {
    console.log('Updating real-time prices...')
    const allItems = [...stocks, ...funds, ...forex]

    for (const item of allItems) {
      try {
        const response = await fetch(`/api/stock/${item.symbol}`)
        if (response.ok) {
          const data = await response.json()

          // Update the item with new price data
          const updatedItem = {
            ...item,
            currentPrice: data.currentPrice || item.currentPrice,
            changePercent: data.changePercent || ((data.currentPrice - data.previousClose) / data.previousClose * 100) || item.changePercent
          }

          // Update the appropriate state
          if (item.type === 'stock') {
            setStocks(prev => prev.map(s =>
              s.symbol === item.symbol ? updatedItem : s
            ))
          } else if (item.type === 'fund') {
            setFunds(prev => prev.map(f =>
              f.symbol === item.symbol ? updatedItem : f
            ))
          } else if (item.type === 'forex') {
            setForex(prev => prev.map(f =>
              f.symbol === item.symbol ? updatedItem : f
            ))
          }
        }
      } catch (error) {
        console.error(`Error updating price for ${item.symbol}:`, error)
      }
    }
  }, [stocks, funds, forex])

  // Save transactions to server
  const saveTransactionsToServer = async (symbol: string, transactions: Transaction[]) => {
    // Find the stock type
    let stockType = 'stock'
    const allStocks = stocks.concat(funds).concat(forex)
    const stock = allStocks.find(s => s.symbol === symbol)
    if (stock) {
      stockType = stock.type
    }

    try {
      const response = await fetch('/api/portfolio/update-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol, type: stockType, transactions })
      })

      if (response.ok) {
        // Update local state with server data
        if (stockType === 'stock') {
          setStocks(prev => prev.map(s =>
            s.symbol === symbol ? { ...s, transactions } : s
          ))
        } else if (stockType === 'fund') {
          setFunds(prev => prev.map(f =>
            f.symbol === symbol ? { ...f, transactions } : f
          ))
        } else if (stockType === 'forex') {
          setForex(prev => prev.map(f =>
            f.symbol === symbol ? { ...f, transactions } : f
          ))
        }
      } else {
        console.error('Failed to save transactions to server')
      }
    } catch (error) {
      console.error('Error saving transactions:', error)
    }
  }

  // Helper functions for transactions
  const generateTransactionId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  const calculatePositionAndPL = (stock: StockData) => {
    let totalBuyShares = 0
    let totalBuyValue = 0
    let totalSellShares = 0
    let totalSellValue = 0
    let avgBuyPrice = 0

    // Use new transactions array if available
    if (stock.transactions && stock.transactions.length > 0) {
      stock.transactions.forEach(transaction => {
        if (transaction.type === 'buy') {
          totalBuyShares += transaction.shares
          totalBuyValue += transaction.price * transaction.shares
        } else {
          totalSellShares += transaction.shares
          totalSellValue += transaction.price * transaction.shares
        }
      })
    } else {
      // Fallback to old single transaction fields
      if (stock.buyPrice && stock.buyShares) {
        totalBuyShares = stock.buyShares
        totalBuyValue = stock.buyPrice * stock.buyShares
      }
      if (stock.sellPrice && stock.sellShares) {
        totalSellShares = stock.sellShares
        totalSellValue = stock.sellPrice * stock.sellShares
      }
    }

    avgBuyPrice = totalBuyShares > 0 ? totalBuyValue / totalBuyShares : 0
    const currentShares = totalBuyShares - totalSellShares
    const currentValue = currentShares * stock.currentPrice
    const costBasis = currentShares > 0 ? (totalBuyValue - totalSellValue * (totalBuyValue / (totalBuyValue + totalSellValue))) : 0
    const unrealizedPL = currentValue - costBasis
    const realizedPL = totalSellValue - (totalSellShares * avgBuyPrice)

    return {
      totalBuyShares,
      totalSellShares,
      currentShares,
      avgBuyPrice,
      unrealizedPL,
      realizedPL,
      totalPL: unrealizedPL + realizedPL
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

  // Initialize editing transactions from existing data only once per stock
  useEffect(() => {
    const initTransactions: {[key: string]: Transaction[]} = {}
    const newlyInitialized = new Set<string>()
    const allStocks = stocks.concat(funds).concat(forex)

    allStocks.forEach(stock => {
      // Only initialize if we haven't initialized this stock yet
      if (initializedStocks.has(stock.symbol)) {
        return // Skip if already initialized
      }

      const transactions: Transaction[] = []

      // Use server transactions if available
      if (stock.transactions && stock.transactions.length > 0) {
        initTransactions[stock.symbol] = stock.transactions
        newlyInitialized.add(stock.symbol)
        return
      }

      // Convert existing single transaction fields to transaction array as fallback
      if (stock.buyPrice && stock.buyShares && stock.buyDate) {
        transactions.push({
          id: generateTransactionId(),
          type: 'buy',
          price: stock.buyPrice,
          shares: stock.buyShares,
          date: stock.buyDate
        })
      }

      if (stock.sellPrice && stock.sellShares && stock.sellDate) {
        transactions.push({
          id: generateTransactionId(),
          type: 'sell',
          price: stock.sellPrice,
          shares: stock.sellShares,
          date: stock.sellDate
        })
      }

      if (transactions.length > 0) {
        initTransactions[stock.symbol] = transactions
      }

      newlyInitialized.add(stock.symbol)
    })

    // Only update if we have new data to add
    if (Object.keys(initTransactions).length > 0) {
      setEditingTransactions(prev => ({
        ...prev,
        ...initTransactions
      }))
    }

    // Update initialized stocks set
    if (newlyInitialized.size > 0) {
      setInitializedStocks(prev => new Set([...prev, ...newlyInitialized]))
    }
  }, [stocks, funds, forex])

  // Set up real-time price updates every 2 minutes
  useEffect(() => {
    // Initial update after loading
    if (stocks.length > 0 || funds.length > 0 || forex.length > 0) {
      // Initial update after a short delay to ensure data is loaded
      const timeoutId = setTimeout(() => {
        updateRealTimePrices()
      }, 1000)

      // Set up interval for updates every 2 minutes (120000ms)
      const intervalId = setInterval(() => {
        updateRealTimePrices()
      }, 120000)

      return () => {
        clearTimeout(timeoutId)
        clearInterval(intervalId)
      }
    }
  }, [updateRealTimePrices])

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
        type: data.type || determineStockType(data.symbol, data.name),
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

  const [editingPrices, setEditingPrices] = useState<{[key: string]: {buyPrice?: number, buyShares?: number, buyDate?: string, sellPrice?: number, sellShares?: number, sellDate?: string}}>({})
  const [editingTransactions, setEditingTransactions] = useState<{[key: string]: Transaction[]}>({})
  const [initializedStocks, setInitializedStocks] = useState<Set<string>>(new Set())

  const addTransaction = async (stockSymbol: string, type: 'buy' | 'sell') => {
    const newTransaction: Transaction = {
      id: generateTransactionId(),
      type,
      price: 0,
      shares: 0,
      date: new Date().toISOString().split('T')[0]
    }

    const currentTransactions = editingTransactions[stockSymbol] || []
    const updatedTransactions = currentTransactions.concat([newTransaction])

    setEditingTransactions(prev => ({
      ...prev,
      [stockSymbol]: updatedTransactions
    }))

    // Save to server immediately
    await saveTransactionsToServer(stockSymbol, updatedTransactions)
  }

  const updateTransaction = async (stockSymbol: string, transactionId: string, field: keyof Omit<Transaction, 'id' | 'type'>, value: string | number) => {
    const updatedTransactions = (editingTransactions[stockSymbol] || []).map(t =>
      t.id === transactionId ? { ...t, [field]: value } : t
    )

    setEditingTransactions(prev => ({
      ...prev,
      [stockSymbol]: updatedTransactions
    }))

    // Save to server with debounce
    clearTimeout((window as any)[`transaction-timeout-${stockSymbol}-${transactionId}`])
    ;(window as any)[`transaction-timeout-${stockSymbol}-${transactionId}`] = setTimeout(() => {
      saveTransactionsToServer(stockSymbol, updatedTransactions)
    }, 1000)
  }

  const removeTransaction = async (stockSymbol: string, transactionId: string) => {
    const updatedTransactions = (editingTransactions[stockSymbol] || []).filter(t => t.id !== transactionId)

    setEditingTransactions(prev => ({
      ...prev,
      [stockSymbol]: updatedTransactions
    }))

    // Save to server immediately
    await saveTransactionsToServer(stockSymbol, updatedTransactions)
  }

  const handleFieldChange = (symbol: string, fieldType: 'buyPrice' | 'buyShares' | 'buyDate' | 'sellPrice' | 'sellShares' | 'sellDate', value: string) => {
    let processedValue: any = value
    if (fieldType.includes('Price') || fieldType.includes('Shares')) {
      const numValue = parseFloat(value)
      processedValue = isNaN(numValue) ? undefined : numValue
    }

    setEditingPrices(prev => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [fieldType]: processedValue
      }
    }))
  }

  const saveFieldToServer = async (symbol: string, type: string, fieldType: 'buyPrice' | 'buyShares' | 'buyDate' | 'sellPrice' | 'sellShares' | 'sellDate', value: any) => {
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
          className="flex-1 cursor-pointer flex items-center"
          onClick={() => !isEditMode && onStockClick?.(stock.symbol, stock.name, {
            transactions: editingTransactions[stock.symbol] || stock.transactions,
            buyPrice: stock.buyPrice,
            buyDate: stock.buyDate,
            sellPrice: stock.sellPrice,
            sellDate: stock.sellDate
          })}
        >
          {/* Stock name and symbol */}
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{stock.name}</p>
            <p className="text-sm text-muted-foreground">{stock.symbol}</p>
          </div>

          {/* Current price centered */}
          <div className="flex flex-col items-center px-3">
            <span className="text-xs text-gray-500">Current</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{formatPrice(stock.currentPrice, stock.currency || getCurrencyFromSymbol(stock.symbol))}</span>
              <span className={`text-xs ${stock.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Profit/Loss section */}
          <div className="text-right w-32">
            {(() => {
              const position = calculatePositionAndPL(stock)
              const hasPosition = position.currentShares > 0 || position.totalBuyShares > 0

              if (!hasPosition) return null

              const profitLoss = position.unrealizedPL
              const profitPercent = position.avgBuyPrice > 0 ? ((stock.currentPrice - position.avgBuyPrice) / position.avgBuyPrice * 100) : 0

              return (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">P/L</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {profitLoss >= 0 ? '+' : '-'}{formatPrice(Math.abs(profitLoss), stock.currency || getCurrencyFromSymbol(stock.symbol)).replace(/^./, '')}
                    </span>
                    <span className={`text-xs ${profitPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                      ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
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
        <div className="space-y-3">
          {/* Buy Transactions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-green-600">Buy Transactions:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => addTransaction(stock.symbol, 'buy')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Buy
              </Button>
            </div>
            <div className="space-y-1">
              {(editingTransactions[stock.symbol]?.filter(t => t.type === 'buy') || []).map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={transaction.price || ''}
                    onChange={(e) => updateTransaction(stock.symbol, transaction.id, 'price', parseFloat(e.target.value) || 0)}
                    className="h-7 w-20 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="1"
                    placeholder="Shares"
                    value={transaction.shares || ''}
                    onChange={(e) => updateTransaction(stock.symbol, transaction.id, 'shares', parseFloat(e.target.value) || 0)}
                    className="h-7 w-16 text-xs"
                  />
                  <Input
                    type="date"
                    value={transaction.date}
                    onChange={(e) => updateTransaction(stock.symbol, transaction.id, 'date', e.target.value)}
                    className="h-7 w-32 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeTransaction(stock.symbol, transaction.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Sell Transactions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-red-600">Sell Transactions:</span>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
                onClick={() => addTransaction(stock.symbol, 'sell')}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Sell
              </Button>
            </div>
            <div className="space-y-1">
              {(editingTransactions[stock.symbol]?.filter(t => t.type === 'sell') || []).map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={transaction.price || ''}
                    onChange={(e) => updateTransaction(stock.symbol, transaction.id, 'price', parseFloat(e.target.value) || 0)}
                    className="h-7 w-20 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">×</span>
                  <Input
                    type="number"
                    step="1"
                    placeholder="Shares"
                    value={transaction.shares || ''}
                    onChange={(e) => updateTransaction(stock.symbol, transaction.id, 'shares', parseFloat(e.target.value) || 0)}
                    className="h-7 w-16 text-xs"
                  />
                  <Input
                    type="date"
                    value={transaction.date}
                    onChange={(e) => updateTransaction(stock.symbol, transaction.id, 'date', e.target.value)}
                    className="h-7 w-32 text-xs"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeTransaction(stock.symbol, transaction.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
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
          {formatPrice(stock.currentPrice, stock.currency || getCurrencyFromSymbol(stock.symbol))}
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