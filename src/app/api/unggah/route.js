import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { ambilSesiPengguna } from "@/lib/autentikasi";

const EKSTENSI_DIIZINKAN = new Set([".pdf", ".jpg", ".jpeg", ".png"]);
const UKURAN_MAKS_BYTE = 5 * 1024 * 1024;

export async function POST(request) {
  const sesi = await ambilSesiPengguna();
  if (!sesi) {
    return NextResponse.json(
      { sukses: false, pesan: "Sesi berakhir. Silakan masuk kembali." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const berkas = formData.get("berkas");

    if (!berkas || typeof berkas === "string") {
      return NextResponse.json(
        { sukses: false, pesan: "Berkas lampiran tidak ditemukan." },
        { status: 400 }
      );
    }

    if (berkas.size > UKURAN_MAKS_BYTE) {
      return NextResponse.json(
        { sukses: false, pesan: "Ukuran berkas maksimal 5 MB." },
        { status: 400 }
      );
    }

    const ekstensi = path.extname(berkas.name || "").toLowerCase();
    if (!EKSTENSI_DIIZINKAN.has(ekstensi)) {
      return NextResponse.json(
        {
          sukses: false,
          pesan: "Format berkas harus berupa PDF, JPG, JPEG, atau PNG.",
        },
        { status: 400 }
      );
    }

    const namaDasar = path
      .basename(berkas.name, ekstensi)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 40);
    const namaBerkasAkhir = `${Date.now()}-${sesi.id}-${namaDasar}${ekstensi}`;
    const folderTujuan = path.join(
      process.cwd(),
      "public",
      "uploads",
      "lampiran"
    );

    await mkdir(folderTujuan, { recursive: true });
    const buffer = Buffer.from(await berkas.arrayBuffer());
    await writeFile(path.join(folderTujuan, namaBerkasAkhir), buffer);

    return NextResponse.json({
      sukses: true,
      url: `/uploads/lampiran/${namaBerkasAkhir}`,
      namaBerkas: berkas.name,
    });
  } catch {
    return NextResponse.json(
      { sukses: false, pesan: "Gagal mengunggah berkas ke server." },
      { status: 500 }
    );
  }
}
