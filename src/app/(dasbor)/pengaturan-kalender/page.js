import { ambilDataKalenderDanKapasitas } from "@/actions/konfigurasi-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import KelolaKalenderClient from "@/components/cms/KelolaKalenderClient";

export const metadata = {
  title: "Kalender & Kapasitas Tim — Offly",
};

export default async function HalamanPengaturanKalender() {
  await wajibSesiPengguna(["admin", "hrd"]);
  const { hariLibur, periodeBlackout, daftarDivisi } =
    await ambilDataKalenderDanKapasitas();

  return (
    <KelolaKalenderClient
      hariLibur={hariLibur}
      periodeBlackout={periodeBlackout}
      daftarDivisi={daftarDivisi}
    />
  );
}
