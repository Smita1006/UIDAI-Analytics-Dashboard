'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Baby, GraduationCap, User } from 'lucide-react'

interface DemographicTabProps {
  data?: any
}

export function DemographicTab({ data }: DemographicTabProps) {
  const ageDistribution = [
    { 
      ageGroup: '0-5 years', 
      count: 983072, 
      percentage: 22.6, 
      primaryService: 'New Enrollment',
      icon: Baby,
      trend: '+18.3%'
    },
    { 
      ageGroup: '5-17 years', 
      count: 1456789, 
      percentage: 33.5, 
      primaryService: 'Biometric Update',
      icon: GraduationCap,
      trend: '+12.7%'
    },
    { 
      ageGroup: '18+ years', 
      count: 1907522, 
      percentage: 43.9, 
      primaryService: 'Demographic Update',
      icon: User,
      trend: '+8.9%'
    }
  ]

  const servicePreferences = [
    {
      ageGroup: '5-17 years',
      biometric: 75.3,
      demographic: 24.7,
      insight: 'Youth strongly prefer biometric updates (3:1 ratio)'
    },
    {
      ageGroup: '18-35 years', 
      biometric: 45.2,
      demographic: 54.8,
      insight: 'Working adults favor demographic updates for address changes'
    },
    {
      ageGroup: '35+ years',
      biometric: 38.7,
      demographic: 61.3,
      insight: 'Older adults primarily update personal information'
    }
  ]

  const genderDistribution = [
    { gender: 'Male', count: 2234567, percentage: 51.4 },
    { gender: 'Female', count: 2112816, percentage: 48.6 }
  ]

  const urbanRural = [
    { type: 'Urban', count: 2608430, percentage: 60.0, growth: '+15.2%' },
    { type: 'Rural', count: 1738953, percentage: 40.0, growth: '+9.8%' }
  ]

  const demographicInsights = [
    {
      title: 'Youth Digital Adoption',
      value: '75%',
      description: 'Age 5-17 prefer biometric over demographic updates',
      highlight: true
    },
    {
      title: 'Urban Growth Rate',
      value: '+15.2%',
      description: 'Cities showing higher enrollment activity',
      highlight: false
    },
    {
      title: 'Gender Parity',
      value: '51.4% / 48.6%',
      description: 'Balanced male-female service utilization',
      highlight: false
    },
    {
      title: 'Peak Age Group',
      value: '18+ years',
      description: '43.9% of all service requests',
      highlight: true
    }
  ]

  return (
    <div className="space-y-6">
      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Age Group Distribution</span>
          </CardTitle>
          <CardDescription>
            Service utilization patterns across different age segments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {ageDistribution.map((group) => {
              const Icon = group.icon
              return (
                <div key={group.ageGroup} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{group.ageGroup}</span>
                    </div>
                    <Badge variant="outline">{group.trend}</Badge>
                  </div>
                  <div className="text-2xl font-bold">{group.count.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {group.percentage}% of total • Primary: {group.primaryService}
                  </div>
                  <Progress value={group.percentage * 2} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Service Preferences by Age */}
      <Card>
        <CardHeader>
          <CardTitle>Service Preferences by Age Group</CardTitle>
          <CardDescription>
            Biometric vs Demographic update preferences across age segments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {servicePreferences.map((pref) => (
            <div key={pref.ageGroup} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{pref.ageGroup}</h4>
                <div className="flex space-x-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    Bio: {pref.biometric}%
                  </Badge>
                  <Badge className="bg-green-100 text-green-700">
                    Demo: {pref.demographic}%
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-10 gap-1">
                <div className="col-span-7 bg-blue-200 h-4 rounded-l" />
                <div className="col-span-3 bg-green-200 h-4 rounded-r" />
              </div>
              <p className="text-sm text-muted-foreground">{pref.insight}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Demographics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Service requests by gender</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {genderDistribution.map((gender) => (
              <div key={gender.gender} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{gender.gender}</span>
                  <span className="text-sm text-muted-foreground">
                    {gender.count.toLocaleString()} ({gender.percentage}%)
                  </span>
                </div>
                <Progress value={gender.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Urban vs Rural</CardTitle>
            <CardDescription>Geographic service distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urbanRural.map((area) => (
              <div key={area.type} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{area.type}</span>
                  <Badge variant={area.type === 'Urban' ? 'default' : 'secondary'}>
                    {area.growth}
                  </Badge>
                </div>
                <div className="text-xl font-bold">{area.count.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  {area.percentage}% of total requests
                </div>
                <Progress value={area.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Demographic intelligence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demographicInsights.slice(0, 3).map((insight) => (
              <div key={insight.title} className="space-y-1">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className={`text-sm font-semibold ${
                  insight.highlight ? 'text-primary' : 'text-muted-foreground'
                }`}>{insight.value}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Demographic Analysis Summary</CardTitle>
          <CardDescription>
            Key findings from demographic data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {demographicInsights.map((insight) => (
              <div key={insight.title} className={`p-4 rounded-lg border ${
                insight.highlight ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'
              }`}>
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-lg font-bold mt-1">{insight.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{insight.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}