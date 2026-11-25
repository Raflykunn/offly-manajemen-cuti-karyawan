"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const labelTema = modeGelap ? "Aktifkan mode terang" : "Aktifkan mode gelap";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={gantiTema}
              className="size-11 sm:size-9"
              aria-label={labelTema}
            >
              {modeGelap ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </Button>
          }
        />
        <TooltipContent>{labelTema}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
