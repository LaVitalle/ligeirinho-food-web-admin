import { api, ApiResponse } from "./api";

export interface Category {
  id: string;
  name: string;
  iconKey: string | null;
  displayOrder: number;
}

export interface CreateCategoryDto {
  name: string;
  iconKey?: string;
  displayOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  iconKey?: string;
  displayOrder?: number;
}

export const categoryService = {
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),

  create: (data: CreateCategoryDto) => api.post<ApiResponse<Category>>("/categories", data),

  update: (id: string, data: UpdateCategoryDto) => api.put<ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/categories/${id}`),
};
