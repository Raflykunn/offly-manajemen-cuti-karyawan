import { ambilDetailDivisi } from "@/actions/divisi-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import DetailDivisiClient from "@/components/cms/DetailDivisiClient";
import TampilanTidakDitemukan from "@/components/tata-letak/TampilanTidakDitemukan";

export const metadata = {
  title: "Detail Divisi | Offly",
};

export default async function HalamanDetailDivisi({ params }) {
  await wajibSesiPengguna(["admin"]);
  const { id } = await params;
  const data = await ambilDetailDivisi(id);

  if (!data) {
    return (
      <TampilanTidakDitemukan
        dalamDasbor
        judul="Divisi Tidak Ditemukan"
        pesan={`Divisi dengan ID "${id}" tidak ditemukan di sistem atau sudah dihapus.`}
        tautanUtama="/manajemen-divisi"
        labelUtama="Kembali ke Daftar Divisi"
        tautanSekunder="/dasbor"
        labelSekunder="Ke Dasbor"
      />
    );
  }

  return (
    <DetailDivisiClient
      divisi={data.divisi}
      anggota={data.anggota}
      kandidatAnggota={data.kandidatAnggota}
    />
  );
}
