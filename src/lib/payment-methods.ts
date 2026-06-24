import { api, ApiResponse } from "./api";

export type PaymentMethodType = "PIX" | "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "DIGITAL_WALLET";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  type: PaymentMethodType;
  iconKey: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface CreatePaymentMethodDto {
  name: string;
  description?: string;
  type: PaymentMethodType;
  iconKey?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  description?: string;
  type?: PaymentMethodType;
  iconKey?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const paymentMethodService = {
  getAll: (onlyActive = false) => 
    api.get<ApiResponse<PaymentMethod[]>>(`/payment-methods?onlyActive=${onlyActive}`),

  getById: (id: string) => 
    api.get<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`),

  create: (data: CreatePaymentMethodDto) => 
    api.post<ApiResponse<PaymentMethod>>("/payment-methods", data),

  update: (id: string, data: UpdatePaymentMethodDto) => 
    api.put<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`, data),

  toggle: (id: string) => 
    api.patch<ApiResponse<PaymentMethod>>(`/payment-methods/${id}/toggle`, {}),

  delete: (id: string) => 
    api.delete<ApiResponse<null>>(`/payment-methods/${id}`),
};
