import { ambilDaftarVerifikasiKetuaDivisi } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import VerifikasiKetuaDivisiClient from "@/components/cuti/VerifikasiKetuaDivisiClient";

export const metadata = {
  title: "Verifikasi Divisi | Offly",
};

export default async function HalamanVerifikasiDivisi({ searchParams }) {
  await wajibSesiPengguna(["ketua_divisi"]);
  const [data, params] = await Promise.all([
    ambilDaftarVerifikasiKetuaDivisi(),
    searchParams,
  ]);
  const detailIdAwal = Number(params?.detail) || null;

  return (
    <VerifikasiKetuaDivisiClient
      divisi={data.divisi}
      daftarMenunggu={data.daftarMenunggu}
      daftarRiwayatDivisi={data.daftarRiwayatDivisi}
      detailIdAwal={detailIdAwal}
    />
  );
}
