import { api, ApiResponse } from "./api";

export interface Canteen {
  id: string;
  institutionId: string;
  name: string;
  cnpj: string | null;
  block: string | null;
  room: string | null;
  logoUrl: string | null;
  isOpen: boolean;
  createdAt: string;
}

export interface CreateCanteenDto {
  name: string;
  institutionId: string;
  cnpj?: string;
  block?: string;
  room?: string;
  sellerName: string;
  sellerEmail: string;
  sellerPassword: string;
}

export interface UpdateCanteenDto {
  name?: string;
  cnpj?: string;
  block?: string;
  room?: string;
}

export const canteenService = {
  getAll: (page = 1, perPage = 10, institutionId?: string, search?: string) => {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (institutionId) params.append("institutionId", institutionId);
    if (search) params.append("search", search);
    return api.get<ApiResponse<Canteen[]>>(`/canteens?${params.toString()}`);
  },

  getCount: (institutionId?: string) => {
    const params = new URLSearchParams();
    if (institutionId) params.append("institutionId", institutionId);
    return api.get<ApiResponse<{ total: number }>>(`/canteens/count?${params.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Canteen>>(`/canteens/${id}`),

  getMine: () => api.get<ApiResponse<Canteen>>("/canteens/me"),

  create: (data: CreateCanteenDto) => api.post<ApiResponse<Canteen>>("/canteens", data),

  update: (id: string, data: UpdateCanteenDto) => api.put<ApiResponse<Canteen>>(`/canteens/${id}`, data),

  updateMine: (data: UpdateCanteenDto) => api.patch<ApiResponse<Canteen>>("/canteens/me", data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/canteens/${id}`),

  toggleOpen: (id: string) => api.patch<ApiResponse<Canteen>>(`/canteens/${id}/toggle-open`, {}),

  uploadLogo: (id: string, logo: File) => {
    const formData = new FormData();
    formData.append("logo", logo);
    return api.post<ApiResponse<Canteen>>(`/canteens/${id}/logo`, formData);
  },
};
