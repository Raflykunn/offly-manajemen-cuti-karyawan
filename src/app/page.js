import { redirect } from "next/navigation";
import { ambilSesiPengguna } from "@/lib/autentikasi";

export default async function HalamanUtama() {
  const sesi = await ambilSesiPengguna();
  if (sesi) {
    redirect("/dasbor");
  }
  redirect("/masuk");
}
