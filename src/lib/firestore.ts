import {
  type DocumentReference,
  onSnapshot,
  type Query,
  type QuerySnapshot,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { z } from 'zod'

// Firestore subscription adapter: live reads, parsed with the shared Zod schema.
export type LiveState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'ready'; data: T }

export function useLiveDocument<S extends z.ZodType>(
  ref: DocumentReference | null,
  schema: S,
): LiveState<z.infer<S> | null> {
  const [state, setState] = useState<LiveState<z.infer<S> | null>>({ status: 'loading' })
  useEffect(() => {
    if (!ref) return
    setState({ status: 'loading' })
    return onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) return setState({ status: 'ready', data: null })
        const parsed = schema.safeParse({ id: snap.id, ...snap.data() })
        setState(
          parsed.success
            ? { status: 'ready', data: parsed.data }
            : { status: 'error', error: parsed.error },
        )
      },
      (error) => setState({ status: 'error', error }),
    )
  }, [ref, schema])
  return state
}

export function useLiveQuery<S extends z.ZodType>(
  query: Query | null,
  schema: S,
): LiveState<z.infer<S>[]> {
  const [state, setState] = useState<LiveState<z.infer<S>[]>>({ status: 'loading' })
  useEffect(() => {
    if (!query) return
    setState({ status: 'loading' })
    return onSnapshot(
      query,
      (snap: QuerySnapshot) => {
        const rows: z.infer<S>[] = []
        for (const d of snap.docs) {
          const parsed = schema.safeParse({ id: d.id, ...d.data() })
          if (!parsed.success) return setState({ status: 'error', error: parsed.error })
          rows.push(parsed.data)
        }
        setState({ status: 'ready', data: rows })
      },
      (error) => setState({ status: 'error', error }),
    )
  }, [query, schema])
  return state
}
