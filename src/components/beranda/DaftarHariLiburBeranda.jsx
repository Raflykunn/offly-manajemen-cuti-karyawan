"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DaftarHariLiburBeranda({ daftarHariLibur }) {
  const [tampilkanSemua, aturTampilkanSemua] = useState(false);

  if (daftarHariLibur.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada jadwal hari libur terdaftar.
      </div>
    );
  }

  const daftarTampil = tampilkanSemua
    ? daftarHariLibur
    : daftarHariLibur.slice(0, 4);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-card divide-y divide-border overflow-hidden shadow-sm dark:shadow-none">
        {daftarTampil.map((libur) => (
          <div
            key={libur.id}
            className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-lg bg-accent dark:bg-accent/50 border border-primary/20 flex flex-col items-center justify-center shrink-0 leading-none tabular-nums">
                <span className="text-sm font-bold font-mono text-foreground">
                  {libur.hari}
                </span>
                <span className="text-[10px] font-mono text-accent-foreground dark:text-amber-300 mt-0.5">
                  {libur.bulan}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug truncate">
                  {libur.nama_libur}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <CalendarDays className="size-3 shrink-0" aria-hidden="true" />
                  {libur.tanggalIndo}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] shrink-0">
              {libur.jenis}
            </Badge>
          </div>
        ))}
      </div>

      {daftarHariLibur.length > 4 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => aturTampilkanSemua((prev) => !prev)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {tampilkanSemua ? (
            <>
              Tampilkan 4 jadwal terdekat
              <ChevronUp className="size-3.5 ml-1" aria-hidden="true" />
            </>
          ) : (
            <>
              Lihat semua jadwal libur ({daftarHariLibur.length})
              <ChevronDown className="size-3.5 ml-1" aria-hidden="true" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
