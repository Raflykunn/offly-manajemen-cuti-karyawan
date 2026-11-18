import {
  ambilDataDasborAdmin,
  ambilDataDasborHrd,
  ambilDataDasborKaryawan,
  ambilDataDasborKetuaDivisi,
} from "@/actions/dasbor-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import DasborAdmin from "@/components/dasbor/DasborAdmin";
import DasborHrd from "@/components/dasbor/DasborHrd";
import DasborKaryawan from "@/components/dasbor/DasborKaryawan";
import DasborKetuaDivisi from "@/components/dasbor/DasborKetuaDivisi";

export const metadata = {
  title: "Dasbor — Offly",
};

export default async function HalamanDasbor() {
  const sesi = await wajibSesiPengguna();

  if (sesi.peran === "admin") {
    const data = await ambilDataDasborAdmin();
    return <DasborAdmin data={data} />;
  }

  if (sesi.peran === "ketua_divisi") {
    const data = await ambilDataDasborKetuaDivisi(sesi.id);
    return <DasborKetuaDivisi data={data} />;
  }

  if (sesi.peran === "hrd") {
    const data = await ambilDataDasborHrd();
    return <DasborHrd data={data} />;
  }

  const data = await ambilDataDasborKaryawan(sesi.id);
  return <DasborKaryawan data={data} />;
}
