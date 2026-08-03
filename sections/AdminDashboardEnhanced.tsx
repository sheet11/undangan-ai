"use client";

import Link from "next/link";
import Image from "next/image";
import { Copy, ExternalLink, Pause, Play, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  createCustomer,
  defaultCustomer,
  deleteCustomerFromSupabase,
  fetchCustomersFromSupabase,
  getCustomersFromLocal,
  isSupabaseConfigured,
  saveCustomersToLocal,
  type CustomerInvitation,
  upsertCustomerToSupabase,
} from "@/lib/wedding-store";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

function TextField({ label, value, onChange, type = "text" }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-[#587060]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15"
      />
    </label>
  );
}

async function compressImage(file: File) {
  const source = URL.createObjectURL(file);
  const image = new window.Image();
  image.src = source;
  await image.decode();

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(source);
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function AdminDashboardEnhanced() {
  const [customers, setCustomers] = useState<CustomerInvitation[]>([]);
  const [activeId, setActiveId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      if (isSupabaseConfigured) {
        const list = await fetchCustomersFromSupabase();
        if (list.length > 0) {
          setCustomers(list);
          setActiveId(list[0].id);
          setMounted(true);
          return;
        }
      }

      const list = getCustomersFromLocal();
      setCustomers(list);
      setActiveId(list[0]?.id ?? defaultCustomer.id);
      setMounted(true);
    }

    void loadCustomers();
  }, []);

  useEffect(() => {
    setIsPlayingPreview(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.load();
    }
  }, [activeId]);

  const active = customers.find((customer) => customer.id === activeId) ?? customers[0];
  if (!mounted || !active) return null;

  const update = (path: string, value: unknown) => {
    setSaved(false);
    setCustomers((items) =>
      items.map((item) => {
        if (item.id !== active.id) return item;

        const next = structuredClone(item);
        const parts = path.split(".");

        if (parts.length === 1) {
          if (parts[0] === "customerName") next.customerName = String(value);
          else if (parts[0] === "audio") next.wedding.audio = String(value);
          else (next.wedding as Record<string, unknown>)[parts[0]] = value;
        } else if (parts.length === 2) {
          const [group, key] = parts;
          const groupValue = (next.wedding as Record<string, unknown>)[group] as Record<string, unknown>;
          (next.wedding as Record<string, unknown>)[group] = {
            ...groupValue,
            [key]: value,
          };
        } else if (parts.length === 3) {
          const [group, indexStr, key] = parts;
          const index = Number.parseInt(indexStr, 10);
          const groupValue = (next.wedding as Record<string, unknown>)[group] as Record<string, unknown>[];
          if (groupValue[index]) {
            groupValue[index] = { ...groupValue[index], [key]: value };
          }
        }

        return next;
      })
    );
  };

  const addCustomer = async () => {
    const next = createCustomer();
    const nextCustomers = [...customers, next];
    setCustomers(nextCustomers);
    setActiveId(next.id);
    setSaved(false);
    saveCustomersToLocal(nextCustomers);
    if (isSupabaseConfigured) await upsertCustomerToSupabase(next);
  };

  const removeCustomer = async () => {
    if (customers.length === 1) return;

    const nextCustomers = customers.filter((customer) => customer.id !== active.id);
    setCustomers(nextCustomers);
    setActiveId(nextCustomers[0].id);
    setSaved(false);
    saveCustomersToLocal(nextCustomers);
    if (isSupabaseConfigured) await deleteCustomerFromSupabase(active.id);
  };

  const persist = async () => {
    setSaving(true);
    saveCustomersToLocal(customers);
    if (isSupabaseConfigured) {
      await upsertCustomerToSupabase(active);
    }
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  const invitationUrl = typeof window === "undefined"
    ? "/"
    : `${window.location.origin}/?client=${active.id}${guestName ? `&to=${encodeURIComponent(guestName)}` : ""}`;

  const copyLink = () => navigator.clipboard?.writeText(invitationUrl);

  const uploadHero = async (file?: File) => {
    if (!file) return;
    const image = await compressImage(file);
    update("images.hero", image);
  };

  const uploadPrewedding = async (files: FileList | null) => {
    if (!files?.length) return;

    const images = await Promise.all(Array.from(files).map((file) => compressImage(file)));
    const nextGallery = [...(active.wedding.gallery?.prewedding ?? []), ...images];
    update("gallery.prewedding", nextGallery);
  };

  const handleAudioUpload = async (file?: File) => {
    if (!file) return;

    const limit = 2.5 * 1024 * 1024;
    if (file.size > limit) {
      alert("Ukuran audio melebihi batas 2.5 MB. Untuk file berukuran besar, silakan gunakan opsi Tautan Audio.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) update("audio", result);
    };
    reader.readAsDataURL(file);
  };

  const togglePreview = () => {
    if (!previewAudioRef.current) return;

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play()
        .then(() => setIsPlayingPreview(true))
        .catch((error) => console.error("Preview failed:", error));
    }
  };

  const preweddingPreview = (active.wedding.gallery?.prewedding ?? []).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#23382f]">
      <header className="border-b border-[#d9d3c6] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="font-serif text-2xl">Wedding<span className="text-[#a68a50]">.</span>Admin</Link>
            {isSupabaseConfigured ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">☁️ Cloud Sync (Supabase Aktif)</span>
            ) : (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">⚠️ Mode Local (Supabase Tidak Aktif)</span>
            )}
          </div>

          <Link href={`/?client=${active.id}`} target="_blank" className="inline-flex items-center gap-2 text-xs font-medium text-[#587060]">
            <ExternalLink size={14} /> Lihat undangan
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl bg-[#23382f] p-4 text-white">
          <div className="mb-4 flex items-center justify-between px-2">
            <p className="text-xs tracking-[.16em] uppercase text-[#ead6a1]">Customer</p>
            <button onClick={addCustomer} className="grid size-7 place-items-center rounded-lg bg-[#ead6a1] text-[#23382f]" aria-label="Tambah customer">
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => {
                  setActiveId(customer.id);
                  setSaved(false);
                }}
                className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${customer.id === active.id ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}
              >
                <span className="block font-medium">{customer.customerName}</span>
                <span className="mt-0.5 block text-[10px] text-white/45">{customer.wedding.bride.nickName} &amp; {customer.wedding.groom.nickName}</span>
              </button>
            ))}
          </div>
        </aside>

        <section>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#e2ddd2] bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs tracking-[.22em] uppercase text-[#a68a50]">Nama customer</p>
              <h1 className="mt-2 font-serif text-3xl">{active.customerName}</h1>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={removeCustomer} className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c5] px-4 py-2 text-xs font-medium text-[#587060]">
                <Trash2 size={14} /> Hapus
              </button>
              <button onClick={persist} className="inline-flex items-center gap-2 rounded-full bg-[#23382f] px-4 py-2 text-xs font-semibold text-white">
                <Save size={14} /> {saving ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan semua"}
              </button>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <EditorCard title="Foto utama undangan">
              <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <label className="group relative block aspect-[16/9] cursor-pointer overflow-hidden rounded-xl bg-[#23382f]">
                  <Image src={active.wedding.images.hero} unoptimized={active.wedding.images.hero.startsWith("data:")} alt="Preview foto customer" fill sizes="100vw" className="object-cover object-center transition duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 grid place-items-center bg-black/25 text-white/90">
                    <div className="rounded-full bg-white/20 px-4 py-2 text-xs font-medium backdrop-blur">Klik untuk ganti foto</div>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadHero(event.target.files?.[0])} />
                </label>

                <div className="space-y-3">
                  <TextField label="Tautan foto hero" value={active.wedding.images.hero} onChange={(value) => update("images.hero", value)} />
                  <TextField label="Audio URL" value={active.wedding.audio ?? ""} onChange={(value) => update("audio", value)} />

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium text-[#587060]">Upload audio</span>
                    <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm">
                      <Upload size={14} /> Pilih audio
                    </span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(event) => void handleAudioUpload(event.target.files?.[0])} />
                  </label>

                  {active.wedding.audio && (
                    <div className="flex items-center gap-2">
                      <button onClick={togglePreview} className="inline-flex items-center gap-2 rounded-full border border-[#d8d2c5] px-3 py-2 text-xs font-medium">
                        {isPlayingPreview ? <Pause size={14} /> : <Play size={14} />}
                        {isPlayingPreview ? "Pause preview" : "Play preview"}
                      </button>
                      <audio ref={previewAudioRef} src={active.wedding.audio} preload="auto" />
                    </div>
                  )}
                </div>
              </div>
            </EditorCard>

            <EditorCard title="Tema undangan">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#587060]">Pilih UI undangan</span>
                  <select
                    value={active.wedding.uiTheme ?? "classic"}
                    onChange={(event) => update("uiTheme", event.target.value)}
                    className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15"
                  >
                    <option value="classic">Classic</option>
                    <option value="second">UI Kedua</option>
                  </select>
                </label>

                <div className="rounded-xl bg-[#f7f4ed] p-4 text-sm text-[#587060]">
                  <p className="font-medium text-[#23382f]">Catatan</p>
                  <p className="mt-2">Pilih UI Kedua untuk menampilkan layout alternatif di halaman undangan.</p>
                </div>
              </div>
            </EditorCard>

            <EditorCard title="Prewedding gallery">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#587060]">URL prewedding (pisah dengan koma)</span>
                  <textarea
                    rows={4}
                    value={(active.wedding.gallery?.prewedding ?? []).join(", ")}
                    onChange={(event) => update("gallery.prewedding", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                    className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-[#587060]">Upload prewedding</span>
                  <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm">
                    <Upload size={14} /> Tambah foto prewedding
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => void uploadPrewedding(event.target.files)} />
                </label>

                {preweddingPreview.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {preweddingPreview.map((image, index) => (
                      <div key={`${image}-${index}`} className="relative overflow-hidden rounded-xl border border-[#e2ddd2] bg-white">
                        <Image src={image} alt={`Prewedding ${index + 1}`} width={400} height={500} className="h-48 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </EditorCard>

            <EditorCard title="Profil undangan">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Nama customer" value={active.customerName} onChange={(value) => update("customerName", value)} />
                <TextField label="Nama tamu" value={guestName} onChange={setGuestName} />
                <TextField label="Nama Panggilan Mempelai Pria" value={active.wedding.groom.nickName} onChange={(value) => update("groom.nickName", value)} />
                <TextField label="Nama Lengkap Mempelai Pria" value={active.wedding.groom.fullName} onChange={(value) => update("groom.fullName", value)} />
                <TextField label="Nama Panggilan Mempelai Wanita" value={active.wedding.bride.nickName} onChange={(value) => update("bride.nickName", value)} />
                <TextField label="Nama Lengkap Mempelai Wanita" value={active.wedding.bride.fullName} onChange={(value) => update("bride.fullName", value)} />
                <TextField label="Ayah Mempelai Pria" value={active.wedding.groom.father} onChange={(value) => update("groom.father", value)} />
                <TextField label="Ibu Mempelai Pria" value={active.wedding.groom.mother} onChange={(value) => update("groom.mother", value)} />
                <TextField label="Ayah Mempelai Wanita" value={active.wedding.bride.father} onChange={(value) => update("bride.father", value)} />
                <TextField label="Ibu Mempelai Wanita" value={active.wedding.bride.mother} onChange={(value) => update("bride.mother", value)} />
              </div>
            </EditorCard>

            <EditorCard title="Acara & lokasi">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Tanggal acara" value={active.wedding.event.day} onChange={(value) => update("event.day", value)} />
                <TextField label="Tanggal / waktu" type="datetime-local" value={active.wedding.event.date} onChange={(value) => update("event.date", value)} />
                <TextField label="Akad" value={active.wedding.event.akad} onChange={(value) => update("event.akad", value)} />
                <TextField label="Resepsi" value={active.wedding.event.reception} onChange={(value) => update("event.reception", value)} />
                <TextField label="Venue" value={active.wedding.event.venue} onChange={(value) => update("event.venue", value)} />
                <TextField label="Maps URL" value={active.wedding.event.maps} onChange={(value) => update("event.maps", value)} />
                <div className="md:col-span-2">
                  <TextField label="Alamat lengkap" value={active.wedding.event.address} onChange={(value) => update("event.address", value)} />
                </div>
              </div>
            </EditorCard>

            <EditorCard title="Tautan undangan">
              <div className="space-y-4">
                <TextField label="Link undangan" value={invitationUrl} onChange={() => {}} />
                <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-full bg-[#23382f] px-4 py-2 text-xs font-semibold text-white">
                  <Copy size={14} /> Salin link undangan
                </button>
              </div>
            </EditorCard>
          </div>
        </section>
      </div>
    </main>
  );
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#e2ddd2] bg-white p-6 shadow-sm">
      <h2 className="mb-5 font-serif text-3xl">{title}</h2>
      {children}
    </section>
  );
}
