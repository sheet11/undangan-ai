"use client";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { getGuest } from "@/lib/guest";
import type { Wedding } from "@/types/wedding";

export default function Opening({ wedding, onOpen }: { wedding: Wedding; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const guest = useSyncExternalStore(() => () => {}, getGuest, () => "Tamu Undangan");
  const openInvitation = () => {
    setOpen(true);
    onOpen();
    window.requestAnimationFrame(() => {
      document.getElementById("mempelai")?.scrollIntoView({ behavior: "smooth" });
    });
  };
  if (open) return null;
  return <section className="fixed inset-0 z-50 overflow-hidden bg-[#15231d] text-white"><Image src={wedding.images.hero} unoptimized={wedding.images.hero.startsWith("data:")} alt="Nadya dan Aldo" fill priority sizes="100vw" className="object-cover opacity-65" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#13241d]/60 via-[#13241d]/10 to-[#13241d]/80" /><div className="pointer-events-none grain absolute inset-0 opacity-20" /><div className="relative z-10 mx-auto flex h-full min-h-screen max-w-sm flex-col items-center justify-between px-7 py-16 text-center"><p className="text-[10px] tracking-[.42em] uppercase text-[#ead6a1]">The Wedding Of</p><div className="flex flex-col items-center"><p className="script text-6xl leading-normal">{wedding.bride.nickName}</p><span className="my-2 text-xl text-[#ead6a1]">&amp;</span><p className="script text-6xl leading-normal">{wedding.groom.nickName}</p></div><div className="flex flex-col items-center gap-6"><div className="flex flex-col items-center"><div className="mb-5 h-px w-12 bg-[#ead6a1]/70" /><p className="text-xs font-light tracking-wide text-white/80">Kepada Yth.</p><p className="mt-1 text-lg font-medium">{guest}</p></div><button type="button" onClick={openInvitation} className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#ead6a1]/70 bg-white/10 px-6 py-3 text-xs font-medium tracking-[.16em] uppercase backdrop-blur-md transition hover:bg-white hover:text-[#23382f]"><Heart size={14} fill="currentColor" /> Buka Undangan</button></div></div></section>;

}
