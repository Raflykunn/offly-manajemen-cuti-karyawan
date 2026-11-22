import { NextResponse } from "next/server";
import { ambilSesiPengguna } from "@/lib/autentikasi";
import { jalankanKueri } from "@/lib/db";
import {
  apakahLayakCutiTahunan,
  formatTanggalIso,
  hitungHariKerjaCuti,
  validasiBatasWaktuPengajuan,
} from "@/lib/kalkulasi-cuti";

export async function POST(request) {
  const sesi = await ambilSesiPengguna();
  if (!sesi) {
    return NextResponse.json(
      { sukses: false, pesan: "Tidak terautentikasi." },
      { status: 401 }
    );
  }

  try {
    const tubuh = await request.json();
    const jenisCutiId = Number(tubuh.jenis_cuti_id);
    const tanggalMulai = String(tubuh.tanggal_mulai || "").slice(0, 10);
    const tanggalSelesai = String(tubuh.tanggal_selesai || "").slice(0, 10);
    const opsiSetengahHari = Boolean(tubuh.opsi_setengah_hari);

    if (!jenisCutiId || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json(
        { sukses: false, pesan: "Lengkapi jenis cuti dan tanggal cuti." },
        { status: 400 }
      );
    }

    if (tanggalSelesai < tanggalMulai) {
      return NextResponse.json(
        {
          sukses: false,
          pesan: "Tanggal selesai harus sama dengan atau setelah tanggal mulai.",
        },
        { status: 400 }
      );
    }

    const [
      hasilPengguna,
      hasilJenisCuti,
      hasilHariLibur,
      hasilBlackout,
      hasilOverlap,
    ] = await Promise.all([
      jalankanKueri(
        `SELECT p.id, p.kuota_cuti_awal, p.sisa_kuota_cuti, p.tanggal_bergabung, p.divisi_id,
                d.nama_divisi, d.batas_kapasitas_persen
         FROM pengguna p
         LEFT JOIN divisi d ON d.id = p.divisi_id
         WHERE p.id = $1 AND p.status_aktif = TRUE`,
        [sesi.id]
      ),
      jalankanKueri(`SELECT * FROM jenis_cuti WHERE id = $1`, [jenisCutiId]),
      jalankanKueri(`SELECT tanggal, nama_libur, jenis FROM hari_libur`),
      jalankanKueri(
        `SELECT id, nama_periode, tanggal_mulai, tanggal_selesai, alasan
         FROM periode_blackout
         WHERE status_aktif = TRUE
           AND daterange(tanggal_mulai, tanggal_selesai, '[]') && daterange($1::date, $2::date, '[]')`,
        [tanggalMulai, tanggalSelesai]
      ),
      jalankanKueri(
        `SELECT id, nomor_pengajuan, tanggal_mulai, tanggal_selesai, status
         FROM pengajuan_cuti
         WHERE pengguna_id = $1
           AND status IN ('Pending', 'Approved by Leader', 'Approved by HRD')
           AND daterange(tanggal_mulai, tanggal_selesai, '[]') && daterange($2::date, $3::date, '[]')`,
        [sesi.id, tanggalMulai, tanggalSelesai]
      ),
    ]);

    if (hasilPengguna.rows.length === 0 || hasilJenisCuti.rows.length === 0) {
      return NextResponse.json(
        { sukses: false, pesan: "Data pengguna atau jenis cuti tidak valid." },
        { status: 404 }
      );
    }

    const pengguna = hasilPengguna.rows[0];
    const jenisCuti = hasilJenisCuti.rows[0];
    const daftarLibur = hasilHariLibur.rows.map((item) => ({
      tanggal: formatTanggalIso(item.tanggal),
      nama_libur: item.nama_libur,
    }));

    const hasilHitung = hitungHariKerjaCuti(
      tanggalMulai,
      tanggalSelesai,
      opsiSetengahHari,
      daftarLibur
    );

    const hariIniStr = formatTanggalIso(new Date());
    const validasiWaktu = validasiBatasWaktuPengajuan(
      jenisCuti,
      hariIniStr,
      tanggalMulai
    );
    const layakTahunan = apakahLayakCutiTahunan(pengguna.tanggal_bergabung);

    const sisaKuotaSekarang = Number(pengguna.sisa_kuota_cuti);
    const proyeksiSisaKuota = jenisCuti.potong_kuota_tahunan
      ? Math.max(0, sisaKuotaSekarang - hasilHitung.totalHari)
      : sisaKuotaSekarang;

    let infoKapasitas = null;
    if (pengguna.divisi_id) {
      const [hasilAnggota, hasilCutiDivisi] = await Promise.all([
        jalankanKueri(
          `SELECT COUNT(*)::int AS total
           FROM pengguna
           WHERE divisi_id = $1 AND status_aktif = TRUE`,
          [pengguna.divisi_id]
        ),
        jalankanKueri(
          `SELECT DISTINCT p.id, p.nama_lengkap, pc.tanggal_mulai, pc.tanggal_selesai, pc.status
           FROM pengajuan_cuti pc
           JOIN pengguna p ON p.id = pc.pengguna_id
           WHERE p.divisi_id = $1
             AND p.id <> $2
             AND pc.status IN ('Pending', 'Approved by Leader', 'Approved by HRD')
             AND daterange(pc.tanggal_mulai, pc.tanggal_selesai, '[]') && daterange($3::date, $4::date, '[]')`,
          [pengguna.divisi_id, sesi.id, tanggalMulai, tanggalSelesai]
        ),
      ]);

      const totalAnggota = hasilAnggota.rows[0]?.total ?? 1;
      const rekanCuti = hasilCutiDivisi.rows.map((baris) => ({
        ...baris,
        tanggal_mulai: formatTanggalIso(baris.tanggal_mulai),
        tanggal_selesai: formatTanggalIso(baris.tanggal_selesai),
      }));
      const jumlahDisetujuiAtauProses = rekanCuti.length;
      const batasPersen = Number(pengguna.batas_kapasitas_persen ?? 30);
      const persenDenganPengajuanIni =
        totalAnggota > 0
          ? Math.round(((jumlahDisetujuiAtauProses + 1) / totalAnggota) * 100)
          : 0;

      infoKapasitas = {
        namaDivisi: pengguna.nama_divisi,
        totalAnggota,
        jumlahRekanCuti: jumlahDisetujuiAtauProses,
        batasPersen,
        persenSetelahPengajuan: persenDenganPengajuanIni,
        melebihiKapasitas:
          totalAnggota >= 2 && persenDenganPengajuanIni > batasPersen,
        rekanCutiBersamaan: rekanCuti,
      };
    }

    const daftarPesanValidasi = [];

    if (tanggalSelesai < tanggalMulai) {
      daftarPesanValidasi.push("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    }
    if (hasilHitung.totalHari <= 0) {
      daftarPesanValidasi.push(
        "Rentang tanggal tidak memiliki hari kerja efektif (hanya akhir pekan atau hari libur)."
      );
    }
    if (
      opsiSetengahHari &&
      hasilHitung.rincianHariKerja.length !== 1
    ) {
      daftarPesanValidasi.push(
        "Opsi cuti setengah hari (0.5) hanya berlaku untuk tepat 1 hari kerja."
      );
    }
    if (jenisCuti.kode_cuti === "TAHUNAN" && !layakTahunan) {
      daftarPesanValidasi.push(
        "Masa kerja Anda masih kurang dari 1 tahun sehingga belum memenuhi syarat Cuti Tahunan."
      );
    }
    if (!validasiWaktu.valid) {
      daftarPesanValidasi.push(validasiWaktu.pesan);
    }
    if (
      jenisCuti.potong_kuota_tahunan &&
      hasilHitung.totalHari > sisaKuotaSekarang
    ) {
      daftarPesanValidasi.push(
        `Sisa kuota tahunan (${sisaKuotaSekarang} hari) tidak mencukupi untuk pengajuan ${hasilHitung.totalHari} hari.`
      );
    }
    if (
      !jenisCuti.potong_kuota_tahunan &&
      jenisCuti.kuota_default > 0 &&
      hasilHitung.totalHari > jenisCuti.kuota_default
    ) {
      daftarPesanValidasi.push(
        `Durasi melebihi batas maksimal ${jenisCuti.nama_cuti} (${jenisCuti.kuota_default} hari).`
      );
    }
    if (hasilBlackout.rows.length > 0) {
      const bo = hasilBlackout.rows[0];
      daftarPesanValidasi.push(
        `Tanggal jatuh dalam Blackout Period: ${bo.nama_periode} (${bo.alasan}).`
      );
    }
    if (hasilOverlap.rows.length > 0) {
      const ov = hasilOverlap.rows[0];
      daftarPesanValidasi.push(
        `Tanggal bertabrakan (overlap) dengan pengajuan ${ov.nomor_pengajuan} (${ov.status}).`
      );
    }

    return NextResponse.json({
      sukses: true,
      simulasi: {
        ...hasilHitung,
        sisaKuotaSekarang,
        proyeksiSisaKuota,
        memotongKuota: jenisCuti.potong_kuota_tahunan,
        wajibLampiran: jenisCuti.wajib_lampiran,
        pelanggaranBlackout: hasilBlackout.rows.map((b) => ({
          ...b,
          tanggal_mulai: formatTanggalIso(b.tanggal_mulai),
          tanggal_selesai: formatTanggalIso(b.tanggal_selesai),
        })),
        konflikOverlap: hasilOverlap.rows.map((o) => ({
          ...o,
          tanggal_mulai: formatTanggalIso(o.tanggal_mulai),
          tanggal_selesai: formatTanggalIso(o.tanggal_selesai),
        })),
        infoKapasitas,
        dapatDiajukan: daftarPesanValidasi.length === 0,
        daftarPesanValidasi,
      },
    });
  } catch {
    return NextResponse.json(
      { sukses: false, pesan: "Gagal menghitung simulasi cuti." },
      { status: 500 }
    );
  }
}
