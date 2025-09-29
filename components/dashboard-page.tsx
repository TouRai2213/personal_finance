"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentTransactions } from "@/components/recent-transactions"
import { PortfolioHoldings } from "@/components/portfolio-holdings"
import { AccountSummary } from "@/components/account-summary"
import { FinancialGoals } from "@/components/financial-goals"
import { AddTransactionForm } from "@/components/add-transaction-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { LoansOverview } from "@/components/loans-overview"
import { SavingsOverview } from "@/components/savings-overview"

export default function DashboardPage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null)

  console.log('Dashboard - selectedStock:', selectedStock)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Finance Dashboard</h1>
          <Button onClick={() => setShowAddTransaction(!showAddTransaction)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {showAddTransaction && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Add New Transaction</CardTitle>
              <CardDescription>Record a new expense or income</CardDescription>
            </CardHeader>
            <CardContent>
              <AddTransactionForm onComplete={() => setShowAddTransaction(false)} />
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,580.00</div>
              <p className="text-xs text-muted-foreground">+$1,245.00 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$4,395.00</div>
              <p className="text-xs text-muted-foreground">+2.5% from 2025/08/07</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,860.00</div>
              <p className="text-xs text-muted-foreground">+18.1% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Living Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,860.00</div>
              <p className="text-xs text-muted-foreground">-4% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>{selectedStock?.name || "Financial Overview"}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview selectedStock={selectedStock?.symbol} />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardContent className="pt-6">
                  <PortfolioHoldings onStockClick={(symbol, name) => setSelectedStock({ symbol, name })} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="accounts" className="space-y-4">
            <AccountSummary />
          </TabsContent>
          <TabsContent value="loans" className="space-y-4">
            <LoansOverview />
          </TabsContent>
          <TabsContent value="savings" className="space-y-4">
            <SavingsOverview />
          </TabsContent>
          <TabsContent value="goals" className="space-y-4">
            <FinancialGoals />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
