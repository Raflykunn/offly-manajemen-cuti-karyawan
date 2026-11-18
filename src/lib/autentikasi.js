import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  NAMA_COOKIE_SESI,
  buatTokenSesi,
  verifikasiTokenSesi,
} from "@/lib/token";

export async function buatHashKataSandi(kataSandi) {
  return bcrypt.hash(kataSandi, 10);
}

export async function verifikasiKataSandi(kataSandi, hashKataSandi) {
  return bcrypt.compare(kataSandi, hashKataSandi);
}

export async function ambilSesiPengguna() {
  const penyimpananCookie = await cookies();
  const token = penyimpananCookie.get(NAMA_COOKIE_SESI)?.value;
  if (!token) return null;
  return verifikasiTokenSesi(token);
}

export async function wajibSesiPengguna(daftarPeranDiizinkan = null) {
  const sesi = await ambilSesiPengguna();
  if (!sesi) {
    redirect("/masuk");
  }
  if (
    Array.isArray(daftarPeranDiizinkan) &&
    !daftarPeranDiizinkan.includes(sesi.peran)
  ) {
    redirect("/dasbor");
  }
  return sesi;
}

export { buatTokenSesi, verifikasiTokenSesi, NAMA_COOKIE_SESI };
