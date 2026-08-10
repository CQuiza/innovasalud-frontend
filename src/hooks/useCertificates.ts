import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { certificateService } from '../services/certificateService'
import type { CertificateBatchIssueRequest, CertificateCreate, CertificateIssueRequest, CertificateUpdate } from '../types'

const QUERY_KEY = ['certificates']

function invalidateCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: ['users'] })
}

export function useCertificates(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => certificateService.list(params),
    ...options,
  })
}

export function useCertificate(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => certificateService.getById(id),
    enabled: id > 0,
  })
}

export function useCreateCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateCreate) => certificateService.create(data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useBatchIssueCertificates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateBatchIssueRequest) => certificateService.issueBatch(data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useIssueCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateIssueRequest) => certificateService.issue(data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useUpdateCertificate(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateUpdate) => certificateService.update(id, data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => certificateService.remove(id),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useCertificateByUuid(uuid: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'uuid', uuid],
    queryFn: () => certificateService.viewByUuid(uuid),
    enabled: !!uuid,
  })
}
