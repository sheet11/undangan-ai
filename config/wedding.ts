import type { Wedding } from "@/types/wedding";

export const wedding: Wedding = {
  bride: { fullName: "Nadya Putri", nickName: "Nadya", father: "Bapak Ahmad", mother: "Ibu Siti" },
  groom: { fullName: "Aldo Pratama", nickName: "Aldo", father: "Bapak Hasan", mother: "Ibu Rina" },
  event: { date: "2026-12-12T08:00:00+07:00", day: "Sabtu, 12 Desember 2026", akad: "08.00 WIB", reception: "11.00 WIB", venue: "The Garden House", address: "Jl. Mawar Indah No. 12, Bengkulu", maps: "https://maps.google.com" },
  story: [
    { year: "2018", title: "Awal berjumpa", description: "Satu percakapan sederhana, lalu dunia terasa sedikit lebih hangat." },
    { year: "2023", title: "Memilih pulang", description: "Kami belajar bahwa rumah bukanlah tempat, melainkan seseorang." },
    { year: "2026", title: "Satu janji", description: "Dengan penuh syukur, kami melangkah menuju cerita yang baru." },
  ],
  gifts: [{ bank: "BCA", account: "123 456 7890", holder: "Nadya Putri" }],
  images: { hero: "/images/hero-garden.png" },
  audio: "/audio/default.mp3",
};
