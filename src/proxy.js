import { NextResponse } from "next/server";
import { NAMA_COOKIE_SESI, verifikasiTokenSesi } from "@/lib/token";

const ATURAN_PERAN_RUTE = [
  { awalan: "/manajemen-pengguna", peran: ["admin"] },
  { awalan: "/manajemen-divisi", peran: ["admin"] },
  { awalan: "/manajemen-jenis-cuti", peran: ["admin"] },
  { awalan: "/pengaturan-kalender", peran: ["admin", "hrd"] },
  { awalan: "/pengajuan-cuti", peran: ["karyawan", "ketua_divisi"] },
  { awalan: "/verifikasi-divisi", peran: ["ketua_divisi"] },
  { awalan: "/persetujuan-hrd", peran: ["hrd"] },
];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(NAMA_COOKIE_SESI)?.value;
  const sesi = await verifikasiTokenSesi(token);

  if (pathname === "/masuk") {
    if (sesi) {
      return NextResponse.redirect(new URL("/dasbor", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/") {
    const tujuan = sesi ? "/dasbor" : "/masuk";
    return NextResponse.redirect(new URL(tujuan, request.url));
  }

  if (!sesi) {
    const urlMasuk = new URL("/masuk", request.url);
    urlMasuk.searchParams.set("tujuan", pathname);
    return NextResponse.redirect(urlMasuk);
  }

  for (const aturan of ATURAN_PERAN_RUTE) {
    if (
      pathname.startsWith(aturan.awalan) &&
      !aturan.peran.includes(sesi.peran)
    ) {
      return NextResponse.redirect(new URL("/dasbor", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)",
  ],
};
