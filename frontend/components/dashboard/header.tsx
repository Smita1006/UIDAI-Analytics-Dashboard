'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function DashboardHeader() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">UI</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold">UIDAI Analytics</h1>
              <p className="text-sm text-muted-foreground">Identity Management Dashboard</p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Live Data • 4.3M+ Records
          </Badge>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  )
}