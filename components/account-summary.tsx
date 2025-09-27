import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Landmark, Wallet } from "lucide-react"

const accounts = [
  {
    id: "1",
    name: "Main Checking",
    type: "checking",
    balance: 4580.21,
    institution: "Chase Bank",
    lastUpdated: "Today",
    icon: Landmark,
  },
  {
    id: "2",
    name: "Savings Account",
    type: "savings",
    balance: 8000.0,
    institution: "Chase Bank",
    lastUpdated: "Today",
    icon: Wallet,
  },
  {
    id: "3",
    name: "Credit Card",
    type: "credit",
    balance: -1250.3,
    limit: 5000,
    institution: "American Express",
    lastUpdated: "Yesterday",
    icon: CreditCard,
  },
]

export function AccountSummary() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card key={account.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <account.icon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg font-medium">{account.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.type === "credit" ? "-" : ""}${Math.abs(account.balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {account.institution} • Updated {account.lastUpdated}
            </p>

            {account.type === "credit" && account.limit && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Credit Used</span>
                  <span>{Math.round((Math.abs(account.balance) / account.limit) * 100)}%</span>
                </div>
                <Progress value={(Math.abs(account.balance) / account.limit) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  ${Math.abs(account.balance).toFixed(2)} of ${account.limit} limit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
