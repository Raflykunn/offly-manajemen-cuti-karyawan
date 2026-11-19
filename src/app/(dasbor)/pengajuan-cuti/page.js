import { ambilDataHalamanPengajuan } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import PengajuanCutiClient from "@/components/cuti/PengajuanCutiClient";

export const metadata = {
  title: "Pengajuan Cuti — Offly",
};

export default async function HalamanPengajuanCuti() {
  await wajibSesiPengguna(["karyawan", "ketua_divisi"]);
  const data = await ambilDataHalamanPengajuan();

  return (
    <PengajuanCutiClient
      pengguna={data.pengguna}
      daftarJenisCuti={data.daftarJenisCuti}
      daftarRekanPengganti={data.daftarRekanPengganti}
      daftarPengajuanSaya={data.daftarPengajuanSaya}
    />
  );
}
