import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Account = Tables<"accounts">;
export type Category = Tables<"categories">;
export type Transaction = Tables<"transactions">;

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("accounts").select("*").order("created_at");
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });
}

export function useCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["categories", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });
}

export function useTransactions(filters?: { month?: number; year?: number; categoryId?: string; accountId?: string; type?: string; search?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, filters],
    queryFn: async () => {
      let query = supabase.from("transactions").select("*, categories(name, icon), accounts(name)").order("date", { ascending: false });

      if (filters?.month !== undefined && filters?.year !== undefined) {
        const startDate = new Date(filters.year, filters.month, 1).toISOString().split("T")[0];
        const endDate = new Date(filters.year, filters.month + 1, 0).toISOString().split("T")[0];
        query = query.gte("date", startDate).lte("date", endDate);
      }
      if (filters?.categoryId) query = query.eq("category_id", filters.categoryId);
      if (filters?.accountId) query = query.eq("account_id", filters.accountId);
      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.search) query = query.ilike("description", `%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (tx: Omit<TablesInsert<"transactions">, "user_id">) => {
      const { error } = await supabase.from("transactions").insert({ ...tx, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast.success("Transação registrada!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TablesInsert<"transactions">>) => {
      const { error } = await supabase.from("transactions").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast.success("Transação atualizada!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast.success("Transação excluída!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<TablesInsert<"accounts">, "user_id">) => {
      const { error } = await supabase.from("accounts").insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); toast.success("Conta criada!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TablesInsert<"accounts">>) => {
      const { error } = await supabase.from("accounts").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); toast.success("Conta atualizada!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); toast.success("Conta excluída!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: Omit<TablesInsert<"categories">, "user_id">) => {
      const { error } = await supabase.from("categories").insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Categoria criada!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<TablesInsert<"categories">>) => {
      const { error } = await supabase.from("categories").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Categoria atualizada!"); },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Categoria excluída!"); },
    onError: (e) => toast.error(e.message),
  });
}
