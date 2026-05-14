import { api } from "./api";

export interface ApiResponse<T> {
  data: T;
  status: {
    code: number;
    message: string;
  };
  pagination?: {
    page: number;
    perPage: number;
    hasNextPage: boolean;
  };
}

export interface State {
  id: number;
  name: string;
  abbreviation: string;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
}

export const locationService = {
  getStates: () => api.get<ApiResponse<State[]>>("/states"),
  getCitiesByState: (stateId: number) => api.get<ApiResponse<City[]>>(`/cities/${stateId}`),
};
