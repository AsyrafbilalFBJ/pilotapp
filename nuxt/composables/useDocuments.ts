import type { DocumentsResponse } from '~/types/api'

/** GET /documents — the pilot's documents with expiry status (Home). */
export function useDocuments() {
  const api = useApi()
  return useAsyncData('documents', () => api<DocumentsResponse>('/documents'))
}
