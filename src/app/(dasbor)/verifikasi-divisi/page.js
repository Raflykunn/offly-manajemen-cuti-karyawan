import { ambilDaftarVerifikasiKetuaDivisi } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import VerifikasiKetuaDivisiClient from "@/components/cuti/VerifikasiKetuaDivisiClient";

export const metadata = {
  title: "Verifikasi Divisi — Offly",
};

export default async function HalamanVerifikasiDivisi() {
  await wajibSesiPengguna(["ketua_divisi"]);
  const data = await ambilDaftarVerifikasiKetuaDivisi();

  return (
    <VerifikasiKetuaDivisiClient
      divisi={data.divisi}
      daftarMenunggu={data.daftarMenunggu}
      daftarRiwayatDivisi={data.daftarRiwayatDivisi}
    />
  );
}
