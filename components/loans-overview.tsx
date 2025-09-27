import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Car, GraduationCap, Home } from "lucide-react"

const loans = [
  {
    id: "1",
    name: "Mortgage",
    originalAmount: 250000,
    currentBalance: 198450.32,
    interestRate: 3.25,
    monthlyPayment: 1087.62,
    nextPaymentDate: "Apr 1, 2025",
    icon: Home,
  },
  {
    id: "2",
    name: "Car Loan",
    originalAmount: 28000,
    currentBalance: 12450.75,
    interestRate: 4.5,
    monthlyPayment: 450.3,
    nextPaymentDate: "Mar 15, 2025",
    icon: Car,
  },
  {
    id: "3",
    name: "Student Loan",
    originalAmount: 45000,
    currentBalance: 22340.18,
    interestRate: 5.25,
    monthlyPayment: 380.45,
    nextPaymentDate: "Mar 21, 2025",
    icon: GraduationCap,
  },
]

export function LoansOverview() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <Card key={loan.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <loan.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">{loan.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${loan.currentBalance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {((loan.currentBalance / loan.originalAmount) * 100).toFixed(1)}% remaining • {loan.interestRate}%
                interest
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Paid Off</span>
                  <span>{(100 - (loan.currentBalance / loan.originalAmount) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={100 - (loan.currentBalance / loan.originalAmount) * 100} className="h-2" />
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-sm font-medium">Next Payment</p>
                    <p className="text-xs text-muted-foreground">
                      ${loan.monthlyPayment} on {loan.nextPaymentDate}
                    </p>
                  </div>
                  <Button size="sm">Make Payment</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
