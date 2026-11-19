import { notFound } from "next/navigation";
import { ambilDetailDivisi } from "@/actions/divisi-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import DetailDivisiClient from "@/components/cms/DetailDivisiClient";

export const metadata = {
  title: "Detail Divisi — Offly",
};

export default async function HalamanDetailDivisi({ params }) {
  await wajibSesiPengguna(["admin"]);
  const { id } = await params;
  const data = await ambilDetailDivisi(id);

  if (!data) {
    notFound();
  }

  return (
    <DetailDivisiClient
      divisi={data.divisi}
      anggota={data.anggota}
      kandidatAnggota={data.kandidatAnggota}
    />
  );
}
