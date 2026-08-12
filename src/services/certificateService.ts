import api from './api'
import type { Certificate, CertificateCreate, CertificateIssueRequest, CertificateUpdate, CertificateBatchIssueRequest, CertificateBatchIssueResult, CertificateListResponse, CertificateRenewRequest } from '../types'

export const certificateService = {
  list: async (params?: Record<string, unknown>): Promise<CertificateListResponse> => {
    const { data } = await api.get<CertificateListResponse>('/certificates', { params })
    return data
  },

  getById: async (id: number): Promise<Certificate> => {
    const { data } = await api.get<Certificate>(`/certificates/${id}`)
    return data
  },

  create: async (payload: CertificateCreate): Promise<Certificate> => {
    const { data } = await api.post<Certificate>('/certificates', payload)
    return data
  },

  issue: async (payload: CertificateIssueRequest): Promise<Certificate> => {
    const { data } = await api.post<Certificate>('/certificates', payload)
    return data
  },

  issueBatch: async (payload: CertificateBatchIssueRequest): Promise<CertificateBatchIssueResult> => {
    const { data } = await api.post<CertificateBatchIssueResult>('/certificates/batch', payload)
    return data
  },

  update: async (id: number, payload: CertificateUpdate): Promise<Certificate> => {
    const { data } = await api.patch<Certificate>(`/certificates/${id}`, payload)
    return data
  },

  renew: async (id: number, payload: CertificateRenewRequest): Promise<Certificate> => {
    const { data } = await api.post<Certificate>(`/certificates/${id}/renew`, payload)
    return data
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/certificates/${id}`)
  },

  viewByUuid: async (uuid: string): Promise<Certificate> => {
    const { data } = await api.get<Certificate>(`/certificates/view/${uuid}`)
    return data
  },

  viewQrByUuid: async (uuid: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/certificates/view/${uuid}/qr`, {
      responseType: 'blob',
    })
    return data
  },
}
