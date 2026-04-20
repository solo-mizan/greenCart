"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Category { _id: string; name: string; slug: string; icon?: string; image?: string }
export interface Product {
  _id: string; name: string; slug: string; description: string;
  price: number; discountPrice?: number; unit: string; quantity: number;
  images: string[]; category: Category; rating: number; reviewCount: number;
  isFeatured: boolean; isActive: boolean; tags?: string[];
}
export interface PaginatedProducts {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
}

interface ProductFilters {
  page?: number; limit?: number; search?: string; category?: string;
  minPrice?: number; maxPrice?: number; sort?: string; featured?: boolean;
}

export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== "") params.set(k, String(v)); });
  return useQuery<PaginatedProducts>({
    queryKey: ["products", filters],
    queryFn: () => axios.get(`/api/products?${params}`).then((r) => ({ data: r.data.data, pagination: r.data.pagination })),
    staleTime: 60_000,
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => axios.get(`/api/products/${id}`).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 120_000,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => axios.get("/api/categories").then((r) => r.data.data),
    staleTime: 300_000,
  });
}
