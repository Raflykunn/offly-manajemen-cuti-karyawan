import { ambilRiwayatCutiLengkap } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import RiwayatCutiClient from "@/components/cuti/RiwayatCutiClient";

export const metadata = {
  title: "Riwayat Cuti — Offly",
};

export default async function HalamanRiwayatCuti() {
  await wajibSesiPengguna();
  const data = await ambilRiwayatCutiLengkap();

  return (
    <RiwayatCutiClient
      sesiPeran={data.sesiPeran}
      sesiPenggunaId={data.sesiPenggunaId}
      daftarRiwayat={data.daftarRiwayat}
      daftarJenisCuti={data.daftarJenisCuti}
      daftarDivisi={data.daftarDivisi}
    />
  );
}
