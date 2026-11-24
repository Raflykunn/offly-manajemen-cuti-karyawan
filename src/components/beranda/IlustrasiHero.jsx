import { Check, FileCheck2, Users } from "lucide-react";

const DAFTAR_TANGGAL_KALENDER = [
  { angka: "09", sorot: false },
  { angka: "10", sorot: false },
  { angka: "11", sorot: false },
  { angka: "12", sorot: true },
  { angka: "13", sorot: true },
  { angka: "14", sorot: false },
  { angka: "15", sorot: false },
  { angka: "16", sorot: false },
  { angka: "17", sorot: false },
  { angka: "18", sorot: true },
  { angka: "19", sorot: false },
  { angka: "20", sorot: false },
  { angka: "21", sorot: false },
  { angka: "22", sorot: false },
];

const DAFTAR_ANGGOTA_TIM = [
  { inisial: "RF", warna: "bg-primary text-primary-foreground" },
  { inisial: "BD", warna: "bg-chart-2 text-primary-foreground" },
  { inisial: "SR", warna: "bg-chart-4 text-primary-foreground" },
];

export default function IlustrasiHero() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[460px] py-8 sm:py-10 px-3 sm:px-5 font-sans select-none group"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/70 via-background to-muted/40 dark:from-accent/25 dark:via-background dark:to-muted/30" />
        <div className="absolute -top-10 -right-10 size-48 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div className="absolute -bottom-8 -left-8 size-44 rounded-full bg-chart-1/20 blur-3xl dark:bg-chart-1/15" />
        <div
          className="absolute inset-0 opacity-45 dark:opacity-25 border border-border/40 rounded-3xl"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at center, black 45%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 45%, transparent 85%)",
          }}
        />
      </div>

      <div className="relative flex items-center justify-center transition-transform duration-500 motion-safe:group-hover:scale-[1.02]">
        <div className="relative w-[268px] sm:w-[296px] pt-3">
          <div
            className="absolute inset-x-3 top-6 bottom-0 translate-x-2.5 translate-y-2.5 rounded-2xl bg-primary/15 dark:bg-primary/20 border border-primary/20"
          />

          <div className="relative rounded-2xl border border-border bg-card text-card-foreground shadow-xl dark:shadow-none overflow-hidden">
            <div className="absolute top-1.5 inset-x-6 flex justify-between pointer-events-none z-10">
              {[0, 1, 2, 3, 4].map((indeks) => (
                <span
                  key={indeks}
                  className="h-4 w-2 rounded-full bg-card border-2 border-primary-foreground/80 shadow-xs -translate-y-2.5"
                />
              ))}
            </div>

            <div className="bg-primary text-primary-foreground px-5 pt-5 pb-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider opacity-85">
                  Kalender Cuti Tim
                </p>
                <p className="text-sm font-bold font-mono tabular-nums mt-0.5">
                  Nov 2026
                </p>
              </div>
              <span className="rounded-md bg-primary-foreground/15 px-2 py-1 text-[11px] font-mono font-semibold tabular-nums">
                12 Hari
              </span>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
                <span>S</span>
                <span>S</span>
                <span>R</span>
                <span>K</span>
                <span>J</span>
                <span>S</span>
                <span>M</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {DAFTAR_TANGGAL_KALENDER.map((tgl) => (
                  <div
                    key={tgl.angka}
                    className={`relative h-8 rounded-lg flex items-center justify-center text-xs font-mono tabular-nums ${
                      tgl.sorot
                        ? "bg-primary/15 text-primary font-bold ring-1 ring-primary/30"
                        : "bg-muted/40 text-card-foreground/80"
                    }`}
                  >
                    {tgl.angka}
                    {tgl.sorot && (
                      <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dashed border-border text-[11px]">
                <span className="text-muted-foreground">Jadwal Disetujui</span>
                <span className="font-mono font-semibold text-primary tabular-nums">
                  12-13, 18 Nov
                </span>
              </div>
            </div>
          </div>

          <svg
            viewBox="0 0 110 130"
            className="pointer-events-none absolute -right-7 bottom-2 w-24 sm:w-28 drop-shadow-md"
          >
            <ellipse cx="58" cy="122" rx="30" ry="5" fill="var(--border)" opacity="0.55" />
            <path
              d="M45 64 C32 68 25 84 28 106 L74 106 C76 84 68 68 56 64 Z"
              fill="var(--primary)"
            />
            <path
              d="M36 74 L12 61 C8 59 5 63 8 67 L32 82 Z"
              fill="var(--chart-2)"
            />
            <circle cx="9" cy="63" r="4.5" fill="var(--accent)" stroke="var(--border)" strokeWidth="1" />
            <path
              d="M40 104 L38 120 M62 104 L64 120"
              stroke="var(--card-foreground)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="51" cy="43" r="14" fill="var(--accent)" stroke="var(--border)" strokeWidth="1.2" />
            <path
              d="M37 40 C37 28 65 28 65 40 C60 35 42 35 37 40 Z"
              fill="var(--card-foreground)"
            />
            <circle cx="46" cy="44" r="1.5" fill="var(--card-foreground)" />
            <circle cx="55" cy="44" r="1.5" fill="var(--card-foreground)" />
            <path
              d="M47 49 Q51 52 55 49"
              fill="none"
              stroke="var(--card-foreground)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          className="animasi-mengambang absolute -top-2 left-0 sm:left-1 z-20 -rotate-3 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-2.5 shadow-lg dark:shadow-none w-36 sm:w-40"
          style={{ animationDuration: "4.5s", animationDelay: "0s" }}
        >
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <FileCheck2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-card-foreground truncate">
                Surat Cuti PDF
              </p>
              <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
                #0012-HRD
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-1.5">
            <div className="space-y-1 flex-1">
              <div className="h-1.5 w-full rounded-full bg-muted" />
              <div className="h-1.5 w-3/4 rounded-full bg-muted" />
            </div>
            <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              Sah
            </span>
          </div>
        </div>

        <div
          className="animasi-mengambang-lambat absolute -top-1 right-1 sm:right-2 z-20 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 shadow-lg dark:shadow-none"
          style={{ animationDuration: "5.5s", animationDelay: "0.7s" }}
        >
          <span className="size-5 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Check className="size-3.5" strokeWidth={2.5} />
          </span>
          <div className="leading-tight pr-0.5">
            <p className="text-[9px] uppercase tracking-wider opacity-85">HRD</p>
            <p className="text-[11px] font-bold">Disetujui</p>
          </div>
        </div>

        <div
          className="animasi-mengambang-lambat absolute -bottom-2 left-0 sm:left-2 z-20 flex items-center gap-2.5 rounded-xl border border-border bg-card/90 backdrop-blur-md px-3 py-2 shadow-md dark:shadow-none"
          style={{ animationDuration: "6.5s", animationDelay: "1.1s" }}
        >
          <div className="flex -space-x-2">
            {DAFTAR_ANGGOTA_TIM.map((anggota) => (
              <span
                key={anggota.inisial}
                className={`relative size-7 rounded-full ring-2 ring-background flex items-center justify-center text-[10px] font-bold ${anggota.warna}`}
              >
                {anggota.inisial}
              </span>
            ))}
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-card-foreground flex items-center gap-1">
              <Users className="size-3 text-primary" />
              Tim Aktif
            </p>
            <p className="text-[10px] font-mono text-muted-foreground tabular-nums">
              3/4 Siaga
            </p>
          </div>
        </div>

        <div
          className="animasi-mengambang absolute -bottom-3 right-0 sm:right-1 z-20 w-40 sm:w-44 rounded-xl border border-border bg-card/85 backdrop-blur-md p-3 shadow-md dark:shadow-none"
          style={{ animationDuration: "5.5s", animationDelay: "1.6s" }}
        >
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-semibold text-card-foreground">
              Status Kuota
            </span>
            <span className="font-mono font-bold text-primary tabular-nums">
              10.5 Hr
            </span>
          </div>
          <svg viewBox="0 0 120 32" className="mt-1.5 h-7 w-full overflow-visible">
            <defs>
              <linearGradient id="gradKuotaHero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M2 24 C20 22, 32 10, 52 14 C72 18, 86 6, 118 8 L118 30 L2 30 Z"
              fill="url(#gradKuotaHero)"
            />
            <path
              d="M2 24 C20 22, 32 10, 52 14 C72 18, 86 6, 118 8"
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="118" cy="8" r="3" fill="var(--chart-1)" />
          </svg>
          <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-1.5">
            <span className="text-[9px] text-muted-foreground">Tanda Tangan</span>
            <svg viewBox="0 0 60 16" className="h-3.5 w-12">
              <path
                d="M3 12 Q10 3, 18 10 T34 8 T56 7"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
