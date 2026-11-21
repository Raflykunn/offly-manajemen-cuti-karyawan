"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function langgananTema(panggilUlang) {
  window.addEventListener("storage", panggilUlang);
  window.addEventListener("offly-tema-berubah", panggilUlang);
  return () => {
    window.removeEventListener("storage", panggilUlang);
    window.removeEventListener("offly-tema-berubah", panggilUlang);
  };
}

function ambilSnapshotTema() {
  return document.documentElement.classList.contains("dark");
}

function ambilSnapshotServer() {
  return false;
}

export default function TombolTema() {
  const modeGelap = useSyncExternalStore(
    langgananTema,
    ambilSnapshotTema,
    ambilSnapshotServer
  );

  function gantiTema() {
    const berikutnya = !modeGelap;
    document.documentElement.classList.toggle("dark", berikutnya);
    const metaSkema = document.querySelector('meta[name="color-scheme"]');
    if (metaSkema) {
      metaSkema.setAttribute("content", berikutnya ? "dark" : "light");
    }
    try {
      localStorage.setItem("offly-tema", berikutnya ? "dark" : "light");
    } catch {}
    window.dispatchEvent(new Event("offly-tema-berubah"));
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={gantiTema}
      aria-label={modeGelap ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={modeGelap ? "Mode Terang" : "Mode Gelap"}
    >
      {modeGelap ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
