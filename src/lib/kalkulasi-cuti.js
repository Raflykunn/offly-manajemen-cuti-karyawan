export function formatTanggalIso(nilaiTanggal) {
  if (!nilaiTanggal) return "";
  if (typeof nilaiTanggal === "string") {
    return nilaiTanggal.slice(0, 10);
  }
  const tgl = new Date(nilaiTanggal);
  const tahun = tgl.getFullYear();
  const bulan = String(tgl.getMonth() + 1).padStart(2, "0");
  const hari = String(tgl.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

export function buatTanggalLokal(teksTanggal) {
  const bersih = formatTanggalIso(teksTanggal);
  const [tahun, bulan, hari] = bersih.split("-").map(Number);
  return new Date(tahun, bulan - 1, hari, 0, 0, 0, 0);
}

export function hitungHariKerjaCuti(
  tanggalMulaiStr,
  tanggalSelesaiStr,
  opsiSetengahHari = false,
  daftarTanggalLibur = []
) {
  if (!tanggalMulaiStr || !tanggalSelesaiStr) {
    return {
      totalHari: 0,
      rincianHariKerja: [],
      hariLiburTerlewati: [],
      akhirPekanTerlewati: 0,
    };
  }

  const mulai = buatTanggalLokal(tanggalMulaiStr);
  const selesai = buatTanggalLokal(tanggalSelesaiStr);
  if (selesai < mulai) {
    return {
      totalHari: 0,
      rincianHariKerja: [],
      hariLiburTerlewati: [],
      akhirPekanTerlewati: 0,
    };
  }

  const setLibur = new Set(
    daftarTanggalLibur.map((item) =>
      typeof item === "string" ? formatTanggalIso(item) : formatTanggalIso(item.tanggal)
    )
  );
  const petaInfoLibur = new Map();
  for (const item of daftarTanggalLibur) {
    if (typeof item === "object" && item?.tanggal) {
      petaInfoLibur.set(formatTanggalIso(item.tanggal), {
        nama: item.nama_libur || "Hari Libur",
        jenis: item.jenis || "Libur Nasional",
      });
    }
  }

  const rincianHariKerja = [];
  const hariLiburTerlewati = [];
  let akhirPekanTerlewati = 0;

  const kursor = new Date(mulai);
  while (kursor <= selesai) {
    const indeksHari = kursor.getDay();
    const kunciTanggal = formatTanggalIso(kursor);

    if (indeksHari === 0 || indeksHari === 6) {
      akhirPekanTerlewati += 1;
    } else if (setLibur.has(kunciTanggal)) {
      const infoLibur = petaInfoLibur.get(kunciTanggal);
      hariLiburTerlewati.push({
        tanggal: kunciTanggal,
        nama: infoLibur?.nama || "Hari Libur",
        jenis: infoLibur?.jenis || "Libur Nasional",
      });
    } else {
      rincianHariKerja.push(kunciTanggal);
    }
    kursor.setDate(kursor.getDate() + 1);
  }

  let totalHari = rincianHariKerja.length;
  if (opsiSetengahHari && totalHari === 1) {
    totalHari = 0.5;
  }

  return {
    totalHari,
    rincianHariKerja,
    hariLiburTerlewati,
    akhirPekanTerlewati,
  };
}

export function pesanTanpaHariKerja(hasilHitung) {
  const adaAkhirPekan = hasilHitung.akhirPekanTerlewati > 0;
  const daftarCutiBersama = hasilHitung.hariLiburTerlewati.filter(
    (h) => h.jenis === "Cuti Bersama"
  );
  const daftarLiburNasional = hasilHitung.hariLiburTerlewati.filter(
    (h) => h.jenis !== "Cuti Bersama"
  );

  if (adaAkhirPekan && daftarCutiBersama.length === 0 && daftarLiburNasional.length === 0) {
    return "Tanggal yang dipilih jatuh pada akhir pekan (Sabtu/Minggu), tidak dihitung hari kerja.";
  }
  if (!adaAkhirPekan && daftarCutiBersama.length > 0 && daftarLiburNasional.length === 0) {
    const nama = daftarCutiBersama.map((h) => h.nama).join(", ");
    return `Tanggal yang dipilih bertepatan dengan cuti bersama (${nama}), sehingga tidak perlu mengajukan cuti.`;
  }
  if (!adaAkhirPekan && daftarLiburNasional.length > 0 && daftarCutiBersama.length === 0) {
    const nama = daftarLiburNasional.map((h) => h.nama).join(", ");
    return `Tanggal yang dipilih bertepatan dengan libur nasional (${nama}), sehingga tidak perlu mengajukan cuti.`;
  }

  const bagian = [];
  if (adaAkhirPekan) bagian.push("akhir pekan");
  if (daftarCutiBersama.length > 0) bagian.push("cuti bersama");
  if (daftarLiburNasional.length > 0) bagian.push("libur nasional");
  return `Seluruh tanggal yang dipilih jatuh pada ${bagian.join(" dan ")} (0 hari kerja).`;
}

export function selisihHariKalender(tanggalAwalStr, tanggalAkhirStr) {
  const awal = buatTanggalLokal(tanggalAwalStr);
  const akhir = buatTanggalLokal(tanggalAkhirStr);
  const selisihMs = akhir.getTime() - awal.getTime();
  return Math.round(selisihMs / (1000 * 60 * 60 * 24));
}

export function validasiBatasWaktuPengajuan(
  jenisCuti,
  tanggalPengajuanStr,
  tanggalMulaiStr
) {
  const batas = Number(jenisCuti?.batas_hari_pengajuan ?? 0);
  const selisihHari = selisihHariKalender(tanggalPengajuanStr, tanggalMulaiStr);

  if (batas > 0) {
    if (selisihHari < 0) {
      return {
        valid: false,
        pesan: "Tanggal mulai cuti tidak boleh di masa lalu.",
      };
    }
    if (selisihHari < batas) {
      return {
        valid: false,
        pesan: `${jenisCuti.nama_cuti} harus diajukan minimal H-${batas} sebelum tanggal mulai.`,
      };
    }
  } else if (batas < 0) {
    const maksTerlambat = Math.abs(batas);
    if (selisihHari < -maksTerlambat) {
      return {
        valid: false,
        pesan: `${jenisCuti.nama_cuti} maksimal diajukan ${maksTerlambat} hari setelah tanggal mulai.`,
      };
    }
  } else if (selisihHari < 0) {
    return {
      valid: false,
      pesan: `${jenisCuti.nama_cuti} tidak boleh diajukan untuk tanggal yang sudah lewat.`,
    };
  }

  return { valid: true, pesan: "" };
}

export function hitungMasaKerjaTahun(tanggalBergabungStr, tanggalAcuan = new Date()) {
  if (!tanggalBergabungStr) return 0;
  const mulai = buatTanggalLokal(tanggalBergabungStr);
  const acuan = new Date(
    tanggalAcuan.getFullYear(),
    tanggalAcuan.getMonth(),
    tanggalAcuan.getDate()
  );
  const selisihMs = acuan.getTime() - mulai.getTime();
  return selisihMs / (1000 * 60 * 60 * 24 * 365.25);
}

export function apakahLayakCutiTahunan(tanggalBergabungStr, tanggalAcuan = new Date()) {
  if (!tanggalBergabungStr) return false;
  const mulai = buatTanggalLokal(tanggalBergabungStr);
  const batasSatuTahun = new Date(
    mulai.getFullYear() + 1,
    mulai.getMonth(),
    mulai.getDate()
  );
  const acuan = new Date(
    tanggalAcuan.getFullYear(),
    tanggalAcuan.getMonth(),
    tanggalAcuan.getDate()
  );
  return acuan >= batasSatuTahun;
}

export function formatTanggalIndo(nilaiTanggal, denganJam = false) {
  if (!nilaiTanggal) return "-";
  const tgl = new Date(nilaiTanggal);
  if (Number.isNaN(tgl.getTime())) return "-";
  const opsi = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Makassar",
  };
  if (denganJam) {
    opsi.hour = "2-digit";
    opsi.minute = "2-digit";
  }
  return new Intl.DateTimeFormat("id-ID", opsi).format(tgl);
}

export function formatAngkaKuota(nilai) {
  const angka = Number(nilai ?? 0);
  if (Number.isInteger(angka)) {
    return String(angka);
  }
  return angka.toFixed(1).replace(/\.0$/, "");
}

export function labelPeranPengguna(peran) {
  const petaPeran = {
    admin: "Admin",
    karyawan: "Karyawan",
    ketua_divisi: "Ketua Divisi",
    hrd: "HRD",
  };
  return petaPeran[peran] || peran;
}

export function gayaStatusCuti(status) {
  const peta = {
    Pending:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    "Approved by Leader":
      "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    "Approved by HRD":
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    "Rejected by Leader":
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    "Rejected by HRD":
      "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    Cancelled:
      "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  };
  return peta[status] || "bg-muted text-muted-foreground";
}

export function hitungKapasitasCutiDivisi(
  totalAnggota,
  sedangCuti,
  batasPersen = 30
) {
  const jumlahAnggota = Math.max(0, Number(totalAnggota || 0));
  const jumlahCuti = Math.max(0, Number(sedangCuti || 0));
  const batas = Math.max(0, Number(batasPersen ?? 30));
  const maksOrang =
    jumlahAnggota > 0 && batas > 0
      ? Math.max(1, Math.floor((batas / 100) * jumlahAnggota))
      : 0;
  const persenBeban =
    jumlahAnggota > 0 ? Math.round((jumlahCuti / jumlahAnggota) * 100) : 0;

  return {
    maksOrang,
    persenBeban,
    melebihiBatas: jumlahAnggota >= 2 && jumlahCuti > maksOrang,
  };
}

export function apakahUrlLampiranAman(url) {
  if (!url) return false;
  return /^\/(api\/lampiran|uploads\/lampiran)\/[a-zA-Z0-9._-]+$/.test(
    String(url).trim()
  );
}
