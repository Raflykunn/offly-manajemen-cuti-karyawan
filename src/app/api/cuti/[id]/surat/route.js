import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
import {
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";

function bersihkanTeksPdf(teks) {
  return String(teks || "-")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, " ")
    .trim();
}

function bungkusTeksPdf(teks, maksKarakter = 75) {
  const kata = bersihkanTeksPdf(teks).split(/\s+/);
  const baris = [];
  let barisSaatIni = "";
  for (const item of kata) {
    if ((barisSaatIni + " " + item).trim().length > maksKarakter) {
      if (barisSaatIni) baris.push(barisSaatIni);
      barisSaatIni = item;
    } else {
      barisSaatIni = (barisSaatIni + " " + item).trim();
    }
  }
  if (barisSaatIni) baris.push(barisSaatIni);
  return baris.length > 0 ? baris : ["-"];
}

export async function GET(_request, context) {
  const sesi = await ambilSesiPengguna();
  if (!sesi) {
    return NextResponse.json(
      { sukses: false, pesan: "Sesi tidak valid." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const pengajuanId = Number(id);
  if (!pengajuanId) {
    return NextResponse.json(
      { sukses: false, pesan: "ID pengajuan tidak valid." },
      { status: 400 }
    );
  }

  const hasil = await jalankanKueri(
    `SELECT pc.*,
            jc.nama_cuti, jc.kode_cuti,
            p.nama_lengkap AS nama_pemohon, p.email AS email_pemohon,
            p.peran AS peran_pemohon, p.telepon AS telepon_pemohon,
            d.nama_divisi, d.ketua_divisi_id,
            rp.nama_lengkap AS nama_rekan_pengganti,
            ka.nama_lengkap AS nama_ketua_approver,
            ha.nama_lengkap AS nama_hrd_approver
     FROM pengajuan_cuti pc
     JOIN jenis_cuti jc ON jc.id = pc.jenis_cuti_id
     JOIN pengguna p ON p.id = pc.pengguna_id
     LEFT JOIN divisi d ON d.id = p.divisi_id
     LEFT JOIN pengguna rp ON rp.id = pc.rekan_pengganti_id
     LEFT JOIN pengguna ka ON ka.id = pc.ketua_approver_id
     LEFT JOIN pengguna ha ON ha.id = pc.hrd_approver_id
     WHERE pc.id = $1`,
    [pengajuanId]
  );

  if (hasil.rows.length === 0) {
    return NextResponse.json(
      { sukses: false, pesan: "Pengajuan cuti tidak ditemukan." },
      { status: 404 }
    );
  }

  const data = hasil.rows[0];
  const berhakMengunduh =
    data.pengguna_id === sesi.id ||
    sesi.peran === "hrd" ||
    sesi.peran === "admin" ||
    (sesi.peran === "ketua_divisi" && data.ketua_divisi_id === sesi.id);

  if (!berhakMengunduh) {
    return NextResponse.json(
      { sukses: false, pesan: "Anda tidak memiliki izin mengunduh surat ini." },
      { status: 403 }
    );
  }

  if (data.status !== "Approved by HRD") {
    return NextResponse.json(
      {
        sukses: false,
        pesan: "Surat cuti PDF hanya dapat diterbitkan setelah berstatus Approved by HRD.",
      },
      { status: 400 }
    );
  }

  const dokumenPdf = await PDFDocument.create();
  const halaman = dokumenPdf.addPage([595.28, 841.89]);
  const fontBiasa = await dokumenPdf.embedFont(StandardFonts.Helvetica);
  const fontTebal = await dokumenPdf.embedFont(StandardFonts.HelveticaBold);

  const warnaUtama = rgb(0.85, 0.47, 0.02);
  const warnaTeks = rgb(0.15, 0.15, 0.17);
  const warnaAbu = rgb(0.45, 0.45, 0.5);
  const warnaGaris = rgb(0.85, 0.85, 0.88);

  halaman.drawRectangle({
    x: 0,
    y: 760,
    width: 595.28,
    height: 81.89,
    color: warnaUtama,
  });

  halaman.drawText("OFFLY", {
    x: 50,
    y: 802,
    size: 22,
    font: fontTebal,
    color: rgb(1, 1, 1),
  });
  halaman.drawText("SISTEM MANAJEMEN CUTI KARYAWAN", {
    x: 50,
    y: 782,
    size: 10,
    font: fontBiasa,
    color: rgb(1, 0.96, 0.88),
  });
  halaman.drawText("SURAT IZIN CUTI RESMI", {
    x: 390,
    y: 794,
    size: 12,
    font: fontTebal,
    color: rgb(1, 1, 1),
  });

  let posisiY = 725;

  halaman.drawText(
    bersihkanTeksPdf(`Nomor Surat: SURAT/${data.nomor_pengajuan}`),
    { x: 50, y: posisiY, size: 11, font: fontTebal, color: warnaTeks }
  );
  halaman.drawText(
    bersihkanTeksPdf(`Tanggal Terbit: ${formatTanggalIndo(new Date())}`),
    { x: 390, y: posisiY, size: 10, font: fontBiasa, color: warnaAbu }
  );

  posisiY -= 16;
  halaman.drawLine({
    start: { x: 50, y: posisiY },
    end: { x: 545, y: posisiY },
    thickness: 1,
    color: warnaGaris,
  });

  posisiY -= 26;
  halaman.drawText("I. IDENTITAS PEMOHON CUTI", {
    x: 50,
    y: posisiY,
    size: 11,
    font: fontTebal,
    color: warnaUtama,
  });

  const barisIdentitas = [
    ["Nama Lengkap", data.nama_pemohon],
    ["Email Perusahaan", data.email_pemohon],
    ["Jabatan / Peran", labelPeranPengguna(data.peran_pemohon)],
    ["Divisi", data.nama_divisi || "-"],
    ["Nomor Darurat", data.nomor_darurat],
  ];

  for (const [label, nilai] of barisIdentitas) {
    posisiY -= 20;
    halaman.drawText(label, {
      x: 50,
      y: posisiY,
      size: 10,
      font: fontBiasa,
      color: warnaAbu,
    });
    halaman.drawText(":", {
      x: 185,
      y: posisiY,
      size: 10,
      font: fontBiasa,
      color: warnaTeks,
    });
    halaman.drawText(bersihkanTeksPdf(nilai), {
      x: 200,
      y: posisiY,
      size: 10,
      font: fontTebal,
      color: warnaTeks,
    });
  }

  posisiY -= 32;
  halaman.drawText("II. RINCIAN PELAKSANAAN CUTI", {
    x: 50,
    y: posisiY,
    size: 11,
    font: fontTebal,
    color: warnaUtama,
  });

  const periodeTeks = `${formatTanggalIndo(data.tanggal_mulai)} s.d. ${formatTanggalIndo(data.tanggal_selesai)}`;
  const durasiTeks = `${formatAngkaKuota(data.total_hari_cuti)} Hari Kerja${
    data.opsi_setengah_hari ? " (Cuti Setengah Hari)" : ""
  }`;

  const barisCuti = [
    ["Jenis Cuti", `${data.nama_cuti} (${data.kode_cuti})`],
    ["Tanggal Pengajuan", formatTanggalIndo(data.tanggal_pengajuan)],
    ["Periode Cuti", periodeTeks],
    ["Total Durasi", durasiTeks],
    ["Alamat Selama Cuti", data.alamat_selama_cuti],
    ["Rekan Pengganti", data.nama_rekan_pengganti || "-"],
  ];

  for (const [label, nilai] of barisCuti) {
    posisiY -= 20;
    halaman.drawText(label, {
      x: 50,
      y: posisiY,
      size: 10,
      font: fontBiasa,
      color: warnaAbu,
    });
    halaman.drawText(":", {
      x: 185,
      y: posisiY,
      size: 10,
      font: fontBiasa,
      color: warnaTeks,
    });
    halaman.drawText(bersihkanTeksPdf(nilai), {
      x: 200,
      y: posisiY,
      size: 10,
      font: fontBiasa,
      color: warnaTeks,
    });
  }

  posisiY -= 24;
  halaman.drawText("Alasan Cuti:", {
    x: 50,
    y: posisiY,
    size: 10,
    font: fontBiasa,
    color: warnaAbu,
  });
  for (const barisAlasan of bungkusTeksPdf(data.alasan_cuti, 62)) {
    posisiY -= 15;
    halaman.drawText(barisAlasan, {
      x: 200,
      y: posisiY + 15,
      size: 10,
      font: fontBiasa,
      color: warnaTeks,
    });
  }

  if (data.catatan_tugas) {
    posisiY -= 8;
    halaman.drawText("Catatan Handover:", {
      x: 50,
      y: posisiY,
      size: 10,
      font: fontBiasa,
      color: warnaAbu,
    });
    for (const barisTugas of bungkusTeksPdf(data.catatan_tugas, 62)) {
      posisiY -= 15;
      halaman.drawText(barisTugas, {
        x: 200,
        y: posisiY + 15,
        size: 10,
        font: fontBiasa,
        color: warnaTeks,
      });
    }
  }

  posisiY -= 32;
  halaman.drawText("III. PENGESAHAN & PERSETUJUAN BERJENJANG", {
    x: 50,
    y: posisiY,
    size: 11,
    font: fontTebal,
    color: warnaUtama,
  });

  posisiY -= 18;
  halaman.drawRectangle({
    x: 50,
    y: posisiY - 95,
    width: 235,
    height: 95,
    borderColor: warnaGaris,
    borderWidth: 1,
  });
  halaman.drawRectangle({
    x: 310,
    y: posisiY - 95,
    width: 235,
    height: 95,
    borderColor: warnaGaris,
    borderWidth: 1,
  });

  halaman.drawText("Verifikasi Ketua Divisi", {
    x: 62,
    y: posisiY - 18,
    size: 9,
    font: fontTebal,
    color: warnaAbu,
  });
  if (data.peran_pemohon === "ketua_divisi") {
    halaman.drawText("Tidak Diperlukan (Langsung HRD)", {
      x: 62,
      y: posisiY - 46,
      size: 9,
      font: fontBiasa,
      color: warnaAbu,
    });
  } else {
    halaman.drawText("DISETUJUI DIGITAL", {
      x: 62,
      y: posisiY - 38,
      size: 9,
      font: fontTebal,
      color: rgb(0.05, 0.52, 0.35),
    });
    halaman.drawText(
      bersihkanTeksPdf(data.nama_ketua_approver || "Ketua Divisi"),
      {
        x: 62,
        y: posisiY - 58,
        size: 10,
        font: fontTebal,
        color: warnaTeks,
      }
    );
    halaman.drawText(
      bersihkanTeksPdf(
        formatTanggalIndo(data.waktu_verifikasi_ketua, true)
      ),
      {
        x: 62,
        y: posisiY - 74,
        size: 8,
        font: fontBiasa,
        color: warnaAbu,
      }
    );
  }

  halaman.drawText("Persetujuan Final HRD", {
    x: 322,
    y: posisiY - 18,
    size: 9,
    font: fontTebal,
    color: warnaAbu,
  });
  halaman.drawText("DISETUJUI FINAL", {
    x: 322,
    y: posisiY - 38,
    size: 9,
    font: fontTebal,
    color: rgb(0.05, 0.52, 0.35),
  });
  halaman.drawText(bersihkanTeksPdf(data.nama_hrd_approver || "HRD"), {
    x: 322,
    y: posisiY - 58,
    size: 10,
    font: fontTebal,
    color: warnaTeks,
  });
  halaman.drawText(
    bersihkanTeksPdf(formatTanggalIndo(data.waktu_verifikasi_hrd, true)),
    {
      x: 322,
      y: posisiY - 74,
      size: 8,
      font: fontBiasa,
      color: warnaAbu,
    }
  );

  halaman.drawLine({
    start: { x: 50, y: 70 },
    end: { x: 545, y: 70 },
    thickness: 0.75,
    color: warnaGaris,
  });
  halaman.drawText(
    "Dokumen ini diterbitkan secara otomatis oleh aplikasi Offly dan sah sebagai surat izin cuti resmi.",
    {
      x: 50,
      y: 52,
      size: 8.5,
      font: fontBiasa,
      color: warnaAbu,
    }
  );

  const bytesPdf = await dokumenPdf.save();
  const namaBerkas = `Surat-Cuti-${data.nomor_pengajuan}.pdf`;

  return new NextResponse(Buffer.from(bytesPdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${namaBerkas}"`,
      "Cache-Control": "no-store",
    },
  });
}
