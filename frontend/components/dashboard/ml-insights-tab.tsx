'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, AlertTriangle, Target, TrendingUp } from 'lucide-react'

interface MLInsightsTabProps {
  data?: any
}

export function MLInsightsTab({ data }: MLInsightsTabProps) {
  const clusterAnalysis = [
    {
      cluster: 'High Volume Urban',
      districts: 142,
      characteristics: 'High daily volume (>5K), stable patterns, low risk',
      color: 'bg-green-500',
      representative: 'Mumbai, Delhi, Bangalore'
    },
    {
      cluster: 'Growing Suburban',
      districts: 89,
      characteristics: 'Medium volume (2-5K), high growth, medium risk',
      color: 'bg-blue-500',
      representative: 'Pune, Gurgaon, Hyderabad'
    },
    {
      cluster: 'Steady Rural',
      districts: 234,
      characteristics: 'Low-medium volume (500-2K), consistent, low risk',
      color: 'bg-yellow-500',
      representative: 'Rajkot, Nashik, Coimbatore'
    },
    {
      cluster: 'Emerging Markets',
      districts: 67,
      characteristics: 'Variable volume (<500), high potential, high risk',
      color: 'bg-purple-500',
      representative: 'Tier-3 cities, Rural centers'
    }
  ]

  const anomalies = [
    {
      date: 'Mar 5, 2025',
      location: 'Bihar - Patna',
      type: 'Volume Spike',
      severity: 'High',
      description: 'Unusual 340% increase in biometric updates',
      status: 'Under Investigation'
    },
    {
      date: 'Mar 7, 2025',
      location: 'Kerala - Kochi',
      type: 'Pattern Anomaly',
      severity: 'Medium',
      description: 'Unexpected demographic-to-biometric ratio change',
      status: 'Resolved'
    },
    {
      date: 'Mar 8, 2025',
      location: 'Rajasthan - Jaipur',
      type: 'Time Anomaly',
      severity: 'Low',
      description: 'Off-hours activity surge (3-6 AM)',
      status: 'Monitoring'
    }
  ]

  const predictions = [
    {
      metric: 'Daily Volume',
      current: 523456,
      predicted: 601234,
      change: '+14.9%',
      confidence: 87,
      period: 'Next 7 days'
    },
    {
      metric: 'Biometric Share',
      current: 40.6,
      predicted: 43.2,
      change: '+6.4%',
      confidence: 72,
      period: 'Next 30 days'
    },
    {
      metric: 'Risk Districts',
      current: 23,
      predicted: 18,
      change: '-21.7%',
      confidence: 65,
      period: 'Next Quarter'
    }
  ]

  const mlModels = [
    {
      name: 'Geographic Clustering',
      algorithm: 'MiniBatch K-Means',
      accuracy: 94.2,
      lastTrained: 'Jan 9, 2026',
      status: 'Active'
    },
    {
      name: 'Anomaly Detection',
      algorithm: 'Isolation Forest + Statistical',
      accuracy: 91.7,
      lastTrained: 'Jan 9, 2026',
      status: 'Active'
    },
    {
      name: 'Volume Forecasting',
      algorithm: 'Exponential Smoothing',
      accuracy: 87.3,
      lastTrained: 'Jan 9, 2026',
      status: 'Active'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'High': return 'bg-red-100 text-red-700'
      case 'Medium': return 'bg-yellow-100 text-yellow-700'
      case 'Low': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700'
      case 'Resolved': return 'bg-green-100 text-green-700'
      case 'Under Investigation': return 'bg-orange-100 text-orange-700'
      case 'Monitoring': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* ML Model Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Machine Learning Models</span>
          </CardTitle>
          <CardDescription>
            Real-time ML pipeline status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mlModels.map((model) => (
              <div key={model.name} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{model.name}</h4>
                  <Badge className={getStatusColor(model.status)}>
                    {model.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Algorithm: {model.algorithm}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{model.accuracy}%</span>
                  <span className="text-sm text-muted-foreground">accuracy</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Last trained: {model.lastTrained}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Clustering */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Geographic Clustering Analysis</span>
          </CardTitle>
          <CardDescription>
            District segmentation based on service patterns and risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {clusterAnalysis.map((cluster) => (
            <div key={cluster.cluster} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className={`w-4 h-4 rounded-full ${cluster.color}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{cluster.cluster}</h4>
                  <Badge variant="outline">{cluster.districts} districts</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {cluster.characteristics}
                </p>
                <p className="text-xs text-muted-foreground">
                  Representative: {cluster.representative}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Anomaly Detection</span>
          </CardTitle>
          <CardDescription>
            Real-time unusual pattern detection and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{anomaly.location}</h4>
                    <Badge className={getSeverityColor(anomaly.severity)}>
                      {anomaly.severity}
                    </Badge>
                    <Badge variant="outline">{anomaly.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                  <p className="text-xs text-muted-foreground">{anomaly.date}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(anomaly.status)}>
                    {anomaly.status}
                  </Badge>
                  <div className="mt-2">
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Predictive Analytics</span>
          </CardTitle>
          <CardDescription>
            ML-powered forecasts and trend predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {predictions.map((pred) => (
              <div key={pred.metric} className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-medium">{pred.metric}</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Current</div>
                    <div className="font-semibold">
                      {typeof pred.current === 'number' && pred.current > 1000 
                        ? pred.current.toLocaleString() 
                        : pred.current}{pred.metric.includes('Share') ? '%' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Predicted</div>
                    <div className="font-semibold">
                      {typeof pred.predicted === 'number' && pred.predicted > 1000 
                        ? pred.predicted.toLocaleString() 
                        : pred.predicted}{pred.metric.includes('Share') ? '%' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant={pred.change.includes('+') ? 'default' : 'secondary'}>
                    {pred.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {pred.confidence}% confidence
                  </span>
                </div>
                <Progress value={pred.confidence} className="h-1" />
                <div className="text-xs text-muted-foreground">
                  Period: {pred.period}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}