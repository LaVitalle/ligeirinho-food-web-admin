import { api, ApiResponse } from "./api";

export interface Institution {
  id: string;
  name: string;
  photoUrl: string | null;
  accessCode: string;
  stateId: number;
  stateName: string | null;
  cityId: number;
  cityName: string | null;
  createdAt: string;
}

export interface CreateInstitutionDto {
  name: string;
  stateId: number;
  cityId: number;
  photo?: File;
}

export interface UpdateInstitutionDto {
  name?: string;
  stateId?: number;
  cityId?: number;
  photo?: File;
}

export const institutionService = {
  getAll: (page = 1, perPage = 10, search?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (search) params.append("search", search);
    return api.get<ApiResponse<Institution[]>>(`/institutions?${params.toString()}`);
  },

  getCount: () => api.get<ApiResponse<{ total: number }>>("/institutions/count"),

  getById: (id: string) => api.get<ApiResponse<Institution>>(`/institutions/${id}`),

  create: (data: CreateInstitutionDto) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("stateId", String(data.stateId));
    formData.append("cityId", String(data.cityId));
    if (data.photo) {
      formData.append("photo", data.photo);
    }
    return api.post<ApiResponse<Institution>>("/institutions", formData);
  },

  update: (id: string, data: UpdateInstitutionDto) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.stateId) formData.append("stateId", String(data.stateId));
    if (data.cityId) formData.append("cityId", String(data.cityId));
    if (data.photo) {
      formData.append("photo", data.photo);
    }
    return api.put<ApiResponse<Institution>>(`/institutions/${id}`, formData);
  },

  delete: (id: string) => api.delete<ApiResponse<null>>(`/institutions/${id}`),
};
