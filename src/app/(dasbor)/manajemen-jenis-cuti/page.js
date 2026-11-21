import { ambilSemuaJenisCuti } from "@/actions/konfigurasi-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import KelolaJenisCutiClient from "@/components/cms/KelolaJenisCutiClient";

export const metadata = {
  title: "Jenis Cuti Dinamis | Offly",
};

export default async function HalamanManajemenJenisCuti() {
  await wajibSesiPengguna(["admin"]);
  const daftarJenisCuti = await ambilSemuaJenisCuti();

  return <KelolaJenisCutiClient daftarJenisCuti={daftarJenisCuti} />;
}
