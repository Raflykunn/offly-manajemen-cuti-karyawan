import { ambilDataHalamanPengajuan } from "@/actions/cuti-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import PengajuanCutiClient from "@/components/cuti/PengajuanCutiClient";

export const metadata = {
  title: "Pengajuan Cuti | Offly",
};

export default async function HalamanPengajuanCuti({ searchParams }) {
  await wajibSesiPengguna(["karyawan", "ketua_divisi"]);
  const [data, params] = await Promise.all([
    ambilDataHalamanPengajuan(),
    searchParams,
  ]);

  const ulangiMentah = String(params?.ulangi || "").trim();
  const ulangiId = /^\d+$/.test(ulangiMentah) ? Number(ulangiMentah) : 0;
  const dataUlangi =
    ulangiId > 0
      ? data.daftarPengajuanSaya.find(
          (p) =>
            p.id === ulangiId &&
            ["Rejected by Leader", "Rejected by HRD"].includes(p.status)
        ) || null
      : null;

  const peringatanUlangi =
    ulangiMentah && !dataUlangi
      ? "Data pengajuan ulang tidak valid, bukan milik Anda, atau tidak berstatus ditolak."
      : "";

  return (
    <PengajuanCutiClient
      pengguna={data.pengguna}
      daftarJenisCuti={data.daftarJenisCuti}
      daftarRekanPengganti={data.daftarRekanPengganti}
      dataUlangi={dataUlangi}
      peringatanUlangi={peringatanUlangi}
    />
  );
}
