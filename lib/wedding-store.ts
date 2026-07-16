"use client";

import { wedding as defaultWedding } from "@/config/wedding";
import type { Wedding } from "@/types/wedding";

export type CustomerInvitation = { id: string; customerName: string; wedding: Wedding };
const STORAGE_KEY = "wedding-premium-customers";
let cachedCustomers: CustomerInvitation[] | null = null;

export const defaultCustomer: CustomerInvitation = { id: "nadya-aldo", customerName: "Nadya & Aldo", wedding: defaultWedding };

function normalizeCustomer(customer: CustomerInvitation): CustomerInvitation {
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

export function getCustomers(): CustomerInvitation[] {
  if (typeof window === "undefined") return [defaultCustomer];
  if (cachedCustomers) return cachedCustomers;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const customers: CustomerInvitation[] = saved ? JSON.parse(saved).map(normalizeCustomer) : [defaultCustomer];
    cachedCustomers = customers;
    return customers;
  } catch {
    const customers = [defaultCustomer];
    cachedCustomers = customers;
    return customers;
  }
}

export function saveCustomers(customers: CustomerInvitation[]) {
  cachedCustomers = customers;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function getActiveWedding() {
  if (typeof window === "undefined") return defaultWedding;
  const clientId = new URLSearchParams(window.location.search).get("client");
  const customers = getCustomers();
  return customers.find((customer) => customer.id === clientId)?.wedding ?? customers[0]?.wedding ?? defaultWedding;
}

export function createCustomer(): CustomerInvitation {
  const id = `customer-${Date.now()}`;
  return { id, customerName: "Customer baru", wedding: structuredClone(defaultWedding) };
}
