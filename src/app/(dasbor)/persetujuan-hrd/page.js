import { ambilDaftarPersetujuanHrd } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import PersetujuanHrdClient from "@/components/cuti/PersetujuanHrdClient";

export const metadata = {
  title: "Persetujuan Final HRD — Offly",
};

export default async function HalamanPersetujuanHrd() {
  await wajibSesiPengguna(["hrd"]);
  const daftarMenunggu = await ambilDaftarPersetujuanHrd();

  return <PersetujuanHrdClient daftarMenunggu={daftarMenunggu} />;
}
