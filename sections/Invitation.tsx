"use client";
import Image from "next/image";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Copy, Heart, MapPin, Music, X } from "lucide-react";
import { wedding as defaultWedding } from "@/config/wedding";
import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import Opening from "@/sections/Opening";
import { useCountdown } from "@/hooks/useCountdown";
import type { Wedding } from "@/types/wedding";
import { getActiveWedding, isSupabaseConfigured } from "@/lib/wedding-store";
import { useSyncExternalStore, useEffect, useRef, useState, type ReactNode } from "react";

const floral = "absolute text-7xl text-[#c6a969]/25 select-none";
export default function Invitation({ initialWedding }: { initialWedding?: Wedding }) {
  const localWedding = useSyncExternalStore(
    () => () => {},
    getActiveWedding,
    () => defaultWedding
  );
  const activeWedding = isSupabaseConfigured ? (initialWedding ?? defaultWedding) : localWedding;


  const time = useCountdown(activeWedding.event.date);
  const copyAccount = (accountNumber: string) => navigator.clipboard?.writeText(accountNumber.replaceAll(" ", ""));
  const preweddingImages = activeWedding.gallery?.prewedding?.filter(Boolean) ?? [];
  const isSecondTheme = activeWedding.uiTheme === "second";
  const isBotanicalTheme = activeWedding.uiTheme === "botanical";
  const theme = isBotanicalTheme
    ? {
        hero: "bg-[#2e3b26] text-[#f2ecdc]",
        heroOverlay: "from-[#1f2a1a]/75 via-[#2e3b26]/35 to-[#2e3b26]/85",
        section: "bg-[#f2ecdc]",
        muted: "text-[#5b6650]",
        card: "bg-[#faf6ec]",
        accent: "text-[#a85c32]",
        pill: "text-[#c7b37e]",
      }
    : isSecondTheme
    ? {
        hero: "bg-[#f8f3ea] text-[#23382f]",
        heroOverlay: "from-[#e7d4b2]/55 via-[#f6efe7]/25 to-[#c6a969]/35",
        section: "bg-[#f7f1e5]",
        muted: "text-[#6e563d]",
        card: "bg-[#fffaf4]",
        accent: "text-[#8f6844]",
        pill: "text-[#8f6844]",
      }
    : {
        hero: "bg-[#23382f] text-[#fffaf0]",
        heroOverlay: "from-[#183127]/25 via-[#193128]/20 to-[#183127]",
        section: "bg-[#f7f4ed]",
        muted: "text-white/80",
        card: "bg-[#f7f4ed]",
        accent: "text-[#ead6a1]",
        pill: "text-[#ead6a1]",
      };
  // Token turunan khusus tema Botanical — dipakai untuk elemen yang strukturnya
  // memang beda (bukan cuma ganti warna) dari tema Classic/Kedua.
  const floralGlyph = isBotanicalTheme ? "🌿" : "❋";
  const heroEyebrowText = isBotanicalTheme ? "Undangan Pernikahan" : isSecondTheme ? "The Wedding Of" : "Wedding Invitation";
  const heroAlignClass = isBotanicalTheme ? "items-start text-left" : "items-center text-center";
  const heroClipClass = isBotanicalTheme
    ? "[clip-path:polygon(0_0,100%_0,100%_91%,93%_96%,86%_90%,79%_97%,72%_90%,65%_96%,58%_89%,51%_97%,44%_90%,37%_96%,30%_89%,23%_97%,16%_90%,9%_96%,2%_90%,0_94%)]"
    : "";
  const venueCardBg = isBotanicalTheme ? "bg-[#3b4a30]" : isSecondTheme ? "bg-[#5b4635]" : "bg-[#23382f]";
  const countdownSectionClass = isBotanicalTheme
    ? "bg-[#3b4a30] py-20 text-[#f2ecdc]"
    : isSecondTheme
    ? "bg-[#8f6844] text-[#fffaf0]"
    : "bg-[#2b483a] py-20 text-[#fffaf0]";
  const countdownBoxClass = isBotanicalTheme
    ? "rounded-none border-2 border-dashed border-[#c7b37e]/50 bg-[#2e3b26]/40"
    : "rounded-2xl border border-white/15 bg-white/10 backdrop-blur";
  const eventSectionBg = isBotanicalTheme ? "bg-[#eae2cc]" : isSecondTheme ? "bg-[#efe5d5]" : "bg-[#e8e3d8]";
  const giftGridCardClass = isBotanicalTheme
    ? "rounded-sm border-2 border-dashed border-[#a85c32]/40 bg-[#faf6ec] p-7 text-center shadow-[0_10px_30px_-15px_rgba(46,59,38,.4)] odd:-rotate-1 even:rotate-1"
    : "rounded-2xl border border-[#c6a969]/40 bg-white p-7 text-center shadow-[0_20px_60px_-30px_rgba(35,56,47,.3)]";
  const closingBg = isBotanicalTheme ? "bg-[#2e3b26]" : isSecondTheme ? "bg-[#5b4635]" : "bg-[#2b483a]";
  // Section tengah (di luar Hero & penutup, yang posisinya tetap) bisa diatur
  // urutannya dari admin lewat activeWedding.sectionOrder. Key yang belum
  // dikenal diabaikan, dan key default yang belum ada di data lama tetap
  // ditambahkan di akhir supaya tidak ada section yang hilang.
  const defaultSectionOrder = ["mempelai", "gallery", "countdown", "story", "event", "gifts"];
  const storedSectionOrder = activeWedding.sectionOrder?.filter((key) => defaultSectionOrder.includes(key)) ?? [];
  const sectionOrder = [...storedSectionOrder, ...defaultSectionOrder.filter((key) => !storedSectionOrder.includes(key))];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrevImage = () => setLightboxIndex((current) => current === null ? null : (current - 1 + preweddingImages.length) % preweddingImages.length);
  const showNextImage = () => setLightboxIndex((current) => current === null ? null : (current + 1) % preweddingImages.length);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrevImage();
      if (event.key === "ArrowRight") showNextImage();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, preweddingImages.length]);

  const handleOpen = () => {
    setIsOpened(true);
    if (audioRef.current && activeWedding.audio) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Autoplay prevented:", e);
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Playback failed:", e);
      });
    }
  };

  const sectionNodes: Record<string, ReactNode> = {
    mempelai: <section id="mempelai" key="mempelai" className={`relative ${theme.section} py-24 sm:py-32`}><span className={`${floral} left-4 top-8 drift`}>{floralGlyph}</span><span className={`${floral} right-7 bottom-5 drift`}>{floralGlyph}</span><Container><SectionTitle eyebrow="Bismillahirrahmanirrahim" title="Dengan segala kerendahan hati"><p>Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pernikahan kami.</p></SectionTitle><div className="mx-auto mt-16 grid max-w-3xl gap-10 text-center md:grid-cols-[1fr_auto_1fr] md:items-center"><Person name={activeWedding.bride.fullName} father={activeWedding.bride.father} mother={activeWedding.bride.mother} /><p className="script text-6xl text-[#c6a969]">&amp;</p><Person name={activeWedding.groom.fullName} father={activeWedding.groom.father} mother={activeWedding.groom.mother} /></div>{isBotanicalTheme && <VineDivider tone="#a68a50" />}</Container></section>,
    gallery: preweddingImages.length > 0 ? <section key="gallery" className={`${theme.card} py-24`}><Container><SectionTitle eyebrow="Prewedding" title="Momen sebelum hari bahagia" /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{preweddingImages.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => openLightbox(index)} className={`relative overflow-hidden rounded-2xl border text-left transition hover:opacity-90 ${isSecondTheme ? "border-[#d8c4a2] bg-[#f6eee1]" : "border-[#e5dccb] bg-[#f7f4ed]"}`} aria-label={`Buka foto prewedding ${index + 1}`}><Image src={image} alt={`Prewedding ${index + 1}`} width={600} height={800} className="h-80 w-full object-cover" /></button>)}</div></Container></section> : null,
    countdown: <section key="countdown" className={countdownSectionClass}><Container><SectionTitle eyebrow="Menuju hari bahagia" title="Momen yang kami nantikan" /><div className={`mx-auto mt-12 grid max-w-2xl grid-cols-4 divide-x divide-white/20 py-6 ${countdownBoxClass}`}><Time value={time.days} label="Hari" /><Time value={time.hours} label="Jam" /><Time value={time.minutes} label="Menit" /><Time value={time.seconds} label="Detik" /></div></Container></section>,
    story: <section key="story" className={`${theme.section} py-24 sm:py-32`}><Container><SectionTitle eyebrow="Love Story" title="Sebuah perjalanan kecil" /><div className="mx-auto mt-14 max-w-2xl border-l border-[#c6a969]/60 pl-7">{activeWedding.story.map((item) => <article key={item.year} className="relative pb-10 last:pb-0"><span className="absolute -left-[34px] top-1 size-3 rounded-full border-2 border-[#f7f4ed] bg-[#c6a969]" /><p className="text-xs font-semibold tracking-[.25em] text-[#a68a50]">{item.year}</p><h3 className="mt-2 text-3xl">{item.title}</h3><p className="mt-2 text-sm leading-7 text-[#587060]">{item.description}</p></article>)}</div>{isBotanicalTheme && <VineDivider tone="#a85c32" />}</Container></section>,
    event: <section key="event" className={`relative ${eventSectionBg} py-24`}><Container><SectionTitle eyebrow="Save the date" title="Rangkaian acara" /><div className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2"><EventCard icon={<Heart />} title="Akad Nikah" time={activeWedding.event.akad} botanical={isBotanicalTheme} /><EventCard icon={<Heart />} title="Resepsi" time={activeWedding.event.reception} botanical={isBotanicalTheme} /></div><div className={`mx-auto mt-8 max-w-3xl ${isBotanicalTheme ? "rounded-sm" : "rounded-2xl"} ${venueCardBg} p-7 text-center text-white`}><CalendarDays className="mx-auto mb-3 text-[#ead6a1]" /><p className="text-sm">{activeWedding.event.day}</p><h3 className="mt-3 text-3xl">{activeWedding.event.venue}</h3><p className="mt-2 text-xs text-white/70">{activeWedding.event.address}</p><a href={activeWedding.event.maps} target="_blank" className={`mt-6 inline-flex items-center gap-2 ${isBotanicalTheme ? "rounded-sm bg-[#c7b37e] text-[#2e3b26]" : "rounded-full bg-[#ead6a1] text-[#23382f]"} px-5 py-3 text-xs font-semibold`}><MapPin size={14} /> Lihat Lokasi</a></div></Container></section>,
    gifts: <section key="gifts" className={`${theme.section} py-24`}><Container><SectionTitle eyebrow="Wedding gift" title="Doa Anda adalah hadiah terindah"><p>Apabila ingin mengirimkan tanda kasih, berikut informasi yang dapat digunakan.</p></SectionTitle><div className={`mx-auto mt-12 grid max-w-4xl gap-6 ${activeWedding.gifts.length > 1 ? "md:grid-cols-2" : "max-w-md"}`}>{activeWedding.gifts.map((gift, index) => <div key={index} className={giftGridCardClass}><p className="text-xs font-semibold tracking-[.28em] text-[#a68a50]">{gift.bank}</p><p className={`mt-4 text-2xl tracking-[.16em] ${isBotanicalTheme ? "text-[#2e3b26]" : "text-[#23382f]"}`}>{gift.account}</p><p className={`mt-2 text-xs ${isBotanicalTheme ? "text-[#5b6650]" : "text-[#587060]"}`}>a.n. {gift.holder}</p><button onClick={() => copyAccount(gift.account)} className={`mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium ${isBotanicalTheme ? "rounded-sm border border-[#2e3b26]/25" : "rounded-full border border-[#23382f]/25"}`}><Copy size={13} /> Salin nomor rekening</button></div>)}</div></Container></section>,
  };

  return (
    <>
      <Opening wedding={activeWedding} onOpen={handleOpen} />
      {activeWedding.audio && (
        <audio
          ref={audioRef}
          src={activeWedding.audio}
          loop
          preload="auto"
        />
      )}
      {isOpened && activeWedding.audio && (
        <button
          onClick={togglePlay}
          className={`fixed bottom-6 right-6 z-40 flex size-12 cursor-pointer items-center justify-center rounded-full bg-[#ead6a1] text-[#23382f] shadow-lg border border-[#c6a969]/30 transition-all duration-300 hover:scale-105 active:scale-95 ${
            isPlaying ? "animate-spin-slow" : ""
          }`}
          aria-label={isPlaying ? "Jeda musik" : "Putar musik"}
        >
          <Music size={20} className={isPlaying ? "animate-pulse" : ""} />
        </button>
      )}
      <main className="overflow-hidden">
    <section className={`relative min-h-[100svh] ${theme.hero} ${heroClipClass}`}>{isBotanicalTheme && <svg viewBox="0 0 120 120" className="pointer-events-none absolute right-4 top-4 z-10 h-20 w-20 text-[#c7b37e]/70 sm:right-8 sm:top-8" fill="none" aria-hidden="true"><path d="M100 20C70 20 50 45 50 80c25 5 55-10 60-45-3 0-7-1-10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M60 60c8-4 18-3 24 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>}<Image src={activeWedding.images.hero} unoptimized={activeWedding.images.hero.startsWith("data:")} alt="Nadya dan Aldo berjalan di taman" fill priority sizes="100vw" className="object-cover object-center opacity-55" /><div className={`absolute inset-0 bg-gradient-to-b ${theme.heroOverlay}`} /><div className="grain absolute inset-0 opacity-20" /><Container><div className={`relative flex min-h-[100svh] flex-col justify-between py-12 ${heroAlignClass}`}><p className={`text-[10px] tracking-[.45em] uppercase ${theme.pill}`}>{heroEyebrowText}</p><div><p className={`mb-5 text-xs tracking-[.3em] uppercase ${theme.muted}`}>Save the date</p><h1 className="script text-7xl leading-normal sm:text-8xl">{activeWedding.bride.nickName}</h1><p className={`my-4 text-xl ${theme.accent}`}>&amp;</p><h1 className="script text-7xl leading-normal sm:text-8xl">{activeWedding.groom.nickName}</h1></div><div><p className="text-base font-light tracking-wide">{activeWedding.event.day}</p><a href="#mempelai" className={`mt-6 inline-flex animate-bounce ${theme.accent}`} aria-label="Lihat undangan"><ChevronDown /></a></div></div></Container></section>
    {sectionOrder.map((key) => sectionNodes[key] ?? null)}
    <section className={`${closingBg} py-24 text-white`}><Container><div className="flex flex-col items-center text-center"><p className="script text-5xl text-[#ead6a1]">Thank you</p><h2 className="mt-4 text-4xl">Sampai jumpa di hari bahagia kami</h2><p className="mx-auto mt-5 max-w-md text-center text-sm leading-7 text-white/70">Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p><p className="mt-10 text-xs tracking-[.25em] uppercase text-[#ead6a1]">{activeWedding.bride.nickName} &amp; {activeWedding.groom.nickName}</p></div></Container></section>

  {lightboxIndex !== null && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4" onClick={closeLightbox}>
      <button type="button" onClick={closeLightbox} className="absolute right-4 top-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Tutup galeri"><X size={20} /></button>
      {preweddingImages.length > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); showPrevImage(); }} className="absolute left-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4" aria-label="Foto sebelumnya"><ChevronLeft size={22} /></button>
      )}
      <div className="relative h-[80vh] w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Image src={preweddingImages[lightboxIndex]} alt={`Prewedding ${lightboxIndex + 1}`} fill sizes="100vw" className="object-contain" />
      </div>
      {preweddingImages.length > 1 && (
        <button type="button" onClick={(e) => { e.stopPropagation(); showNextImage(); }} className="absolute right-2 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4" aria-label="Foto berikutnya"><ChevronRight size={22} /></button>
      )}
      {preweddingImages.length > 1 && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[.2em] text-white/70">{lightboxIndex + 1} / {preweddingImages.length}</p>
      )}
    </div>
  )}

  </main></>);
}
function VineDivider({ tone = "#7c8964" }: { tone?: string }) {
  return (
    <div className="flex justify-center py-1" aria-hidden="true">
      <svg viewBox="0 0 240 36" className="h-8 w-44" fill="none">
        <path d="M4 18c30-16 60 16 90 0s60-16 90 0 36 16 52 0" stroke={tone} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M42 13c-4-6-2-11 4-13" stroke={tone} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M96 7c2-6 8-9 14-7" stroke={tone} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M150 22c3 6 10 8 16 5" stroke={tone} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M198 11c-1-6-7-10-14-8" stroke={tone} strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
function Person({ name, father, mother }: { name: string; father: string; mother: string }) { return <div><p className="text-xs tracking-[.25em] uppercase text-[#a68a50]">Putra / Putri dari</p><h3 className="mt-3 text-5xl">{name}</h3><p className="mt-4 text-sm leading-7 text-[#587060]">{father}<br />&amp; {mother}</p></div>; }
function Time({ value, label }: { value: number; label: string }) { return <div className="px-2 text-center"><p className="font-serif text-3xl">{String(value).padStart(2, "0")}</p><p className="mt-1 text-[9px] tracking-[.16em] uppercase text-white/60">{label}</p></div>; }
function EventCard({ icon, title, time, botanical = false }: { icon: React.ReactNode; title: string; time: string; botanical?: boolean }) {
  if (botanical) {
    return <article className="rounded-sm border-2 border-dashed border-[#7c8964]/50 bg-[#faf6ec] p-7 text-center shadow-sm odd:-rotate-1 even:rotate-1"><div className="mx-auto grid size-10 place-items-center rounded-full bg-[#e4dab8] text-[#5b6650]">{icon}</div><h3 className="mt-4 text-3xl text-[#2e3b26]">{title}</h3><p className="mt-3 inline-flex items-center gap-2 text-sm text-[#5b6650]"><Clock3 size={15} /> {time}</p></article>;
  }
  return <article className="rounded-2xl border border-[#c6a969]/30 bg-[#f7f4ed] p-7 text-center shadow-sm"><div className="mx-auto grid size-10 place-items-center rounded-full bg-[#e9dfca] text-[#866c37]">{icon}</div><h3 className="mt-4 text-3xl text-[#23382f]">{title}</h3><p className="mt-3 inline-flex items-center gap-2 text-sm text-[#587060]"><Clock3 size={15} /> {time}</p></article>;
}
