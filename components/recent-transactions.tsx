"use client"

import { Badge } from "@/components/ui/badge"
import { ArrowDownIcon, ShoppingBag, Home, Car, Coffee, Utensils } from "lucide-react"

const transactions = [
  {
    id: "1",
    description: "Apple Inc",
    amount: -120.5,
    date: "AAPL",
    category: "Stock",
    percentage: "15.2%",
    icon: ShoppingBag,
  },
  {
    id: "2",
    description: "Tesla Stock",
    amount: 2400.0,
    date: "TSLA",
    category: "Stock",
    percentage: "54.6%",
    icon: ArrowDownIcon,
  },
  {
    id: "3",
    description: "Microsoft",
    amount: -1200.0,
    date: "MSFT",
    category: "Stock",
    percentage: "27.3%",
    icon: Home,
  },
  {
    id: "4",
    description: "Amazon",
    amount: -89.99,
    date: "AMZN",
    category: "Stock",
    percentage: "2.0%",
    icon: Car,
  },
  {
    id: "5",
    description: "Google",
    amount: -4.5,
    date: "GOOGL",
    category: "Stock",
    percentage: "0.6%",
    icon: Coffee,
  },
  {
    id: "6",
    description: "Netflix",
    amount: -65.3,
    date: "NFLX",
    category: "Stock",
    percentage: "8.2%",
    icon: Utensils,
  },
]

interface RecentTransactionsProps {
  onStockClick?: (stockName: string) => void
}

export function RecentTransactions({ onStockClick }: RecentTransactionsProps) {
  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
          onClick={() => onStockClick?.(transaction.description)}
        >
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">{transaction.date}</p>
          </div>
          <div className="ml-auto font-medium w-24 text-right">
            <span className={transaction.amount > 0 ? "text-green-500" : "text-red-500"}>
              {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </div>
          <Badge variant="outline" className="ml-2">
            {transaction.percentage}
          </Badge>
        </div>
      ))}
    </div>
  )
}
