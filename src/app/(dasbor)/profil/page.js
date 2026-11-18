import { redirect } from "next/navigation";
import { ambilProfilLengkap } from "@/actions/pengguna-aksi";
import FormulirProfil from "@/components/profil/FormulirProfil";

export const metadata = {
  title: "Profil & Kuota Cuti — Offly",
};

export default async function HalamanProfil() {
  const data = await ambilProfilLengkap();
  if (!data) {
    redirect("/masuk");
  }

  return <FormulirProfil pengguna={data.pengguna} />;
}
