"use client";
import Image from "next/image";
import { CalendarDays, ChevronDown, Clock3, Copy, Heart, MapPin, Music } from "lucide-react";
import { wedding } from "@/config/wedding";
import Container from "@/components/common/Container";
import SectionTitle from "@/components/common/SectionTitle";
import Opening from "@/sections/Opening";
import { useCountdown } from "@/hooks/useCountdown";
import { getActiveWedding } from "@/lib/wedding-store";
import { useSyncExternalStore, useRef, useState } from "react";

const floral = "absolute text-7xl text-[#c6a969]/25 select-none";
export default function Invitation() {
  const activeWedding = useSyncExternalStore(() => () => {}, getActiveWedding, () => wedding);
  const time = useCountdown(activeWedding.event.date);
  const copyAccount = (accountNumber: string) => navigator.clipboard?.writeText(accountNumber.replaceAll(" ", ""));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

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
    <section className="relative min-h-[100svh] bg-[#23382f] text-[#fffaf0]"><Image src={activeWedding.images.hero} unoptimized={activeWedding.images.hero.startsWith("data:")} alt="Nadya dan Aldo berjalan di taman" fill priority sizes="100vw" className="object-cover object-center opacity-55" /><div className="absolute inset-0 bg-gradient-to-b from-[#183127]/25 via-[#193128]/20 to-[#183127]" /><div className="grain absolute inset-0 opacity-20" /><Container><div className="relative flex min-h-[100svh] flex-col items-center justify-between py-12 text-center"><p className="text-[10px] tracking-[.45em] uppercase text-[#ead6a1]">Wedding Invitation</p><div><p className="mb-5 text-xs tracking-[.3em] uppercase text-white/80">Save the date</p><h1 className="script text-7xl leading-normal sm:text-8xl">{activeWedding.bride.nickName}</h1><p className="my-4 text-xl text-[#ead6a1]">&amp;</p><h1 className="script text-7xl leading-normal sm:text-8xl">{activeWedding.groom.nickName}</h1></div><div><p className="text-base font-light tracking-wide">{activeWedding.event.day}</p><a href="#mempelai" className="mt-6 inline-flex animate-bounce text-[#ead6a1]" aria-label="Lihat undangan"><ChevronDown /></a></div></div></Container></section>
    <section id="mempelai" className="relative bg-[#f7f4ed] py-24 sm:py-32"><span className={`${floral} left-4 top-8 drift`}>❋</span><span className={`${floral} right-7 bottom-5 drift`}>❋</span><Container><SectionTitle eyebrow="Bismillahirrahmanirrahim" title="Dengan segala kerendahan hati"><p>Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam pernikahan kami.</p></SectionTitle><div className="mx-auto mt-16 grid max-w-3xl gap-10 text-center md:grid-cols-[1fr_auto_1fr] md:items-center"><Person name={activeWedding.bride.fullName} father={activeWedding.bride.father} mother={activeWedding.bride.mother} /><p className="script text-6xl text-[#c6a969]">&amp;</p><Person name={activeWedding.groom.fullName} father={activeWedding.groom.father} mother={activeWedding.groom.mother} /></div></Container></section>
    <section className="bg-[#2b483a] py-20 text-[#fffaf0]"><Container><SectionTitle eyebrow="Menuju hari bahagia" title="Momen yang kami nantikan" /><div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 divide-x divide-white/20 rounded-2xl border border-white/15 bg-white/10 py-6 backdrop-blur"><Time value={time.days} label="Hari" /><Time value={time.hours} label="Jam" /><Time value={time.minutes} label="Menit" /><Time value={time.seconds} label="Detik" /></div></Container></section>
    <section className="bg-[#f7f4ed] py-24 sm:py-32"><Container><SectionTitle eyebrow="Love Story" title="Sebuah perjalanan kecil" /><div className="mx-auto mt-14 max-w-2xl border-l border-[#c6a969]/60 pl-7">{activeWedding.story.map((item) => <article key={item.year} className="relative pb-10 last:pb-0"><span className="absolute -left-[34px] top-1 size-3 rounded-full border-2 border-[#f7f4ed] bg-[#c6a969]" /><p className="text-xs font-semibold tracking-[.25em] text-[#a68a50]">{item.year}</p><h3 className="mt-2 text-3xl">{item.title}</h3><p className="mt-2 text-sm leading-7 text-[#587060]">{item.description}</p></article>)}</div></Container></section>
    <section className="relative bg-[#e8e3d8] py-24"><Container><SectionTitle eyebrow="Save the date" title="Rangkaian acara" /><div className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2"><EventCard icon={<Heart />} title="Akad Nikah" time={activeWedding.event.akad} /><EventCard icon={<Heart />} title="Resepsi" time={activeWedding.event.reception} /></div><div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-[#23382f] p-7 text-center text-white"><CalendarDays className="mx-auto mb-3 text-[#ead6a1]" /><p className="text-sm">{activeWedding.event.day}</p><h3 className="mt-3 text-3xl">{activeWedding.event.venue}</h3><p className="mt-2 text-xs text-white/70">{activeWedding.event.address}</p><a href={activeWedding.event.maps} target="_blank" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#ead6a1] px-5 py-3 text-xs font-semibold text-[#23382f]"><MapPin size={14} /> Lihat Lokasi</a></div></Container></section>
    <section className="bg-[#f7f4ed] py-24"><Container><SectionTitle eyebrow="Wedding gift" title="Doa Anda adalah hadiah terindah"><p>Apabila ingin mengirimkan tanda kasih, berikut informasi yang dapat digunakan.</p></SectionTitle><div className={`mx-auto mt-12 grid max-w-4xl gap-6 ${activeWedding.gifts.length > 1 ? "md:grid-cols-2" : "max-w-md"}`}>{activeWedding.gifts.map((gift, index) => <div key={index} className="rounded-2xl border border-[#c6a969]/40 bg-white p-7 text-center shadow-[0_20px_60px_-30px_rgba(35,56,47,.3)]"><p className="text-xs font-semibold tracking-[.28em] text-[#a68a50]">{gift.bank}</p><p className="mt-4 text-2xl tracking-[.16em] text-[#23382f]">{gift.account}</p><p className="mt-2 text-xs text-[#587060]">a.n. {gift.holder}</p><button onClick={() => copyAccount(gift.account)} className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#23382f]/25 px-5 py-2.5 text-xs font-medium"><Copy size={13} /> Salin nomor rekening</button></div>)}</div></Container></section>
    <section className="bg-[#2b483a] py-24 text-white"><Container><div className="flex flex-col items-center text-center"><p className="script text-5xl text-[#ead6a1]">Thank you</p><h2 className="mt-4 text-4xl">Sampai jumpa di hari bahagia kami</h2><p className="mx-auto mt-5 max-w-md text-center text-sm leading-7 text-white/70">Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.</p><p className="mt-10 text-xs tracking-[.25em] uppercase text-[#ead6a1]">{activeWedding.bride.nickName} &amp; {activeWedding.groom.nickName}</p></div></Container></section>

  </main></>);
}
function Person({ name, father, mother }: { name: string; father: string; mother: string }) { return <div><p className="text-xs tracking-[.25em] uppercase text-[#a68a50]">Putra / Putri dari</p><h3 className="mt-3 text-5xl">{name}</h3><p className="mt-4 text-sm leading-7 text-[#587060]">{father}<br />&amp; {mother}</p></div>; }
function Time({ value, label }: { value: number; label: string }) { return <div className="px-2 text-center"><p className="font-serif text-3xl">{String(value).padStart(2, "0")}</p><p className="mt-1 text-[9px] tracking-[.16em] uppercase text-white/60">{label}</p></div>; }
function EventCard({ icon, title, time }: { icon: React.ReactNode; title: string; time: string }) { return <article className="rounded-2xl border border-[#c6a969]/30 bg-[#f7f4ed] p-7 text-center shadow-sm"><div className="mx-auto grid size-10 place-items-center rounded-full bg-[#e9dfca] text-[#866c37]">{icon}</div><h3 className="mt-4 text-3xl text-[#23382f]">{title}</h3><p className="mt-3 inline-flex items-center gap-2 text-sm text-[#587060]"><Clock3 size={15} /> {time}</p></article>; }
