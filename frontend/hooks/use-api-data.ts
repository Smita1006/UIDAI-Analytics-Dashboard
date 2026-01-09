'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useApiData() {
  const queryClient = useQueryClient()

  // Summary data
  const { 
    data: summary, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useQuery({
    queryKey: ['summary'],
    queryFn: () => apiClient.getSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // KPIs data
  const { 
    data: kpis, 
    isLoading: kpisLoading, 
    error: kpisError 
  } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => apiClient.getKPIs(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // States data
  const { 
    data: statesData, 
    isLoading: statesLoading 
  } = useQuery({
    queryKey: ['states'],
    queryFn: () => apiClient.getStates(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  })

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['summary'] }),
        queryClient.invalidateQueries({ queryKey: ['kpis'] }),
        queryClient.invalidateQueries({ queryKey: ['states'] }),
      ])
    },
  })

  const loading = summaryLoading || kpisLoading || statesLoading
  const error = summaryError || kpisError
  const states = statesData?.states || []

  return {
    summary,
    kpis,
    states,
    loading,
    error: error?.message || null,
    refreshData: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  }
}

// Geographic data hook
export function useGeographicData(filters: any) {
  return useQuery({
    queryKey: ['geographic', filters],
    queryFn: () => apiClient.getGeographicStates(),
    enabled: !!filters,
    staleTime: 10 * 60 * 1000,
  })
}

// Temporal data hook
export function useTemporalData(filters: any) {
  return useQuery({
    queryKey: ['temporal', filters],
    queryFn: () => apiClient.getTemporalDaily(filters),
    enabled: !!filters,
    staleTime: 10 * 60 * 1000,
  })
}

// ML operations hook
export function useMLOperations() {
  const queryClient = useQueryClient()

  const clusteringMutation = useMutation({
    mutationFn: (nClusters: number) => apiClient.runClustering(nClusters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clustering'] })
    },
  })

  const anomalyMutation = useMutation({
    mutationFn: (contamination: number) => apiClient.detectAnomalies(contamination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] })
    },
  })

  const forecastMutation = useMutation({
    mutationFn: (days: number) => apiClient.generateForecast(days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecast'] })
    },
  })

  return {
    runClustering: clusteringMutation.mutate,
    detectAnomalies: anomalyMutation.mutate,
    generateForecast: forecastMutation.mutate,
    clusteringLoading: clusteringMutation.isPending,
    anomalyLoading: anomalyMutation.isPending,
    forecastLoading: forecastMutation.isPending,
    clusteringError: clusteringMutation.error?.message,
    anomalyError: anomalyMutation.error?.message,
    forecastError: forecastMutation.error?.message,
  }
}