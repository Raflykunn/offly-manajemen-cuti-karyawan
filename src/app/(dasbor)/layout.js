import { redirect } from "next/navigation";
import { ambilProfilLengkap } from "@/actions/pengguna-aksi";
import { wajibSesiPengguna } from "@/lib/autentikasi";
import KerangkaDasbor from "@/components/tata-letak/KerangkaDasbor";

export default async function TataLetakDasbor({ children }) {
  await wajibSesiPengguna();

  let dataProfil = null;
  let pesanGalatDb = "";

  try {
    dataProfil = await ambilProfilLengkap();
  } catch {
    pesanGalatDb =
      "Koneksi ke PostgreSQL belum tersambung. Pastikan database sudah dibuat, skrip database/offly_database.sql sudah dijalankan, dan DATABASE_URL pada .env sudah benar.";
  }

  if (pesanGalatDb) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <div className="max-w-lg w-full rounded-xl border bg-card p-6 space-y-3 shadow-sm">
          <h1 className="text-lg font-semibold text-destructive">
            Gagal Terhubung ke Database Offly
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pesanGalatDb}
          </p>
        </div>
      </div>
    );
  }

  if (!dataProfil) {
    redirect("/masuk");
  }

  return (
    <KerangkaDasbor
      pengguna={dataProfil.pengguna}
      notifikasi={dataProfil.notifikasi}
      jumlahBelumDibaca={dataProfil.jumlahBelumDibaca}
    >
      {children}
    </KerangkaDasbor>
  );
}
