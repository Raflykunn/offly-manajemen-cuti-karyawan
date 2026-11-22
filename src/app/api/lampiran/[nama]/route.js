import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";

const TIPE_KONTEN_EKSTENSI = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export async function GET(request, context) {
  const sesi = await ambilSesiPengguna();
  if (!sesi) {
    return NextResponse.json(
      { sukses: false, pesan: "Sesi berakhir. Silakan masuk kembali." },
      { status: 401 }
    );
  }

  const { nama } = await context.params;
  if (!nama || !/^[a-zA-Z0-9._-]+$/.test(nama)) {
    return NextResponse.json(
      { sukses: false, pesan: "Nama berkas lampiran tidak valid." },
      { status: 400 }
    );
  }

  const urlLampiran = `/api/lampiran/${nama}`;
  const hasil = await jalankanKueri(
    `SELECT pc.pengguna_id, d.ketua_divisi_id
     FROM pengajuan_cuti pc
     JOIN pengguna p ON p.id = pc.pengguna_id
     LEFT JOIN divisi d ON d.id = p.divisi_id
     WHERE pc.lampiran_url = $1
     LIMIT 1`,
    [urlLampiran]
  );

  if (hasil.rows.length === 0) {
    return NextResponse.json(
      { sukses: false, pesan: "Lampiran tidak ditemukan." },
      { status: 404 }
    );
  }

  const data = hasil.rows[0];
  const berhakAkses =
    ["hrd", "admin"].includes(sesi.peran) ||
    data.pengguna_id === sesi.id ||
    data.ketua_divisi_id === sesi.id;

  if (!berhakAkses) {
    return NextResponse.json(
      { sukses: false, pesan: "Anda tidak memiliki izin mengakses lampiran ini." },
      { status: 403 }
    );
  }

  try {
    const lokasiBerkas = path.join(process.cwd(), "storage", "lampiran", nama);
    const isiBerkas = await readFile(lokasiBerkas);
    const ekstensi = path.extname(nama).toLowerCase();
    const tipeKonten = TIPE_KONTEN_EKSTENSI[ekstensi] || "application/octet-stream";

    return new NextResponse(isiBerkas, {
      status: 200,
      headers: {
        "Content-Type": tipeKonten,
        "Content-Disposition": `inline; filename="${nama}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { sukses: false, pesan: "Berkas lampiran tidak tersedia di server." },
      { status: 404 }
    );
  }
}
