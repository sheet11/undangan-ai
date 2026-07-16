import { wedding as defaultWedding } from "@/config/wedding";
import type { Wedding } from "@/types/wedding";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type CustomerInvitation = { id: string; customerName: string; wedding: Wedding };
const STORAGE_KEY = "wedding-premium-customers";

export const defaultCustomer: CustomerInvitation = { id: "nadya-aldo", customerName: "Nadya & Aldo", wedding: defaultWedding };

export function normalizeCustomer(customer: CustomerInvitation): CustomerInvitation {
  const oldGift = (customer.wedding as any).gift;
  const migratedGifts = customer.wedding.gifts ?? (oldGift ? [oldGift] : defaultWedding.gifts);

  return {
    ...customer,
    wedding: {
      ...defaultWedding,
      ...customer.wedding,
      bride: { ...defaultWedding.bride, ...customer.wedding.bride },
      groom: { ...defaultWedding.groom, ...customer.wedding.groom },
      event: { ...defaultWedding.event, ...customer.wedding.event },
      story: customer.wedding.story ?? defaultWedding.story,
      gifts: migratedGifts,
      images: { ...defaultWedding.images, ...customer.wedding.images },
      audio: (!customer.wedding.audio || customer.wedding.audio.startsWith("https://assets.mixkit.co/music/preview/"))
        ? defaultWedding.audio
        : customer.wedding.audio,
    },
  };
}

// ── Supabase functions ──────────────────────────────────────────────────────

export async function fetchCustomersFromSupabase(): Promise<CustomerInvitation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("customers")
    .select("id, customer_name, wedding")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("fetchCustomersFromSupabase error:", error);
    return [];
  }
  if (!data) return [];
  return data.map((row) =>
    normalizeCustomer({ id: row.id, customerName: row.customer_name, wedding: row.wedding as Wedding })
  );
}

export async function upsertCustomerToSupabase(customer: CustomerInvitation): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("customers").upsert({
    id: customer.id,
    customer_name: customer.customerName,
    wedding: customer.wedding,
  });
  if (error) {
    console.error("upsertCustomerToSupabase error:", error);
  }
}

export async function deleteCustomerFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) {
    console.error("deleteCustomerFromSupabase error:", error);
  }
}

export async function fetchCustomerById(id: string): Promise<CustomerInvitation | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("customers")
    .select("id, customer_name, wedding")
    .eq("id", id)
    .single();
  if (error) {
    console.error("fetchCustomerById error:", error);
    return null;
  }
  if (!data) return null;
  return normalizeCustomer({ id: data.id, customerName: data.customer_name, wedding: data.wedding as Wedding });
}

// ── localStorage fallback ──────────────────────────────────────────────────

let cachedCustomers: CustomerInvitation[] | null = null;

export function getCustomersFromLocal(): CustomerInvitation[] {
  if (typeof window === "undefined") return [defaultCustomer];
  if (cachedCustomers) return cachedCustomers;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const customers: CustomerInvitation[] = saved ? JSON.parse(saved).map(normalizeCustomer) : [defaultCustomer];
    cachedCustomers = customers;
    return customers;
  } catch {
    cachedCustomers = [defaultCustomer];
    return [defaultCustomer];
  }
}

export function saveCustomersToLocal(customers: CustomerInvitation[]) {
  cachedCustomers = customers;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
  }
}

// ── Legacy exports (used by Invitation page fallback) ──────────────────────

export { isSupabaseConfigured };

export function getCustomers(): CustomerInvitation[] {
  return getCustomersFromLocal();
}

export function saveCustomers(customers: CustomerInvitation[]) {
  saveCustomersToLocal(customers);
}

export function getActiveWedding() {
  if (typeof window === "undefined") return defaultWedding;
  const clientId = new URLSearchParams(window.location.search).get("client");
  const customers = getCustomersFromLocal();
  return customers.find((customer) => customer.id === clientId)?.wedding ?? customers[0]?.wedding ?? defaultWedding;
}

export function createCustomer(): CustomerInvitation {
  const id = `customer-${Date.now()}`;
  return { id, customerName: "Customer baru", wedding: structuredClone(defaultWedding) };
}
