"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Area,
  AreaChart,
  ReferenceDot,
} from "recharts"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { formatPrice, getCurrencyFromSymbol } from "@/lib/currency"

const defaultData = [
  {
    name: "Jan",
    "Total Balance": 12580,
    "Total Return": 4395,
    "Daily Return": 2860,
  },
  {
    name: "Feb",
    "Total Balance": 13200,
    "Total Return": 4650,
    "Daily Return": 3100,
  },
  {
    name: "Mar",
    "Total Balance": 12900,
    "Total Return": 4200,
    "Daily Return": 2750,
  },
  {
    name: "Apr",
    "Total Balance": 14100,
    "Total Return": 5200,
    "Daily Return": 3400,
  },
  {
    name: "May",
    "Total Balance": 13800,
    "Total Return": 4800,
    "Daily Return": 3200,
  },
  {
    name: "Jun",
    "Total Balance": 15200,
    "Total Return": 5800,
    "Daily Return": 3900,
  },
]


const timePeriods = [
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "30D" },
  { label: "3M", value: "90D" },
  { label: "6M", value: "6M" },
  { label: "YTD", value: "YTD" },
  { label: "1Y", value: "1Y" },
  { label: "2Y", value: "2Y" },
]

interface Transaction {
  type: 'buy' | 'sell'
  price: number
  shares: number
  date: string
  id: string
}

interface OverviewProps {
  selectedStock?: string | null
  stockData?: {
    transactions?: Transaction[]
    buyPrice?: number
    buyDate?: string
    sellPrice?: number
    sellDate?: string
  }
}

