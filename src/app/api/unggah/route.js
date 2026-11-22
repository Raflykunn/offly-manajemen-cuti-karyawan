import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { ambilSesiPengguna } from "@/lib/autentikasi";

const EKSTENSI_DIIZINKAN = new Set([".pdf", ".jpg", ".jpeg", ".png"]);
const UKURAN_MAKS_BYTE = 5 * 1024 * 1024;

function apakahIsiBerkasValid(ekstensi, buffer) {
  if (!buffer || buffer.length < 4) return false;
  if (ekstensi === ".pdf") {
    return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (ekstensi === ".png") {
    const tandaPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(tandaPng);
  }
  if (ekstensi === ".jpg" || ekstensi === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  return false;
}

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

    const namaBerkasAkhir = `${crypto.randomUUID()}${ekstensi}`;
    const folderTujuan = path.join(process.cwd(), "storage", "lampiran");

    const buffer = Buffer.from(await berkas.arrayBuffer());
    if (!apakahIsiBerkasValid(ekstensi, buffer)) {
      return NextResponse.json(
        {
          sukses: false,
          pesan: "Isi berkas tidak sesuai dengan format PDF, JPG, JPEG, atau PNG.",
        },
        { status: 400 }
      );
    }

    await mkdir(folderTujuan, { recursive: true });
    await writeFile(path.join(folderTujuan, namaBerkasAkhir), buffer);

    return NextResponse.json({
      sukses: true,
      url: `/api/lampiran/${namaBerkasAkhir}`,
      namaBerkas: berkas.name,
    });
  } catch {
    return NextResponse.json(
      { sukses: false, pesan: "Gagal mengunggah berkas ke server." },
      { status: 500 }
    );
  }
}
