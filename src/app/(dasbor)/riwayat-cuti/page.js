import { ambilRiwayatCutiLengkap } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import RiwayatCutiClient from "@/components/cuti/RiwayatCutiClient";

export const metadata = {
  title: "Riwayat Cuti | Offly",
};

export default async function HalamanRiwayatCuti({ searchParams }) {
  await wajibSesiPengguna();
  const [data, params] = await Promise.all([
    ambilRiwayatCutiLengkap(),
    searchParams,
  ]);
  const detailIdAwal = Number(params?.detail) || null;

  return (
    <RiwayatCutiClient
      sesiPeran={data.sesiPeran}
      sesiPenggunaId={data.sesiPenggunaId}
      daftarRiwayat={data.daftarRiwayat}
      daftarJenisCuti={data.daftarJenisCuti}
      daftarDivisi={data.daftarDivisi}
      detailIdAwal={detailIdAwal}
    />
  );
}
