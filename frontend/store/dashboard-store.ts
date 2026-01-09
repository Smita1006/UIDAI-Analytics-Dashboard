import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Filters {
  selectedStates: string[]
  selectedServices: string[]
  dateRange: {
    start: string
    end: string
  }
  selectedDistricts: string[]
}

interface DashboardStore {
  filters: Filters
  updateFilters: (filters: Partial<Filters>) => void
  clearFilters: () => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Current view
  currentView: string
  setCurrentView: (view: string) => void
}

const defaultFilters: Filters = {
  selectedStates: [],
  selectedServices: [],
  dateRange: {
    start: '',
    end: ''
  },
  selectedDistricts: []
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      updateFilters: (newFilters) => 
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),
      clearFilters: () => set({ filters: defaultFilters }),
      
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      currentView: 'overview',
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'uidai-dashboard-store',
      partialize: (state) => ({ filters: state.filters }),
    }
  )
)