export function Overview({ selectedStock, stockData: stockTransactionData }: OverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6M")
  const [stockData, setStockData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrice, setCurrentPrice] = useState(0)
  const [hoveredData, setHoveredData] = useState<{price: number; date: string} | null>(null)
  const [mounted, setMounted] = useState(false)
  const lastHoveredIndexRef = useRef<number | null>(null)

  // Check if the selected symbol is a Japanese fund (8 digits)
  const isJapaneseFund = selectedStock && /^\d{8}$/.test(selectedStock)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch historical data from server
  const fetchStockHistory = async (symbol: string, period: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stock/${symbol}/history?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setStockData(data.history || [])
        setCurrentPrice(data.currentPrice || 0)
      }
    } catch (error) {
      console.error('Error fetching stock history:', error)
      setStockData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedStock && selectedStock.length > 0) {
      // selectedStock is now the symbol directly
      fetchStockHistory(selectedStock, selectedPeriod)

      // Set different refresh intervals based on period
      let refreshInterval: number
      switch (selectedPeriod) {
        case '1D':
          refreshInterval = 120000 // 2 minutes (matching data interval)
          break
        case '1W':
          refreshInterval = 300000 // 5 minutes (matching data interval)
          break
        case '30D':
          refreshInterval = 3600000 // 1 hour (matching data interval)
          break
        default:
          refreshInterval = 0 // No auto-refresh for daily data periods
      }

      if (refreshInterval > 0) {
        const intervalId = setInterval(() => {
          console.log(`Updating chart for ${selectedStock} - ${selectedPeriod}`)
          fetchStockHistory(selectedStock, selectedPeriod)
        }, refreshInterval)

        return () => clearInterval(intervalId)
      }
    }
  }, [selectedStock, selectedPeriod])

  // Helper function to check if a date falls within the chart data range
  const isDateInRange = (dateStr: string) => {
    if (!dateStr || stockData.length === 0) return false
    const targetDate = new Date(dateStr)
    const firstDataDate = new Date(stockData[0]?.date)
    const lastDataDate = new Date(stockData[stockData.length - 1]?.date)
    return targetDate >= firstDataDate && targetDate <= lastDataDate
  }

  // Find the closest data point to a transaction date
  const findClosestDataPoint = (dateStr: string) => {
    if (!dateStr || stockData.length === 0) return null
    const targetDate = new Date(dateStr)
    let closest = stockData[0]
    let minDiff = Math.abs(new Date(closest.date).getTime() - targetDate.getTime())
    let closestIndex = 0

    for (let i = 0; i < stockData.length; i++) {
      const point = stockData[i]
      const diff = Math.abs(new Date(point.date).getTime() - targetDate.getTime())
      if (diff < minDiff) {
        minDiff = diff
        closest = point
        closestIndex = i
      }
    }
    return { ...closest, index: closestIndex }
  }

  if (selectedStock && selectedStock.length > 0) {
    const data = stockData
    const firstPrice = data[0]?.price || 0
    const lastPrice = data[data.length - 1]?.price || currentPrice
    const isPositive = lastPrice >= firstPrice
    const lineColor = isPositive ? "#22c55e" : "#ef4444"
    const changePercent = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2) : "0.00"

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{formatPrice(lastPrice, selectedStock ? getCurrencyFromSymbol(selectedStock) : 'USD')}</div>
            <div className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
              {isPositive ? "+" : ""}
              {changePercent}% ({selectedPeriod})
            </div>
          </div>
        </div>

        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              className={`text-xs px-3 py-1 ${
                selectedPeriod === period.value ? "bg-white shadow-sm text-gray-900" : "hover:bg-gray-200 text-gray-600"
              }`}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </Button>
          ))}
        </div>

        {/* Transaction points legend and hover info */}
        {(() => {
          const hasTransactions = stockTransactionData?.transactions?.length > 0 ||
                                stockTransactionData?.buyDate || stockTransactionData?.sellDate

          if (!hasTransactions && !hoveredData) return null

          // Calculate average buy price from transactions
          const buyTransactions = stockTransactionData?.transactions?.filter(t => t.type === 'buy') || []
          const sellTransactions = stockTransactionData?.transactions?.filter(t => t.type === 'sell') || []

          let avgBuyPrice = 0
          let avgSellPrice = 0

          if (buyTransactions.length > 0) {
            const totalBuyValue = buyTransactions.reduce((sum, t) => sum + (t.price * t.shares), 0)
            const totalBuyShares = buyTransactions.reduce((sum, t) => sum + t.shares, 0)
            avgBuyPrice = totalBuyValue / totalBuyShares
          } else if (stockTransactionData?.buyPrice) {
            avgBuyPrice = stockTransactionData.buyPrice
          }

          if (sellTransactions.length > 0) {
            const totalSellValue = sellTransactions.reduce((sum, t) => sum + (t.price * t.shares), 0)
            const totalSellShares = sellTransactions.reduce((sum, t) => sum + t.shares, 0)
            avgSellPrice = totalSellValue / totalSellShares
          } else if (stockTransactionData?.sellPrice) {
            avgSellPrice = stockTransactionData.sellPrice
          }

          return (
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex gap-4">
                {(buyTransactions.length > 0 || stockTransactionData?.buyDate) && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                    <span>
                      Avg Buy: {formatPrice(avgBuyPrice, selectedStock ? getCurrencyFromSymbol(selectedStock) : 'USD')}
                      {buyTransactions.length > 1 ? ` (${buyTransactions.length} trades)` :
                       stockTransactionData?.buyDate ? ` (${stockTransactionData.buyDate})` : ''}
                    </span>
                  </div>
                )}
                {(sellTransactions.length > 0 || stockTransactionData?.sellDate) && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white"></div>
                    <span>
                      Avg Sell: {formatPrice(avgSellPrice, selectedStock ? getCurrencyFromSymbol(selectedStock) : 'USD')}
                      {sellTransactions.length > 1 ? ` (${sellTransactions.length} trades)` :
                       stockTransactionData?.sellDate ? ` (${stockTransactionData.sellDate})` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover info - centered */}
              {hoveredData && (
                <div className="flex-1 text-center">
                  <span className="font-medium">{formatPrice(hoveredData.price, selectedStock ? getCurrencyFromSymbol(selectedStock) : 'USD')} - {hoveredData.date}</span>
                </div>
              )}
            </div>
          )
        })()}

        <ResponsiveContainer width="100%" height={300}>
          {!mounted ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-600">Loading chart...</div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-600">Loading chart data...</div>
            </div>
          ) : data.length > 0 ? (
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              key={`${selectedStock}-${selectedPeriod}`}
              onMouseMove={(e: any) => {
                if (e && e.activeIndex !== undefined) {
                  const index = parseInt(e.activeIndex);
                  if (index >= 0 && index < data.length && index !== lastHoveredIndexRef.current) {
                    lastHoveredIndexRef.current = index;
                    const dataPoint = data[index];
                    setHoveredData({ price: dataPoint.price, date: dataPoint.date });
                  }
                }
              }}
              onMouseLeave={() => {
                lastHoveredIndexRef.current = null;
                setHoveredData(null);
              }}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={(props: any) => {
                  const { x, y, payload, index } = props;
                  const dataPoint = data[index];
                  // Only show labels for data points that have a name
                  if (dataPoint?.name) {
                    return (
                      <text
                        x={x}
                        y={y + 15}
                        fill="#666"
                        fontSize={12}
                        textAnchor="middle"
                      >
                        {dataPoint.name}
                      </text>
                    );
                  }
                  return null;
                }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(value: number) => value.toFixed(2)}
                domain={[
                  (dataMin: number) => {
                    // Add 0.2% padding below the minimum
                    return dataMin * 0.998;
                  },
                  (dataMax: number) => {
                    // Add 0.2% padding above the maximum
                    return dataMax * 1.002;
                  }
                ]}
              />
              <Tooltip
                cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={() => null}
                isAnimationActive={false}
              />
              <Area
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#colorArea)"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />

              {/* Transaction points - show all buy/sell transactions */}
              {stockTransactionData?.transactions?.map((transaction) => {
                if (!isDateInRange(transaction.date)) return null

                const closestPoint = findClosestDataPoint(transaction.date)
                if (!closestPoint) return null

                return (
                  <ReferenceDot
                    key={transaction.id}
                    x={closestPoint.index}
                    y={closestPoint.price}
                    r={6}
                    fill={transaction.type === 'buy' ? "#3b82f6" : "#ef4444"}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                )
              })}

              {/* Fallback to old single transaction display */}
              {!stockTransactionData?.transactions && stockTransactionData?.buyDate && stockTransactionData?.buyPrice && isDateInRange(stockTransactionData.buyDate) && (() => {
                const closestPoint = findClosestDataPoint(stockTransactionData.buyDate)
                return closestPoint ? (
                  <ReferenceDot
                    x={closestPoint.index}
                    y={closestPoint.price}
                    r={6}
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ) : null
              })()}

              {!stockTransactionData?.transactions && stockTransactionData?.sellDate && stockTransactionData?.sellPrice && isDateInRange(stockTransactionData.sellDate) && (() => {
                const closestPoint = findClosestDataPoint(stockTransactionData.sellDate)
                return closestPoint ? (
                  <ReferenceDot
                    x={closestPoint.index}
                    y={closestPoint.price}
                    r={6}
                    fill="#ef4444"
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ) : null
              })()}
            </AreaChart>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-600">No data available</div>
            </div>
          )}
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
        <BarChart data={defaultData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total Balance" fill="#3b82f6" />
        <Bar dataKey="Total Return" fill="#22c55e" />
        <Bar dataKey="Daily Return" fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  )
}
