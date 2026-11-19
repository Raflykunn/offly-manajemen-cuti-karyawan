import { ambilDaftarPengguna } from "@/actions/pengguna-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import KelolaPenggunaClient from "@/components/cms/KelolaPenggunaClient";

export const metadata = {
  title: "Manajemen Pengguna — Offly",
};

export default async function HalamanManajemenPengguna() {
  const sesi = await wajibSesiPengguna(["admin"]);
  const { daftarPengguna, daftarDivisi } = await ambilDaftarPengguna();

  return (
    <KelolaPenggunaClient
      daftarPenggunaAwal={daftarPengguna}
      daftarDivisi={daftarDivisi}
      adminId={sesi.id}
    />
  );
}
