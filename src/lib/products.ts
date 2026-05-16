import { api, ApiResponse } from "./api";

export interface Product {
  id: string;
  canteenId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  photoUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CreateProductDto {
  canteenId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: string;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: string;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export const productService = {
  getAll: (canteenId: string, page = 1, perPage = 10, categoryId?: string, search?: string, onlyActive?: boolean) => {
    const params = new URLSearchParams({
      canteenId,
      page: String(page),
      perPage: String(perPage),
    });
    if (categoryId) params.append("categoryId", categoryId);
    if (search) params.append("search", search);
    if (onlyActive !== undefined) params.append("onlyActive", String(onlyActive));
    
    return api.get<ApiResponse<PaginatedResult<Product>>>(`/products?${params.toString()}`);
  },

  getFeatured: (institutionId?: string, limit = 10) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (institutionId) params.append("institutionId", institutionId);
    return api.get<ApiResponse<Product[]>>(`/products/featured?${params.toString()}`);
  },

  getById: (id: string) => api.get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: CreateProductDto) => api.post<ApiResponse<Product>>("/products", data),

  update: (id: string, data: UpdateProductDto) => api.put<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/products/${id}`),

  uploadPhoto: (id: string, photo: File) => {
    const formData = new FormData();
    formData.append("photo", photo);
    return api.post<ApiResponse<Product>>(`/products/${id}/photo`, formData);
  },

  feature: (id: string) => api.patch<ApiResponse<Product>>(`/products/${id}/feature`, {}),

  unfeature: (id: string) => api.patch<ApiResponse<Product>>(`/products/${id}/unfeature`, {}),
};
