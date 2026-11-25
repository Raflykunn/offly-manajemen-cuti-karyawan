import { ambilDaftarPersetujuanHrd } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import PersetujuanHrdClient from "@/components/cuti/PersetujuanHrdClient";

export const metadata = {
  title: "Persetujuan Final HRD | Offly",
};

export default async function HalamanPersetujuanHrd({ searchParams }) {
  await wajibSesiPengguna(["hrd"]);
  const [daftarMenunggu, params] = await Promise.all([
    ambilDaftarPersetujuanHrd(),
    searchParams,
  ]);
  const detailIdAwal = Number(params?.detail) || null;

  return (
    <PersetujuanHrdClient
      daftarMenunggu={daftarMenunggu}
      detailIdAwal={detailIdAwal}
    />
  );
}
