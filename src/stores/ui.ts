import { create } from 'zustand'

// Zustand holds UI-only state. Server data lives in Firestore subscriptions and TanStack Query.
interface UiState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
