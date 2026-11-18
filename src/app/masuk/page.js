import { redirect } from "next/navigation";
import FormulirMasuk from "@/components/masuk/FormulirMasuk";
import { ambilSesiPengguna } from "@/lib/autentikasi";

export const metadata = {
  title: "Masuk — Offly",
};

export default async function HalamanMasuk() {
  const sesi = await ambilSesiPengguna();
  if (sesi) {
    redirect("/dasbor");
  }

  return <FormulirMasuk />;
}
