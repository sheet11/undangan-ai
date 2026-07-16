"use client";

import Link from "next/link";
import Image from "next/image";
import { Copy, ExternalLink, Music, Pause, Play, Plus, RotateCcw, Save, Trash2, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  createCustomer, defaultCustomer, isSupabaseConfigured, type CustomerInvitation,
  fetchCustomersFromSupabase, upsertCustomerToSupabase, deleteCustomerFromSupabase,
  getCustomersFromLocal, saveCustomersToLocal,
} from "@/lib/wedding-store";

type TextFieldProps = { label: string; value: string; onChange: (value: string) => void; type?: string };
function TextField({ label, value, onChange, type = "text" }: TextFieldProps) { return <label className="block"><span className="mb-2 block text-xs font-medium text-[#587060]">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15" /></label>; }

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

export default function AdminDashboard() {
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
      // Fallback: localStorage
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

  const update = (path: string, value: any) => {
    setSaved(false);
    setCustomers((items) => items.map((item) => {
      if (item.id !== active.id) return item;
      const next = structuredClone(item);
      const parts = path.split(".");
      if (parts.length === 1) {
        if (parts[0] === "customerName") next.customerName = value;
        else if (parts[0] === "audio") next.wedding.audio = value;
        else (next.wedding as any)[parts[0]] = value;
      } else if (parts.length === 2) {
        const [group, key] = parts;
        (next.wedding as any)[group][key] = value;
      } else if (parts.length === 3) {
        const [group, indexStr, key] = parts;
        const index = parseInt(indexStr, 10);
        (next.wedding as any)[group][index][key] = value;
      }
      return next;
    }));
  };
  const addCustomer = async () => {
    const next = createCustomer();
    const nextCustomers = [...customers, next];
    setCustomers(nextCustomers);
    setActiveId(next.id);
    setSaved(false);
    saveCustomersToLocal(nextCustomers); // Always save local backup
    if (isSupabaseConfigured) await upsertCustomerToSupabase(next);
  };
  const removeCustomer = async () => {
    if (customers.length === 1) return;
    const nextCustomers = customers.filter((customer) => customer.id !== active.id);
    setCustomers(nextCustomers);
    setActiveId(nextCustomers[0].id);
    setSaved(false);
    saveCustomersToLocal(nextCustomers); // Always save local backup
    if (isSupabaseConfigured) await deleteCustomerFromSupabase(active.id);
  };
  const persist = async () => {
    setSaving(true);
    saveCustomersToLocal(customers); // Always save local backup
    if (isSupabaseConfigured) {
      await upsertCustomerToSupabase(active);
    }
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };
  const invitationUrl = typeof window === "undefined" ? "/" : `${window.location.origin}/?client=${active.id}${guestName ? `&to=${encodeURIComponent(guestName)}` : ""}`;
  const copyLink = () => navigator.clipboard?.writeText(invitationUrl);
  const uploadHero = async (file: File) => {
    const image = await compressImage(file);
    update("images.hero", image);
  };
  const handleAudioUpload = async (file: File) => {
    const limit = 2.5 * 1024 * 1024;
    if (file.size > limit) {
      alert("Ukuran audio melebihi batas 2.5 MB. Untuk file berukuran besar, silakan gunakan opsi Tautan Audio.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        update("audio", result);
      }
    };
    reader.readAsDataURL(file);
  };
  const togglePreview = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setIsPlayingPreview(true);
      }).catch((err) => {
        console.error("Preview failed:", err);
      });
    }
  };
  return <main className="min-h-screen bg-[#f7f4ed] text-[#23382f]"><header className="border-b border-[#d9d3c6] bg-white/80 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"><div className="flex flex-wrap items-center gap-3"><Link href="/" className="font-serif text-2xl">Wedding<span className="text-[#a68a50]">.</span>Admin</Link>{isSupabaseConfigured ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">☁️ Cloud Sync (Supabase Aktif)</span> : <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">⚠️ Mode Local (Supabase Tidak Aktif)</span>}</div><Link href={`/?client=${active.id}`} target="_blank" className="inline-flex items-center gap-2 text-xs font-medium text-[#587060]"><ExternalLink size={14} /> Lihat undangan</Link></div></header><div className="mx-auto grid max-w-7xl gap-7 px-5 py-8 sm:px-8 lg:grid-cols-[260px_1fr]"><aside className="h-fit rounded-2xl bg-[#23382f] p-4 text-white"><div className="mb-4 flex items-center justify-between px-2"><p className="text-xs tracking-[.16em] uppercase text-[#ead6a1]">Customer</p><button onClick={addCustomer} className="grid size-7 place-items-center rounded-lg bg-[#ead6a1] text-[#23382f]" aria-label="Tambah customer"><Plus size={16} /></button></div><div className="space-y-1">{customers.map((customer) => <button key={customer.id} onClick={() => { setActiveId(customer.id); setSaved(false); }} className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${customer.id === active.id ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10"}`}><span className="block font-medium">{customer.customerName}</span><span className="mt-0.5 block text-[10px] text-white/45">{customer.wedding.bride.nickName} &amp; {customer.wedding.groom.nickName}</span></button>)}</div></aside><section><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold tracking-[.25em] uppercase text-[#a68a50]">Editor undangan</p><h1 className="mt-2 font-serif text-4xl">{active.customerName}</h1></div><div className="flex gap-2"><button onClick={removeCustomer} disabled={customers.length === 1} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14} /> Hapus</button><button onClick={persist} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#23382f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-60"><Save size={14} /> {saving ? "Menyimpan…" : saved ? "Tersimpan ✓" : "Simpan perubahan"}</button></div></div><div className="mb-7 flex flex-col gap-3 rounded-2xl border border-[#c6a969]/40 bg-[#fffdf8] p-4"><div className="flex flex-wrap items-center gap-3"><p className="text-xs text-[#587060]">Tautan undangan</p><code className="max-w-full flex-1 truncate rounded-lg bg-[#f1ece1] px-3 py-2 text-xs">{invitationUrl}</code><button onClick={copyLink} className="grid size-8 place-items-center rounded-lg border border-[#d8d2c5]" aria-label="Salin tautan"><Copy size={14} /></button></div><div className="flex items-center gap-3"><label className="shrink-0 text-xs font-medium text-[#587060]">Nama tamu:</label><input id="guest-name-input" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="contoh: Bapak Budi" className="flex-1 rounded-xl border border-[#d8d2c5] bg-white px-4 py-2 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15" /><p className="shrink-0 text-xs text-[#587060]">→ tampil sebagai <span className="font-semibold text-[#23382f]">{guestName || "Tamu Undangan"}</span></p></div><p className="text-[10px] leading-5 text-[#a0998a]">Isi nama tamu lalu salin tautannya. Setiap tamu mendapat tautan unik dengan namanya sendiri.</p></div><div className="grid gap-5 xl:grid-cols-2"><EditorCard title="Foto utama undangan"><label className="group relative block aspect-[16/9] cursor-pointer overflow-hidden rounded-xl bg-[#23382f]"><Image src={active.wedding.images.hero} unoptimized={active.wedding.images.hero.startsWith("data:")} alt="Preview foto customer" fill sizes="(max-width: 1280px) 100vw, 50vw" className="object-cover opacity-75 transition group-hover:scale-105" /><span className="absolute inset-0 grid place-items-center bg-[#23382f]/25 text-xs font-medium text-white">Pilih foto cover</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadHero(file); }} className="sr-only" /></label><p className="mt-3 text-xs leading-5 text-[#587060]">JPG, PNG, atau WebP. Foto akan dikompresi otomatis agar tetap ringan.</p></EditorCard><EditorCard title="Profil customer"><TextField label="Nama customer" value={active.customerName} onChange={(value) => update("customerName", value)} /></EditorCard><EditorCard title="Informasi acara"><div className="grid gap-4 sm:grid-cols-2"><TextField label="Tanggal &amp; waktu" type="datetime-local" value={active.wedding.event.date.slice(0, 16)} onChange={(value) => update("event.date", `${value}+07:00`)} /><TextField label="Hari / tanggal tampil" value={active.wedding.event.day} onChange={(value) => update("event.day", value)} /><TextField label="Akad" value={active.wedding.event.akad} onChange={(value) => update("event.akad", value)} /><TextField label="Resepsi" value={active.wedding.event.reception} onChange={(value) => update("event.reception", value)} /><TextField label="Venue" value={active.wedding.event.venue} onChange={(value) => update("event.venue", value)} /><TextField label="Alamat" value={active.wedding.event.address} onChange={(value) => update("event.address", value)} /><div className="sm:col-span-2"><TextField label="Tautan Google Maps" value={active.wedding.event.maps} onChange={(value) => update("event.maps", value)} /></div></div></EditorCard><EditorCard title="Mempelai wanita"><div className="grid gap-4"><TextField label="Nama lengkap" value={active.wedding.bride.fullName} onChange={(value) => update("bride.fullName", value)} /><TextField label="Nama panggilan" value={active.wedding.bride.nickName} onChange={(value) => update("bride.nickName", value)} /><TextField label="Nama ayah" value={active.wedding.bride.father} onChange={(value) => update("bride.father", value)} /><TextField label="Nama ibu" value={active.wedding.bride.mother} onChange={(value) => update("bride.mother", value)} /></div></EditorCard><EditorCard title="Mempelai pria"><div className="grid gap-4"><TextField label="Nama lengkap" value={active.wedding.groom.fullName} onChange={(value) => update("groom.fullName", value)} /><TextField label="Nama panggilan" value={active.wedding.groom.nickName} onChange={(value) => update("groom.nickName", value)} /><TextField label="Nama ayah" value={active.wedding.groom.father} onChange={(value) => update("groom.father", value)} /><TextField label="Nama ibu" value={active.wedding.groom.mother} onChange={(value) => update("groom.mother", value)} /></div></EditorCard><EditorCard title="Perjalanan Cinta (Love Story)"><div className="space-y-6">{active.wedding.story.map((item, index) => <div key={index} className="relative rounded-xl border border-[#d8d2c5] bg-[#fffdf8] p-4"><button onClick={() => { const nextStory = active.wedding.story.filter((_, i) => i !== index); update("story", nextStory); }} className="absolute right-4 top-4 text-xs font-semibold text-red-600 hover:underline">Hapus</button><div className="grid gap-4 sm:grid-cols-3"><TextField label="Tahun" value={item.year} onChange={(value) => update(`story.${index}.year`, value)} /><div className="sm:col-span-2"><TextField label="Judul" value={item.title} onChange={(value) => update(`story.${index}.title`, value)} /></div><div className="sm:col-span-3"><label className="block"><span className="mb-2 block text-xs font-medium text-[#587060]">Deskripsi</span><textarea value={item.description} onChange={(e) => update(`story.${index}.description`, e.target.value)} className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15" rows={3} /></label></div></div></div>)}<button onClick={() => { const nextStory = [...active.wedding.story, { year: "", title: "", description: "" }]; update("story", nextStory); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#c6a969] bg-[#fffdf8] py-3 text-sm font-semibold text-[#23382f] hover:bg-[#c6a969]/5"><Plus size={16} /> Tambah Milestone Baru</button></div></EditorCard><EditorCard title="Hadiah &amp; Rekening"><div className="space-y-6">{active.wedding.gifts.map((gift, index) => <div key={index} className="relative rounded-xl border border-[#d8d2c5] bg-[#fffdf8] p-4">{active.wedding.gifts.length > 1 && <button onClick={() => { const nextGifts = active.wedding.gifts.filter((_, i) => i !== index); update("gifts", nextGifts); }} className="absolute right-4 top-4 text-xs font-semibold text-red-600 hover:underline">Hapus</button>}<div className="grid gap-4 sm:grid-cols-3"><TextField label="Nama Bank" value={gift.bank} onChange={(value) => update(`gifts.${index}.bank`, value)} /><TextField label="Nomor Rekening" value={gift.account} onChange={(value) => update(`gifts.${index}.account`, value)} /><TextField label="Atas Nama" value={gift.holder} onChange={(value) => update(`gifts.${index}.holder`, value)} /></div></div>)}<button onClick={() => { const nextGifts = [...active.wedding.gifts, { bank: "", account: "", holder: "" }]; update("gifts", nextGifts); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#c6a969] bg-[#fffdf8] py-3 text-sm font-semibold text-[#23382f] hover:bg-[#c6a969]/5"><Plus size={16} /> Tambah Rekening Baru</button></div></EditorCard><EditorCard title="Latar Musik Undangan"><div className="space-y-4">{active.wedding.audio && <audio ref={previewAudioRef} src={active.wedding.audio} onEnded={() => setIsPlayingPreview(false)} />}<div className="flex items-center gap-3 rounded-xl border border-[#d8d2c5] bg-[#f7f4ed] p-3"><button onClick={togglePreview} disabled={!active.wedding.audio} className="grid size-10 place-items-center rounded-lg bg-[#23382f] text-white disabled:opacity-40" aria-label={isPlayingPreview ? "Jeda pratinjau" : "Putar pratinjau"}>{isPlayingPreview ? <Pause size={18} /> : <Play size={18} />}</button><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-[#23382f]">Status Lagu</p><p className="truncate text-xs text-[#587060]">{active.wedding.audio ? (active.wedding.audio.startsWith("data:") ? "Audio kustom terunggah (Base64)" : active.wedding.audio) : "Musik dinonaktifkan"}</p></div>{active.wedding.audio && <button onClick={() => { update("audio", ""); setIsPlayingPreview(false); }} className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50" title="Hapus Musik"><Trash2 size={15} /></button>}</div><div><span className="mb-2 block text-xs font-medium text-[#587060]">Metode 1: Unggah File MP3 (Maks 2.5 MB)</span><label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#c6a969] bg-[#fffdf8] px-4 py-3 text-sm text-[#23382f] hover:bg-[#c6a969]/5"><Upload size={16} /><span>Pilih file audio kustom</span><input type="file" accept="audio/mpeg,audio/mp3" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleAudioUpload(file); }} className="sr-only" /></label></div><div><TextField label="Metode 2: Tautan Audio Direct (MP3 URL)" value={active.wedding.audio?.startsWith("data:") ? "" : active.wedding.audio ?? ""} onChange={(value) => update("audio", value)} /></div><div className="flex justify-end"><button onClick={() => { update("audio", defaultCustomer.wedding.audio ?? ""); setIsPlayingPreview(false); }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#a68a50] hover:underline"><RotateCcw size={12} /> Reset ke default</button></div></div></EditorCard></div></section></div></main>;
}
function EditorCard({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-[#e2ddd2] bg-white p-6 shadow-sm"><h2 className="mb-5 font-serif text-3xl">{title}</h2>{children}</section>; }
