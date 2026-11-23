import { Layers3 } from "lucide-react";

type BrandMarkProps = {
  light?: boolean;
};

export function BrandMark({ light = false }: BrandMarkProps) {
  return (
    <a
      href="/"
      aria-label="NichoPro, início"
      className={`inline-flex w-fit items-center gap-3 ${light ? "text-white" : "text-[#21182d]"}`}
    >
      <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-[#a66aff] to-[#6722c7] text-white shadow-lg shadow-purple-950/20">
        <Layers3 size={24} strokeWidth={2.2} />
      </span>
      <span>
        <span className="block text-[21px] font-extrabold leading-5 tracking-tight">
          NichoPro
        </span>
        <span className={`mt-1 block text-[10px] ${light ? "text-white/65" : "text-[#887e95]"}`}>
          Prompts · Serviços · Soluções
        </span>
      </span>
    </a>
  );
}
