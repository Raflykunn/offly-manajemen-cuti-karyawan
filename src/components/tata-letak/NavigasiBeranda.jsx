"use client";

import { useEffect, useRef } from "react";

const DAFTAR_TAUTAN = [
  { href: "#alur", label: "Alur Cuti" },
  { href: "#keunggulan", label: "Keunggulan" },
  { href: "#kebijakan", label: "Kebijakan" },
  { href: "#kalender", label: "Hari Libur" },
];

export default function NavigasiBeranda() {
  const refNav = useRef(null);

  useEffect(() => {
    const elemenNav = refNav.current;
    if (!elemenNav) return;

    const tautan = Array.from(elemenNav.querySelectorAll("a[href^='#']"));
    if (tautan.length === 0) return;

    const dukungScrollTarget =
      typeof CSS !== "undefined" &&
      CSS.supports("scroll-target-group: auto");

    if (dukungScrollTarget) {
      const sinkronkanAria = () => {
        const aktif = elemenNav.querySelector("a:target-current");
        tautan.forEach((item) => {
          item.setAttribute("aria-current", item === aktif ? "true" : "false");
        });
      };

      sinkronkanAria();
      document.addEventListener("scrollend", sinkronkanAria, { passive: true });
      return () => {
        document.removeEventListener("scrollend", sinkronkanAria);
      };
    }

    const daftarBagian = tautan
      .map((item) => {
        const id = item.getAttribute("href")?.slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    if (daftarBagian.length === 0) return;

    const pengamat = new IntersectionObserver(
      (entri) => {
        entri.forEach((item) => {
          if (item.isIntersecting) {
            const idAktif = item.target.getAttribute("id");
            tautan.forEach((link) => {
              const aktif = link.getAttribute("href") === `#${idAktif}`;
              link.classList.toggle("target-current", aktif);
              link.setAttribute("aria-current", aktif ? "true" : "false");
            });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    daftarBagian.forEach((bagian) => pengamat.observe(bagian));
    return () => {
      pengamat.disconnect();
    };
  }, []);

  return (
    <nav
      ref={refNav}
      aria-label="Navigasi bagian halaman"
      className="navigasi-beranda hidden md:flex items-center gap-1 rounded-full border bg-muted/50 p-1 text-xs font-medium"
    >
      {DAFTAR_TAUTAN.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background/70 transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
