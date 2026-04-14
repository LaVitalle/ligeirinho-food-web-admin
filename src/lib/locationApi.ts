import { api, type ApiEnvelope } from './api'

export interface StateDto {
  id: number
  name: string
  abbreviation: string
}

export interface CityDto {
  id: number
  name: string
  stateId: number
}

export async function fetchStates(): Promise<StateDto[]> {
  const { data } = await api.get<ApiEnvelope<StateDto[]>>('/states')
  return Array.isArray(data.data) ? data.data : []
}

export async function fetchCitiesByStateId(stateId: number): Promise<CityDto[]> {
  const { data } = await api.get<ApiEnvelope<CityDto[]>>(`/cities/${stateId}`)
  return Array.isArray(data.data) ? data.data : []
}
