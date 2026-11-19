import { ambilDaftarDivisi } from "@/actions/divisi-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import KelolaDivisiClient from "@/components/cms/KelolaDivisiClient";

export const metadata = {
  title: "Manajemen Divisi — Offly",
};

export default async function HalamanManajemenDivisi() {
  await wajibSesiPengguna(["admin"]);
  const { daftarDivisi, kandidatKetuaTersedia, semuaKetua } =
    await ambilDaftarDivisi();

  return (
    <KelolaDivisiClient
      daftarDivisiAwal={daftarDivisi}
      kandidatKetuaTersedia={kandidatKetuaTersedia}
      semuaKetua={semuaKetua}
    />
  );
}
