import { NextResponse } from "next/server";
import { NAMA_COOKIE_SESI, verifikasiTokenSesi } from "@/lib/token";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || pathname === "/masuk") {
    return NextResponse.next();
  }

  const token = request.cookies.get(NAMA_COOKIE_SESI)?.value;
  const sesi = await verifikasiTokenSesi(token);

  if (!sesi) {
    const urlMasuk = new URL("/masuk", request.url);
    urlMasuk.searchParams.set("tujuan", pathname);
    return NextResponse.redirect(urlMasuk);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)",
  ],
};
