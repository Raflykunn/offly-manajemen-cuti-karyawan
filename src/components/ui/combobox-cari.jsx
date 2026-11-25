"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ComboboxCari({
  id,
  name,
  opsi = [],
  nilai = "",
  saatUbahNilai,
  placeholder = "Cari...",
  teksKosong = "Tidak ada hasil yang cocok.",
  ariaLabel,
  wajib = false,
  nonaktif = false,
  batasTampil = 10,
}) {
  const [kataCari, aturKataCari] = useState("");
  const [terbuka, aturTerbuka] = useState(false);
  const pembungkusRef = useRef(null);

  const petaLabel = useMemo(() => {
    const peta = new Map();
    for (const item of opsi) {
      peta.set(String(item.nilai), item.label);
    }
    return peta;
  }, [opsi]);

  const nilaiTeks = nilai ? petaLabel.get(String(nilai)) || "" : "";
  const teksTampil = terbuka || !nilai ? kataCari : nilaiTeks;

  useEffect(() => {
    function tanganiKlikLuar(e) {
      if (pembungkusRef.current && !pembungkusRef.current.contains(e.target)) {
        aturTerbuka(false);
        aturKataCari(nilai ? petaLabel.get(String(nilai)) || "" : "");
      }
    }
    document.addEventListener("pointerdown", tanganiKlikLuar);
    return () => document.removeEventListener("pointerdown", tanganiKlikLuar);
  }, [nilai, petaLabel]);

  const { hasilTerbatas, totalCocok } = useMemo(() => {
    const kueri = kataCari.trim().toLowerCase();
    const cocok = kueri
      ? opsi.filter(
          (item) =>
            item.label.toLowerCase().includes(kueri) ||
            (item.kataKunci && item.kataKunci.toLowerCase().includes(kueri))
        )
      : opsi;
    return {
      hasilTerbatas: cocok.slice(0, batasTampil),
      totalCocok: cocok.length,
    };
  }, [opsi, kataCari, batasTampil]);

  function pilihOpsi(item) {
    const nilaiStr = String(item.nilai);
    saatUbahNilai(nilaiStr);
    aturKataCari(item.label);
    aturTerbuka(false);
  }

  return (
    <div ref={pembungkusRef} className="relative flex-1 min-w-0">
      {name && <input type="hidden" name={name} value={nilai} />}
      <Search
        className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={terbuka}
        aria-controls={`${id || name || "combobox"}-listbox`}
        aria-label={ariaLabel}
        placeholder={placeholder}
        disabled={nonaktif}
        required={wajib && !nilai}
        value={teksTampil}
        onFocus={() => {
          if (!terbuka) aturKataCari("");
          aturTerbuka(true);
        }}
        onChange={(e) => {
          aturKataCari(e.target.value);
          if (nilai) saatUbahNilai("");
          aturTerbuka(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            aturTerbuka(false);
            aturKataCari(nilaiTeks);
          }
        }}
        className="pl-9 pr-9 h-10 md:h-9"
      />
      {(teksTampil || nilai) && !nonaktif && (
        <button
          type="button"
          onClick={() => {
            aturKataCari("");
            saatUbahNilai("");
            aturTerbuka(true);
          }}
          aria-label="Hapus pilihan"
          className="absolute right-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}

      {terbuka && !nonaktif && (
        <div
          id={`${id || name || "combobox"}-listbox`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-md"
        >
          {hasilTerbatas.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              {teksKosong}
            </p>
          ) : (
            <>
              {hasilTerbatas.map((item) => {
                const terpilih = String(item.nilai) === String(nilai);
                return (
                  <button
                    key={item.nilai}
                    type="button"
                    role="option"
                    aria-selected={terpilih}
                    onClick={() => pilihOpsi(item)}
                    className={`w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      terpilih
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                    {terpilih && (
                      <Check
                        className="size-4 text-primary shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
              {totalCocok > batasTampil && (
                <p className="px-3 py-1.5 text-sm text-muted-foreground border-t border-border mt-1">
                  Menampilkan {batasTampil} dari {totalCocok} hasil. Ketik lebih spesifik.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
