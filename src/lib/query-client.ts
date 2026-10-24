import { QueryClient } from '@tanstack/react-query'

// TanStack Query is for mutations and one-shot calls (Functions). Live reads go
// through the Firestore subscription adapter in `lib/firestore`.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { retry: 0 },
  },
})
