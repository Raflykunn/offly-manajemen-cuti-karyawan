import { SignJWT, jwtVerify } from "jose";

export const NAMA_COOKIE_SESI = "offly_sesi";

function dapatkanKunciRahasia() {
  const rahasia =
    process.env.AUTH_SECRET ||
    "kunci-rahasia-pengembangan-offly-manajemen-cuti-2026";
  return new TextEncoder().encode(rahasia);
}

export async function buatTokenSesi(dataPengguna, ingatSaya = false) {
  const durasi = ingatSaya ? "30d" : "1d";
  return new SignJWT({
    id: dataPengguna.id,
    username: dataPengguna.username,
    email: dataPengguna.email,
    nama_lengkap: dataPengguna.nama_lengkap,
    peran: dataPengguna.peran,
    divisi_id: dataPengguna.divisi_id ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(durasi)
    .sign(dapatkanKunciRahasia());
}

export async function verifikasiTokenSesi(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, dapatkanKunciRahasia());
    return payload;
  } catch {
    return null;
  }
}
