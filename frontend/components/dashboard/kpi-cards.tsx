'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, MapPin, Activity } from 'lucide-react'

interface KPICardsProps {
  totalRecords?: number
  activeStates?: number
  avgDailyVolume?: number
  completionRate?: number
}

export function KPICards({ 
  totalRecords = 4347383,
  activeStates = 36,
  avgDailyVolume = 483042,
  completionRate = 94.7
}: KPICardsProps) {
  const kpis = [
    {
      title: 'Total Records',
      value: totalRecords.toLocaleString(),
      description: 'Across all services',
      icon: Users,
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Active States',
      value: activeStates.toString(),
      description: 'Pan-India coverage',
      icon: MapPin,
      trend: '100%',
      trendUp: true
    },
    {
      title: 'Daily Volume',
      value: avgDailyVolume.toLocaleString(),
      description: 'Average requests/day',
      icon: Activity,
      trend: '+8.3%',
      trendUp: true
    },
    {
      title: 'Success Rate',
      value: `${completionRate}%`,
      description: 'Service completion',
      icon: TrendingUp,
      trend: '+2.1%',
      trendUp: true
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {kpi.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.description}
              </p>
              <div className="flex items-center pt-1">
                <Badge 
                  variant={kpi.trendUp ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {kpi.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}