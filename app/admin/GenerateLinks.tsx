"use client";
import { useMemo, useState } from "react";
import { Copy, CopyCheck, Download, Link2, Trash2 } from "lucide-react";

type GuestLink = {
  name: string;
  url: string;
};

export default function GenerateLinks() {
  const [clientId, setClientId] = useState("");
  const [namesText, setNamesText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const names = useMemo(
    () =>
      namesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [namesText]
  );

  const links: GuestLink[] = useMemo(() => {
    if (!clientId.trim()) return [];
    return names.map((name) => ({
      name,
      url: `${origin}/?client=${encodeURIComponent(clientId.trim())}&to=${encodeURIComponent(name)}`,
    }));
  }, [names, clientId, origin]);

  const copyOne = async (index: number, url: string) => {
    await navigator.clipboard?.writeText(url);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1500);
  };

  const copyAll = async () => {
    const text = links.map((link) => `${link.name}\t${link.url}`).join("\n");
    await navigator.clipboard?.writeText(text);
    setCopiedAll(true);
    window.setTimeout(() => setCopiedAll(false), 1500);
  };

  const downloadCsv = () => {
    const rows = [["Nama Tamu", "Link Undangan"], ...links.map((link) => [link.name, link.url])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "link-undangan.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-5 py-10 text-[#23382f] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold tracking-[.25em] uppercase text-[#a68a50]">Generator tautan</p>
        <h1 className="mt-2 font-serif text-3xl">Buat link undangan per tamu</h1>
        <p className="mt-2 text-sm leading-6 text-[#587060]">
          Isi ID customer, lalu tempel daftar nama tamu (satu nama per baris). Setiap tamu akan mendapat tautan unik dengan namanya sendiri.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#587060]">ID Customer (client)</span>
            <input
              type="text"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="contoh: customer-1784187174827"
              className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-[#587060]">Jumlah tamu</span>
            <div className="flex h-[46px] items-center rounded-xl border border-dashed border-[#d8d2c5] bg-[#fffdf8] px-4 text-sm text-[#587060]">
              {names.length} nama terdeteksi
            </div>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs font-medium text-[#587060]">Daftar nama tamu (satu per baris)</span>
          <textarea
            value={namesText}
            onChange={(event) => setNamesText(event.target.value)}
            placeholder={"Bapak Budi Santoso\nIbu Siti Aminah\nKeluarga Besar Hartono"}
            rows={8}
            className="w-full rounded-xl border border-[#d8d2c5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a68a50] focus:ring-4 focus:ring-[#c6a969]/15"
          />
        </label>

        {!clientId.trim() && names.length > 0 && (
          <p className="mt-3 text-xs text-red-600">Isi dulu ID Customer supaya tautan bisa dibuat.</p>
        )}

        {links.length > 0 && (
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{links.length} tautan siap dikirim</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d8d2c5] bg-white px-4 py-2 text-xs font-medium hover:bg-[#f1ece1]"
                >
                  {copiedAll ? <CopyCheck size={14} /> : <Copy size={14} />} {copiedAll ? "Tersalin" : "Salin semua"}
                </button>
                <button
                  type="button"
                  onClick={downloadCsv}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#23382f] px-4 py-2 text-xs font-medium text-white hover:bg-[#1b2d25]"
                >
                  <Download size={14} /> Unduh CSV
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {links.map((link, index) => (
                <div
                  key={`${link.name}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-[#d8d2c5] bg-white p-3"
                >
                  <Link2 size={14} className="shrink-0 text-[#a68a50]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{link.name}</p>
                    <p className="truncate text-xs text-[#587060]">{link.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyOne(index, link.url)}
                    aria-label={`Salin tautan untuk ${link.name}`}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-[#d8d2c5] hover:bg-[#f1ece1]"
                  >
                    {copiedIndex === index ? <CopyCheck size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {links.length === 0 && names.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#d8d2c5] bg-[#fffdf8] py-10 text-center text-[#a0998a]">
            <Trash2 size={18} />
            <p className="text-xs">Belum ada nama tamu. Tempel daftar nama di atas untuk mulai.</p>
          </div>
        )}
      </div>
    </main>
  );
}
