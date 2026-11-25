"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TombolTema from "@/components/tata-letak/TombolTema";

const DAFTAR_TAUTAN = [
  { href: "#alur", label: "Alur Cuti" },
  { href: "#keunggulan", label: "Fitur" },
  { href: "#kebijakan", label: "Kebijakan & Libur" },
];

export default function NavbarBeranda({ sudahMasuk = false }) {
  const [bagianAktif, pasangBagianAktif] = useState("");
  const [menuSelulerTerbuka, aturMenuSelulerTerbuka] = useState(false);

  useEffect(() => {
    const daftarId = ["alur", "keunggulan", "kebijakan"];
    const elemenDaftar = daftarId
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (elemenDaftar.length === 0) return;

    const tanganiGulir = () => {
      if (window.scrollY < 200) {
        pasangBagianAktif("");
        return;
      }

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
      }
    };

    window.addEventListener("scroll", tanganiGulir, { passive: true });
    tanganiGulir();

    return () => {
      window.removeEventListener("scroll", tanganiGulir);
    };
  }, []);

  const tautanAksi = sudahMasuk ? "/dasbor" : "/masuk";
  const labelAksi = sudahMasuk ? "Dasbor" : "Masuk";

  return (
    <header className="sticky top-4 z-40 px-4">
      <div className="max-w-6xl mx-auto h-14 px-4 md:px-5 rounded-full bg-background/80 backdrop-blur-md border border-border/80 shadow-sm flex items-center justify-between gap-3 transition-all">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <CalendarCheck2 className="size-4" aria-hidden="true" />
          </span>
          <span className="font-bold tracking-tight text-base text-foreground">
            Offly
          </span>
        </Link>

        <nav
          aria-label="Navigasi bagian halaman"
          className="hidden md:flex items-center gap-1"
        >
          {DAFTAR_TAUTAN.map((item) => {
            const aktif = bagianAktif === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={aktif ? "location" : undefined}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  aktif
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <TombolTema />

          <Button
            nativeButton={false}
            render={<Link href={tautanAksi} />}
            className="rounded-full px-4 h-9 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            {labelAksi}
            <ArrowRight className="size-4 ml-1.5" aria-hidden="true" />
          </Button>

          <Sheet
            open={menuSelulerTerbuka}
            onOpenChange={aturMenuSelulerTerbuka}
          >
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Buka menu navigasi"
                  className="md:hidden rounded-full size-9"
                />
              }
            >
              <Menu className="size-4" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-base">
                  <span className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <CalendarCheck2 className="size-4" aria-hidden="true" />
                  </span>
                  Offly
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Navigasi seluler"
                className="flex flex-col gap-1 px-4 pt-2"
              >
                {DAFTAR_TAUTAN.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => aturMenuSelulerTerbuka(false)}
                    className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
