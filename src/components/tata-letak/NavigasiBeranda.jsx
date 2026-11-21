"use client";

import { useEffect, useState } from "react";

const DAFTAR_TAUTAN = [
  { href: "#alur", label: "Alur Cuti" },
  { href: "#keunggulan", label: "Keunggulan" },
  { href: "#kebijakan", label: "Kebijakan" },
  { href: "#kalender", label: "Hari Libur" },
];

export default function NavigasiBeranda() {
  const [bagianAktif, pasangBagianAktif] = useState("");

  useEffect(() => {
    const daftarId = ["alur", "keunggulan", "kebijakan", "kalender"];
    const elemenDaftar = daftarId
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elemenDaftar.length === 0) return;

    const tanganiGulir = () => {
      const posisiGaris = window.innerHeight * 0.35;
      let terpilih = "";

      for (const el of elemenDaftar) {
        const batas = el.getBoundingClientRect();
        if (batas.top <= posisiGaris && batas.bottom >= posisiGaris) {
          terpilih = `#${el.id}`;
          break;
        }
      }

      if (terpilih) {
        pasangBagianAktif(terpilih);
      } else if (window.scrollY < 200) {
        pasangBagianAktif("");
      }
    };

    window.addEventListener("scroll", tanganiGulir, { passive: true });
    tanganiGulir();

    return () => {
      window.removeEventListener("scroll", tanganiGulir);
    };
  }, []);

  return (
    <nav
      aria-label="Navigasi bagian halaman"
      className="hidden md:flex items-center gap-1 rounded-full border bg-muted/50 p-1 text-xs font-medium"
    >
      {DAFTAR_TAUTAN.map((item) => {
        const aktif = bagianAktif === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={aktif ? "true" : undefined}
            className={`px-3 py-1.5 rounded-full transition-colors ${
              aktif
                ? "bg-background text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
