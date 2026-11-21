"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DialogKonfirmasi({
  terbuka,
  saatUbahTerbuka,
  judul,
  deskripsi,
  labelKonfirmasi = "Ya, Lanjutkan",
  labelBatal = "Batal",
  varian = "destructive",
  sedangMemproses = false,
  saatKonfirmasi,
}) {
  return (
    <Dialog open={terbuka} onOpenChange={saatUbahTerbuka}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{judul}</DialogTitle>
          <DialogDescription>{deskripsi}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => saatUbahTerbuka(false)}
            disabled={sedangMemproses}
          >
            {labelBatal}
          </Button>
          <Button
            type="button"
            variant={varian}
            onClick={saatKonfirmasi}
            disabled={sedangMemproses}
          >
            {sedangMemproses ? "Memproses..." : labelKonfirmasi}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
