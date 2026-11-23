import { ArrowUpRight, Camera, Check, Utensils, WandSparkles } from "lucide-react";
import { BrandMark } from "./brand-mark";

const promptCards = [
  {
    icon: Utensils,
    title: "Comida que dá vontade",
    category: "GASTRONOMIA",
    color: "from-orange-400 to-rose-500",
    image: "🍔",
  },
  {
    icon: Camera,
    title: "Fotos com identidade",
    category: "FOTOGRAFIA",
    color: "from-violet-400 to-indigo-500",
    image: "📸",
  },
];

export function AuthVisual() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#1a1025] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
      <div className="pointer-events-none absolute -left-44 top-28 size-[480px] rounded-full bg-purple-700/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-48 right-[-6rem] size-[560px] rounded-full bg-fuchsia-600/20 blur-[110px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff12_0.7px,transparent_0.7px)] [background-size:18px_18px]" />

      <div className="relative z-10">
        <BrandMark light />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[570px] py-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-purple-100">
          <WandSparkles size={14} className="text-[#c59aff]" />
          Sua próxima ideia começa aqui
        </div>
        <h1 className="max-w-[550px] text-5xl font-extrabold leading-[1.08] tracking-[-0.045em] xl:text-[58px]">
          Seu negócio merece{" "}
          <span className="bg-gradient-to-r from-[#c79cff] to-[#f0c3ff] bg-clip-text text-transparent">
            aparecer.
          </span>
        </h1>
        <p className="mt-5 max-w-[470px] text-[16px] leading-7 text-white/65">
          Encontre prompts prontos para criar imagens profissionais e destacar
          sua marca nas redes sociais.
        </p>

        <div className="relative mt-11 grid max-w-[490px] grid-cols-2 gap-4">
          {promptCards.map(({ icon: Icon, ...card }, index) => (
            <div
              key={card.category}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${card.color} p-[1px] shadow-2xl ${index === 1 ? "mt-8" : ""}`}
            >
              <div className="relative flex h-[214px] flex-col justify-between overflow-hidden rounded-[23px] bg-[#24182d] p-4">
                <div className="absolute -right-5 -top-4 text-[96px] opacity-90 drop-shadow-[0_14px_20px_#0008]">
                  {card.image}
                </div>
                <div className="relative z-10 grid size-9 place-items-center rounded-xl bg-white/10 backdrop-blur-md">
                  <Icon size={18} />
                </div>
                <div className="relative z-10">
                  <p className="text-[9px] font-bold tracking-[0.18em] text-white/50">
                    {card.category}
                  </p>
                  <h2 className="mt-1 text-[17px] font-bold leading-tight">
                    {card.title}
                  </h2>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </div>
          ))}
          <div className="absolute -bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/10 bg-[#30233c]/90 px-4 py-3 text-xs shadow-xl backdrop-blur-lg">
            <span className="grid size-5 place-items-center rounded-full bg-emerald-400 text-[#173525]">
              <Check size={12} strokeWidth={3} />
            </span>
            Ideias prontas para virar conteúdo
            <ArrowUpRight size={14} className="ml-1 text-purple-200" />
          </div>
        </div>
      </div>

      <p className="relative z-10 text-xs text-white/40">
        © 2026 NichoPro. Seu próximo conteúdo começa aqui.
      </p>
    </aside>
  );
}
