'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Calendar, TrendingUp, Clock } from 'lucide-react'

interface TemporalTabProps {
  data?: any
}

export function TemporalTab({ data }: TemporalTabProps) {
  const dailyTrends = [
    { date: 'Mar 1', volume: 467234, growth: 2.3 },
    { date: 'Mar 2', volume: 523891, growth: 12.1 },
    { date: 'Mar 3', volume: 489456, growth: -6.6 },
    { date: 'Mar 4', volume: 512378, growth: 4.7 },
    { date: 'Mar 5', volume: 578923, growth: 13.0 },
    { date: 'Mar 6', volume: 445123, growth: -23.1 },
    { date: 'Mar 7', volume: 398234, growth: -10.5 },
    { date: 'Mar 8', volume: 534567, growth: 34.2 },
    { date: 'Mar 9', volume: 498765, growth: -6.7 }
  ]

  const weeklyPatterns = [
    { day: 'Monday', volume: 587432, percentage: 18.5, peak: true },
    { day: 'Tuesday', volume: 534891, percentage: 16.8, peak: false },
    { day: 'Wednesday', volume: 512456, percentage: 16.1, peak: false },
    { day: 'Thursday', volume: 498234, percentage: 15.7, peak: false },
    { day: 'Friday', volume: 456789, percentage: 14.4, peak: false },
    { day: 'Saturday', volume: 334567, percentage: 10.5, peak: false },
    { day: 'Sunday', volume: 254231, percentage: 8.0, peak: false }
  ]

  const forecastData = [
    { period: 'Next Week', predicted: 523456, confidence: 87 },
    { period: 'Next Month', predicted: 2134567, confidence: 72 },
    { period: 'Next Quarter', predicted: 6789012, confidence: 64 }
  ]

  const timeInsights = [
    {
      title: 'Peak Hours',
      value: '10 AM - 2 PM',
      description: '65% of daily volume occurs during business hours',
      icon: Clock
    },
    {
      title: 'Weekly Growth',
      value: '+15.7%',
      description: 'Consistent upward trend this month',
      icon: TrendingUp
    },
    {
      title: 'Seasonal Pattern',
      value: 'March Peak',
      description: 'Enrollment season drives 40% increase',
      icon: Calendar
    }
  ]

  return (
    <div className="space-y-6">
      {/* Time Series Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Daily Volume Trends</span>
          </CardTitle>
          <CardDescription>
            9-day time series analysis of UIDAI service requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 text-center border-2 border-dashed border-green-200">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Time Series Chart</h3>
            <p className="text-muted-foreground mb-4">
              Line chart showing daily trends, anomaly detection, and volume forecasting
            </p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" size="sm">
                View Chart
              </Button>
              <Button size="sm">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Patterns */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Day-of-Week Analysis</CardTitle>
            <CardDescription>
              Service volume patterns across weekdays
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyPatterns.map((day) => (
              <div key={day.day} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${day.peak ? 'text-primary' : ''}`}>
                    {day.day}
                    {day.peak && <Badge className="ml-2" size="sm">Peak</Badge>}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {day.volume.toLocaleString()} ({day.percentage}%)
                  </span>
                </div>
                <Progress value={day.percentage * 5} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temporal Insights</CardTitle>
            <CardDescription>
              Key patterns from time-based analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeInsights.map((insight) => {
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

      {/* Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Forecasting</CardTitle>
          <CardDescription>
            Predicted service volumes using exponential smoothing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {forecastData.map((forecast) => (
              <div key={forecast.period} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{forecast.period}</h4>
                  <Badge variant={forecast.confidence > 80 ? 'default' : 'secondary'}>
                    {forecast.confidence}% confidence
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {forecast.predicted.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Predicted service requests
                </div>
                <Progress value={forecast.confidence} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}