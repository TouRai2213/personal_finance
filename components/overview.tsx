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
} from "recharts"
import { Button } from "@/components/ui/button"
import { useState } from "react"

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

const stockDataByPeriod: Record<string, Record<string, any[]>> = {
  "Apple Inc": {
    "1W": [
      { name: "Mon", price: 158.2 },
      { name: "Tue", price: 159.1 },
      { name: "Wed", price: 157.8 },
      { name: "Thu", price: 160.3 },
      { name: "Fri", price: 158.9 },
    ],
    "30D": [
      { name: "Week 1", price: 155.2 },
      { name: "Week 2", price: 157.8 },
      { name: "Week 3", price: 159.4 },
      { name: "Week 4", price: 158.9 },
    ],
    "90D": [
      { name: "Month 1", price: 152.8 },
      { name: "Month 2", price: 157.3 },
      { name: "Month 3", price: 158.9 },
    ],
    "6M": [
      { name: "Jan", price: 150.2 },
      { name: "Feb", price: 148.5 },
      { name: "Mar", price: 152.8 },
      { name: "Apr", price: 147.3 },
      { name: "May", price: 155.9 },
      { name: "Jun", price: 158.9 },
    ],
    "1Y": [
      { name: "Q1", price: 145.2 },
      { name: "Q2", price: 152.8 },
      { name: "Q3", price: 155.9 },
      { name: "Q4", price: 158.9 },
    ],
    "3Y": [
      { name: "2022", price: 135.8 },
      { name: "2023", price: 148.2 },
      { name: "2024", price: 158.9 },
    ],
  },
  "Tesla Stock": {
    "1W": [
      { name: "Mon", price: 258.6 },
      { name: "Tue", price: 255.2 },
      { name: "Wed", price: 260.1 },
      { name: "Thu", price: 257.8 },
      { name: "Fri", price: 252.4 },
    ],
    "30D": [
      { name: "Week 1", price: 260.2 },
      { name: "Week 2", price: 258.8 },
      { name: "Week 3", price: 255.4 },
      { name: "Week 4", price: 252.4 },
    ],
    "90D": [
      { name: "Month 1", price: 265.8 },
      { name: "Month 2", price: 258.3 },
      { name: "Month 3", price: 252.4 },
    ],
    "6M": [
      { name: "Jan", price: 245.8 },
      { name: "Feb", price: 252.1 },
      { name: "Mar", price: 248.7 },
      { name: "Apr", price: 255.3 },
      { name: "May", price: 242.9 },
      { name: "Jun", price: 252.4 },
    ],
    "1Y": [
      { name: "Q1", price: 235.2 },
      { name: "Q2", price: 248.8 },
      { name: "Q3", price: 255.9 },
      { name: "Q4", price: 252.4 },
    ],
    "3Y": [
      { name: "2022", price: 180.8 },
      { name: "2023", price: 220.2 },
      { name: "2024", price: 252.4 },
    ],
  },
  Microsoft: {
    "1W": [
      { name: "Mon", price: 335.2 },
      { name: "Tue", price: 337.8 },
      { name: "Wed", price: 334.1 },
      { name: "Thu", price: 339.5 },
      { name: "Fri", price: 341.2 },
    ],
    "30D": [
      { name: "Week 1", price: 332.2 },
      { name: "Week 2", price: 335.8 },
      { name: "Week 3", price: 338.4 },
      { name: "Week 4", price: 341.2 },
    ],
    "90D": [
      { name: "Month 1", price: 325.8 },
      { name: "Month 2", price: 333.3 },
      { name: "Month 3", price: 341.2 },
    ],
    "6M": [
      { name: "Jan", price: 320.5 },
      { name: "Feb", price: 318.2 },
      { name: "Mar", price: 325.8 },
      { name: "Apr", price: 312.4 },
      { name: "May", price: 328.9 },
      { name: "Jun", price: 341.2 },
    ],
    "1Y": [
      { name: "Q1", price: 305.2 },
      { name: "Q2", price: 318.8 },
      { name: "Q3", price: 328.9 },
      { name: "Q4", price: 341.2 },
    ],
    "3Y": [
      { name: "2022", price: 280.8 },
      { name: "2023", price: 310.2 },
      { name: "2024", price: 341.2 },
    ],
  },
}

const timePeriods = [
  { label: "1W", value: "1W" },
  { label: "30D", value: "30D" },
  { label: "90D", value: "90D" },
  { label: "6M", value: "6M" },
  { label: "1Y", value: "1Y" },
  { label: "3Y", value: "3Y" },
]

interface OverviewProps {
  selectedStock?: string | null
}

export function Overview({ selectedStock }: OverviewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("6M")

  if (selectedStock && stockDataByPeriod[selectedStock]) {
    const data = stockDataByPeriod[selectedStock][selectedPeriod] || []
    const firstPrice = data[0]?.price || 0
    const lastPrice = data[data.length - 1]?.price || 0
    const isPositive = lastPrice >= firstPrice
    const lineColor = isPositive ? "#22c55e" : "#ef4444"
    const changePercent = firstPrice > 0 ? (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2) : "0.00"

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">${lastPrice.toFixed(2)}</div>
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

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "white",
                fontSize: "12px",
              }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, "Price"]}
            />
            <Line
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </LineChart>
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
