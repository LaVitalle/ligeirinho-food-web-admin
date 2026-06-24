import { api, ApiResponse } from "./api";

export interface Icon {
  id: string;
  key: string;
  name: string;
  url: string;
  tag: string | null;
  createdAt: string;
}

export interface CreateIconDto {
  key: string;
  name: string;
  tag?: string;
  file: File;
}

export interface UpdateIconDto {
  name?: string;
  tag?: string;
  file?: File;
}

export const iconService = {
  getAll: (search?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (tag) params.append("tag", tag);
    
    const queryStr = params.toString();
    return api.get<ApiResponse<Icon[]>>(`/icons${queryStr ? `?${queryStr}` : ""}`);
  },

  getById: (id: string) => api.get<ApiResponse<Icon>>(`/icons/${id}`),

  create: (data: CreateIconDto) => {
    const formData = new FormData();
    formData.append("key", data.key);
    formData.append("name", data.name);
    if (data.tag) {
      formData.append("tag", data.tag);
    }
    formData.append("file", data.file);
    return api.post<ApiResponse<Icon>>("/icons", formData);
  },

  update: (id: string, data: UpdateIconDto) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.tag !== undefined) formData.append("tag", data.tag || "");
    if (data.file) formData.append("file", data.file);
    return api.put<ApiResponse<Icon>>(`/icons/${id}`, formData);
  },

  delete: (id: string) => api.delete<ApiResponse<null>>(`/icons/${id}`),
};
