import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { useTheme } from "../theme-provider";

function OptionCard({
  label,
  description,
  imgSrc,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  imgSrc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`group relative block h-[200px] w-full overflow-hidden rounded-md border border-border transition
          ${selected ? "ring-2 ring-green-500" : "hover:ring-1 hover:ring-ring/40"}`}
      >
        <Image
          src={imgSrc}
          alt={`${label.toLowerCase()}-preview`}
          fill
          sizes="(max-width: 768px)"
          className="object-cover"
        />

        {selected && (
          <span className="absolute right-2 top-2 rounded-full bg-emerald-500 p-1 shadow-sm">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </span>
        )}
      </button>

      <div className="p-2">
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Appearance() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative flex flex-col justify-between gap-3 xl:flex-row">
      <OptionCard
        label="Light"
        description="Bright and minimal. Best for well-lit environments."
        imgSrc="/light-mode-website-picture.png"
        selected={theme === "light"}
        onClick={() => setTheme("light")}
      />

      <OptionCard
        label="Dark"
        description="Sleek and modern. Easier on the eyes in low light."
        imgSrc="/dark-mode-website-picture.png"
        selected={theme === "dark"}
        onClick={() => setTheme("dark")}
      />
    </div>
  );
}
