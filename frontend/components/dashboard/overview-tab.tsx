'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

interface OverviewTabProps {
  data?: any
}

export function OverviewTab({ data }: OverviewTabProps) {
  // Mock data for demo
  const serviceDistribution = [
    { service: 'Demographic Updates', count: 1598099, percentage: 36.8, color: 'bg-blue-500' },
    { service: 'Biometric Updates', count: 1766212, percentage: 40.6, color: 'bg-green-500' },
    { service: 'New Enrollments', count: 983072, percentage: 22.6, color: 'bg-purple-500' }
  ]

  const topStates = [
    { state: 'Maharashtra', count: 524832, percentage: 12.1 },
    { state: 'Uttar Pradesh', count: 487291, percentage: 11.2 },
    { state: 'Karnataka', count: 398742, percentage: 9.2 },
    { state: 'Tamil Nadu', count: 356189, percentage: 8.2 },
    { state: 'Gujarat', count: 324567, percentage: 7.5 }
  ]

  const insights = [
    {
      title: 'Peak Activity Day',
      value: 'Monday',
      description: '25% higher than average',
      icon: TrendingUp
    },
    {
      title: 'Youth Preference',
      value: 'Biometric 3:1',
      description: 'Age 5-17 prefer biometric updates',
      icon: BarChart3
    },
    {
      title: 'Regional Leader',
      value: 'Maharashtra',
      description: '40% above national average',
      icon: PieChart
    }
  ]

  return (
    <div className="space-y-6">
      {/* Service Distribution */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
            <CardDescription>
              Breakdown of UIDAI services across 4.3M+ records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceDistribution.map((service) => (
              <div key={service.service} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{service.service}</span>
                  <span className="text-sm text-muted-foreground">
                    {service.count.toLocaleString()} ({service.percentage}%)
                  </span>
                </div>
                <Progress value={service.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>
              Actionable intelligence from data analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => {
              const Icon = insight.icon
              return (
                <div key={insight.title} className="flex items-start space-x-3">
                  <Icon className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-sm font-semibold text-primary">{insight.value}</p>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing States */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing States</CardTitle>
          <CardDescription>
            States with highest UIDAI service volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {topStates.map((state, index) => (
              <div key={state.state} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{state.state}</span>
                  <Badge variant={index < 2 ? 'default' : 'secondary'}>
                    #{index + 1}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">{state.count.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  {state.percentage}% of total volume
                </div>
                <Progress value={state.percentage * 2} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}