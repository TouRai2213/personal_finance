"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Car, Home, Plus, Trash2 } from "lucide-react"

const initialGoals = [
  {
    id: "1",
    name: "Buy a House",
    currentAmount: 35000,
    targetAmount: 60000,
    targetDate: "2026-06-30",
    category: "housing",
    icon: Home,
  },
  {
    id: "2",
    name: "New Car",
    currentAmount: 8000,
    targetAmount: 25000,
    targetDate: "2025-12-31",
    category: "transportation",
    icon: Car,
  },
  {
    id: "3",
    name: "Early Retirement",
    currentAmount: 78500,
    targetAmount: 500000,
    targetDate: "2040-01-01",
    category: "retirement",
    icon: Briefcase,
  },
]

export function FinancialGoals() {
  const [goals, setGoals] = useState(initialGoals)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    category: "",
  })

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.targetDate && newGoal.category) {
      const goalToAdd = {
        id: Date.now().toString(),
        name: newGoal.name,
        currentAmount: 0,
        targetAmount: Number.parseFloat(newGoal.targetAmount),
        targetDate: newGoal.targetDate,
        category: newGoal.category,
        icon: Home, // Default icon
      }

      setGoals([...goals, goalToAdd])
      setNewGoal({ name: "", targetAmount: "", targetDate: "", category: "" })
      setShowAddGoal(false)
    }
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Financial Goals</h2>
        <Button onClick={() => setShowAddGoal(!showAddGoal)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {showAddGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>Set a new financial goal to track your progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goal-name">Goal Name</Label>
                <Input
                  id="goal-name"
                  placeholder="e.g., Buy a House"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target-amount">Target Amount ($)</Label>
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="50000"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="target-date">Target Date</Label>
                <Input
                  id="target-date"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retirement">Retirement</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddGoal}>Create Goal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <goal.icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg font-medium">{goal.name}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${goal.currentAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                of ${goal.targetAmount.toFixed(2)} goal • Target: {new Date(goal.targetDate).toLocaleDateString()}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                </div>
                <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline">
                    Update
                  </Button>
                  <Button size="sm">Add Funds</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
