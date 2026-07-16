export default function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="mx-auto max-w-xl text-center"><p className="mb-3 text-[10px] font-semibold tracking-[.32em] text-[#a68a50] uppercase">{eyebrow}</p><h2 className="text-4xl leading-none text-[#23382f] sm:text-5xl">{title}</h2>{children && <div className="mt-5 text-sm leading-7 text-[#567060]">{children}</div>}</div>;
}
