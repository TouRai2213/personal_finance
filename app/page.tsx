import type { Metadata } from "next"
import DashboardPage from "@/components/dashboard-page"

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Track your finances, loans, savings, and more.",
}

export default function Home() {
  return <DashboardPage />
}
