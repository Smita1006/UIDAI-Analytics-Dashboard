'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MapPin, BarChart3, Globe } from 'lucide-react'

interface GeographicTabProps {
  data?: any
}

export function GeographicTab({ data }: GeographicTabProps) {
  const stateData = [
    { state: 'Maharashtra', volume: 524832, growth: 15.2, risk: 'Low' },
    { state: 'Uttar Pradesh', volume: 487291, growth: 12.8, risk: 'Medium' },
    { state: 'Karnataka', volume: 398742, growth: 18.5, risk: 'Low' },
    { state: 'Tamil Nadu', volume: 356189, growth: 9.3, risk: 'Low' },
    { state: 'Gujarat', volume: 324567, growth: 14.1, risk: 'Medium' },
    { state: 'West Bengal', volume: 298432, growth: 7.6, risk: 'High' },
    { state: 'Rajasthan', volume: 276543, growth: 11.9, risk: 'Medium' },
    { state: 'Andhra Pradesh', volume: 245678, growth: 16.7, risk: 'Low' }
  ]

  const regionalInsights = [
    {
      region: 'Western India',
      states: 'Maharashtra, Gujarat, Rajasthan',
      volume: 1125942,
      insight: 'Highest enrollment activity, strong urban-rural balance'
    },
    {
      region: 'Southern India', 
      states: 'Karnataka, Tamil Nadu, Andhra Pradesh',
      volume: 1000609,
      insight: 'Technology adoption leader, high biometric preference'
    },
    {
      region: 'Northern India',
      states: 'Uttar Pradesh, Delhi, Punjab',
      volume: 598734,
      insight: 'Growing demographic update requests, youth focus'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'bg-green-100 text-green-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'High': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Interactive Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Interactive India Map</span>
          </CardTitle>
          <CardDescription>
            Geographic distribution of UIDAI services across India
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center border-2 border-dashed border-blue-200">
            <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map Visualization</h3>
            <p className="text-muted-foreground mb-4">
              State-wise heatmap showing service volume, growth trends, and risk assessment
            </p>
            <div className="flex justify-center space-x-2">
              <Button variant="outline" size="sm">
                View Heatmap
              </Button>
              <Button size="sm">
                Cluster Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* State Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>State-wise Performance Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of service volume, growth, and operational risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div className="col-span-3">State</div>
              <div className="col-span-3">Service Volume</div>
              <div className="col-span-2">Growth Rate</div>
              <div className="col-span-2">Risk Level</div>
              <div className="col-span-2">Action</div>
            </div>
            
            {stateData.map((state) => (
              <div key={state.state} className="grid grid-cols-12 gap-4 items-center py-2 hover:bg-muted/50 rounded">
                <div className="col-span-3 font-medium">{state.state}</div>
                <div className="col-span-3">
                  <div className="font-semibold">{state.volume.toLocaleString()}</div>
                  <Progress value={(state.volume / 524832) * 100} className="h-1 mt-1" />
                </div>
                <div className="col-span-2">
                  <Badge variant={state.growth > 15 ? 'default' : 'secondary'}>
                    +{state.growth}%
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Badge className={getRiskColor(state.risk)}>
                    {state.risk}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        {regionalInsights.map((region) => (
          <Card key={region.region}>
            <CardHeader>
              <CardTitle className="text-lg">{region.region}</CardTitle>
              <CardDescription>{region.states}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Volume</span>
                  <span className="font-semibold">{region.volume.toLocaleString()}</span>
                </div>
                <Progress value={(region.volume / 1125942) * 100} className="h-2" />
                <p className="text-sm text-muted-foreground pt-2">{region.insight}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}