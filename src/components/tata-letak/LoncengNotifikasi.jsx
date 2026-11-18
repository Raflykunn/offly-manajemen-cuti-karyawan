"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import {
  tandaiSatuNotifikasiDibaca,
  tandaiSemuaNotifikasiDibaca,
} from "@/actions/pengguna-aksi";
import { formatTanggalIndo } from "@/lib/kalkulasi-cuti";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LoncengNotifikasi({
  notifikasi = [],
  jumlahBelumDibaca = 0,
}) {
  const router = useRouter();
  const [sedangProses, mulaiTransisi] = useTransition();

  function tanganiKlikSemuaDibaca() {
    mulaiTransisi(async () => {
      await tandaiSemuaNotifikasiDibaca();
      router.refresh();
    });
  }

  function tanganiKlikItem(item) {
    mulaiTransisi(async () => {
      if (!item.sudah_dibaca) {
        await tandaiSatuNotifikasiDibaca(item.id);
      }
      if (item.tautan) {
        router.push(item.tautan);
      }
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="relative"
            aria-label="Notifikasi"
          />
        }
      >
        <Bell className="size-4" />
        {jumlahBelumDibaca > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {jumlahBelumDibaca > 9 ? "9+" : jumlahBelumDibaca}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
            Notifikasi
          </DropdownMenuLabel>
          {jumlahBelumDibaca > 0 && (
            <button
              type="button"
              onClick={tanganiKlikSemuaDibaca}
              disabled={sedangProses}
              className="text-[11px] text-primary hover:underline flex items-center gap-1"
            >
              <CheckCheck className="size-3" />
              Tandai Dibaca
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-72 overflow-y-auto">
          {notifikasi.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Belum ada notifikasi baru.
            </div>
          ) : (
            notifikasi.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => tanganiKlikItem(item)}
                className={`flex flex-col items-start gap-1 py-2.5 px-2.5 cursor-pointer ${
                  !item.sudah_dibaca ? "bg-accent/60" : ""
                }`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-xs font-semibold line-clamp-1">
                    {item.judul}
                  </span>
                  {!item.sudah_dibaca && (
                    <span className="size-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.pesan}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {formatTanggalIndo(item.dibuat_pada, true)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
