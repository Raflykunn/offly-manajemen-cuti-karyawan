"use server";

import { revalidatePath } from "next/cache";
import { jalankanKueri, jalankanTransaksi } from "@/lib/db";
import {
  ambilSesiPengguna,
  buatHashKataSandi,
  wajibSesiPengguna,
} from "@/lib/autentikasi";
import { formatTanggalIso } from "@/lib/kalkulasi-cuti";

export async function ambilProfilLengkap() {
  const sesi = await ambilSesiPengguna();
  if (!sesi) return null;

  const hasilPengguna = await jalankanKueri(
    `SELECT p.id, p.username, p.email, p.nama_lengkap, p.peran, p.divisi_id,
            p.kuota_cuti_awal, p.sisa_kuota_cuti, p.telepon, p.alamat, p.foto_profil,
            p.tanggal_bergabung, p.status_aktif,
            d.nama_divisi, d.batas_kapasitas_persen,
            k.nama_lengkap AS nama_ketua_divisi
     FROM pengguna p
     LEFT JOIN divisi d ON d.id = p.divisi_id
     LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
     WHERE p.id = $1
     LIMIT 1`,
    [sesi.id]
  );

  if (hasilPengguna.rows.length === 0) {
    return null;
  }

  const hasilNotifikasi = await jalankanKueri(
    `SELECT id, judul, pesan, tautan, sudah_dibaca, dibuat_pada
     FROM notifikasi
     WHERE pengguna_id = $1
     ORDER BY dibuat_pada DESC
     LIMIT 15`,
    [sesi.id]
  );

  const hasilBelumDibaca = await jalankanKueri(
    `SELECT COUNT(*)::int AS total
     FROM notifikasi
     WHERE pengguna_id = $1 AND sudah_dibaca = FALSE`,
    [sesi.id]
  );

  const profil = hasilPengguna.rows[0];
  return {
    pengguna: {
      ...profil,
      kuota_cuti_awal: Number(profil.kuota_cuti_awal),
      sisa_kuota_cuti: Number(profil.sisa_kuota_cuti),
      tanggal_bergabung: profil.tanggal_bergabung
        ? formatTanggalIso(profil.tanggal_bergabung)
        : "",
    },
    notifikasi: hasilNotifikasi.rows.map((item) => ({
      ...item,
      dibuat_pada: item.dibuat_pada
        ? new Date(item.dibuat_pada).toISOString()
        : "",
    })),
    jumlahBelumDibaca: hasilBelumDibaca.rows[0]?.total ?? 0,
  };
}

export async function ubahProfilSendiri(statusSebelumnya, formData) {
  const sesi = await wajibSesiPengguna();

  const namaLengkap = String(formData.get("nama_lengkap") || "").trim();
  const telepon = String(formData.get("telepon") || "").trim();
  const alamat = String(formData.get("alamat") || "").trim();
  const fotoProfil = String(formData.get("foto_profil") || "").trim();
  const kataSandiBaru = String(formData.get("kata_sandi_baru") || "");

  if (!namaLengkap) {
    return {
      sukses: false,
      pesan: "Nama lengkap wajib diisi.",
    };
  }

  if (telepon && !/^\d{12,13}$/.test(telepon)) {
    return {
      sukses: false,
      pesan: "Nomor telepon harus berupa 12–13 digit angka.",
    };
  }

  if (kataSandiBaru && kataSandiBaru.length < 6) {
    return {
      sukses: false,
      pesan: "Kata sandi baru minimal terdiri dari 6 karakter.",
    };
  }

  try {
    if (kataSandiBaru) {
      const hashBaru = await buatHashKataSandi(kataSandiBaru);
      await jalankanKueri(
        `UPDATE pengguna
         SET nama_lengkap = $1,
             telepon = $2,
             alamat = $3,
             foto_profil = $4,
             kata_sandi_hash = $5,
             diperbarui_pada = NOW()
         WHERE id = $6`,
        [
          namaLengkap,
          telepon || null,
          alamat || null,
          fotoProfil || null,
          hashBaru,
          sesi.id,
        ]
      );
    } else {
      await jalankanKueri(
        `UPDATE pengguna
         SET nama_lengkap = $1,
             telepon = $2,
             alamat = $3,
             foto_profil = $4,
             diperbarui_pada = NOW()
         WHERE id = $5`,
        [
          namaLengkap,
          telepon || null,
          alamat || null,
          fotoProfil || null,
          sesi.id,
        ]
      );
    }

    revalidatePath("/profil");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: "Data profil Anda berhasil diperbarui.",
    };
  } catch {
    return {
      sukses: false,
      pesan: "Terjadi kesalahan saat menyimpan perubahan profil.",
    };
  }
}

export async function tandaiSemuaNotifikasiDibaca() {
  const sesi = await wajibSesiPengguna();
  await jalankanKueri(
    `UPDATE notifikasi SET sudah_dibaca = TRUE WHERE pengguna_id = $1`,
    [sesi.id]
  );
  revalidatePath("/dasbor");
  revalidatePath("/profil");
}

export async function tandaiSatuNotifikasiDibaca(idNotifikasi) {
  const sesi = await wajibSesiPengguna();
  await jalankanKueri(
    `UPDATE notifikasi SET sudah_dibaca = TRUE WHERE id = $1 AND pengguna_id = $2`,
    [Number(idNotifikasi), sesi.id]
  );
  revalidatePath("/dasbor");
}

export async function ambilDaftarPengguna(filter = {}) {
  await wajibSesiPengguna(["admin"]);

  const kondisi = [];
  const parameter = [];

  if (filter.peran && filter.peran !== "semua") {
    parameter.push(filter.peran);
    kondisi.push(`p.peran = $${parameter.length}`);
  }

  if (filter.divisi_id && filter.divisi_id !== "semua") {
    if (filter.divisi_id === "tanpa_divisi") {
      kondisi.push(`p.divisi_id IS NULL`);
    } else {
      parameter.push(Number(filter.divisi_id));
      kondisi.push(`p.divisi_id = $${parameter.length}`);
    }
  }

  if (filter.status_aktif && filter.status_aktif !== "semua") {
    parameter.push(filter.status_aktif === "aktif");
    kondisi.push(`p.status_aktif = $${parameter.length}`);
  }

  if (filter.masa_kerja === "kurang_1_tahun") {
    kondisi.push(`p.tanggal_bergabung > (CURRENT_DATE - INTERVAL '1 year')`);
  } else if (filter.masa_kerja === "lebih_1_tahun") {
    kondisi.push(`p.tanggal_bergabung <= (CURRENT_DATE - INTERVAL '1 year')`);
  }

  if (filter.cari && filter.cari.trim()) {
    parameter.push(`%${filter.cari.trim()}%`);
    kondisi.push(
      `(p.nama_lengkap ILIKE $${parameter.length} OR p.email ILIKE $${parameter.length} OR p.username ILIKE $${parameter.length})`
    );
  }

  const klausaWhere =
    kondisi.length > 0 ? `WHERE ${kondisi.join(" AND ")}` : "";

  const petaUrutan = {
    nama_asc: "p.nama_lengkap ASC",
    nama_desc: "p.nama_lengkap DESC",
    gabung_baru: "p.tanggal_bergabung DESC",
    gabung_lama: "p.tanggal_bergabung ASC",
    divisi_asc: "COALESCE(d.nama_divisi, 'ZZZ') ASC, p.nama_lengkap ASC",
  };
  const urutan = petaUrutan[filter.urutkan] || "p.nama_lengkap ASC";

  const [hasilPengguna, hasilDivisi] = await Promise.all([
    jalankanKueri(
      `SELECT p.id, p.username, p.email, p.nama_lengkap, p.peran, p.divisi_id,
              p.kuota_cuti_awal, p.sisa_kuota_cuti, p.telepon, p.alamat,
              p.tanggal_bergabung, p.status_aktif, d.nama_divisi,
              EXTRACT(MONTH FROM AGE(CURRENT_DATE, p.tanggal_bergabung))::int +
              (EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.tanggal_bergabung))::int * 12) AS total_bulan_kerja
       FROM pengguna p
       LEFT JOIN divisi d ON d.id = p.divisi_id
       ${klausaWhere}
       ORDER BY ${urutan}`,
      parameter
    ),
    jalankanKueri(`SELECT id, nama_divisi FROM divisi ORDER BY nama_divisi ASC`),
  ]);

  return {
    daftarPengguna: hasilPengguna.rows.map((baris) => ({
      ...baris,
      kuota_cuti_awal: Number(baris.kuota_cuti_awal),
      sisa_kuota_cuti: Number(baris.sisa_kuota_cuti),
      tanggal_bergabung: formatTanggalIso(baris.tanggal_bergabung),
    })),
    daftarDivisi: hasilDivisi.rows,
  };
}

export async function tambahPenggunaBaru(formData) {
  await wajibSesiPengguna(["admin"]);

  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const kataSandi = String(formData.get("kata_sandi") || "");
  const namaLengkap = String(formData.get("nama_lengkap") || "").trim();
  const peran = String(formData.get("peran") || "").trim();
  const divisiMentah = String(formData.get("divisi_id") || "");
  const divisiId =
    divisiMentah && divisiMentah !== "kosong" ? Number(divisiMentah) : null;
  const kuotaAwal = Number(formData.get("kuota_cuti_awal") || 12);
  const tanggalBergabung =
    String(formData.get("tanggal_bergabung") || "").trim() ||
    formatTanggalIso(new Date());

  if (!username || !email || !kataSandi || !namaLengkap || !peran) {
    return {
      sukses: false,
      pesan: "Username, email, kata sandi, nama lengkap, dan peran wajib diisi.",
    };
  }

  const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!polaEmail.test(email)) {
    return { sukses: false, pesan: "Format alamat email tidak valid." };
  }

  if (kataSandi.length < 6) {
    return {
      sukses: false,
      pesan: "Kata sandi minimal terdiri dari 6 karakter.",
    };
  }

  if (!["admin", "karyawan", "ketua_divisi", "hrd"].includes(peran)) {
    return { sukses: false, pesan: "Peran pengguna tidak valid." };
  }

  if (Number.isNaN(kuotaAwal) || kuotaAwal < 0 || kuotaAwal > 30) {
    return { sukses: false, pesan: "Kuota cuti awal harus antara 0 hingga 30 hari." };
  }

  try {
    const hash = await buatHashKataSandi(kataSandi);
    await jalankanKueri(
      `INSERT INTO pengguna (
         username, email, kata_sandi_hash, nama_lengkap, peran,
         divisi_id, kuota_cuti_awal, sisa_kuota_cuti, tanggal_bergabung, status_aktif
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8, TRUE)`,
      [
        username,
        email,
        hash,
        namaLengkap,
        peran,
        divisiId,
        kuotaAwal,
        tanggalBergabung,
      ]
    );

    revalidatePath("/manajemen-pengguna");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: `Pengguna ${namaLengkap} berhasil ditambahkan.`,
    };
  } catch (kesalahan) {
    if (kesalahan.code === "23505") {
      return {
        sukses: false,
        pesan: "Username atau email sudah terdaftar pada sistem.",
      };
    }
    return {
      sukses: false,
      pesan: "Gagal menambahkan pengguna baru.",
    };
  }
}

export async function ubahDataPengguna(formData) {
  await wajibSesiPengguna(["admin"]);

  const id = Number(formData.get("id"));
  const username = String(formData.get("username") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const namaLengkap = String(formData.get("nama_lengkap") || "").trim();
  const peran = String(formData.get("peran") || "").trim();
  const divisiMentah = String(formData.get("divisi_id") || "");
  const divisiId =
    divisiMentah && divisiMentah !== "kosong" ? Number(divisiMentah) : null;
  const statusAktif = formData.get("status_aktif") === "true";
  const kuotaAwalMentah = String(formData.get("kuota_cuti_awal") ?? "").trim();
  const kuotaAwal = kuotaAwalMentah === "" ? 12 : Number(kuotaAwalMentah);
  const sisaKuotaMentah = String(formData.get("sisa_kuota_cuti") ?? "").trim();
  const sisaKuota =
    sisaKuotaMentah === "" ? kuotaAwal : Number(sisaKuotaMentah);
  const tanggalBergabung = String(formData.get("tanggal_bergabung") || "").trim();
  const kataSandiBaru = String(formData.get("kata_sandi") || "");

  if (!id || !username || !email || !namaLengkap || !peran || !tanggalBergabung) {
    return {
      sukses: false,
      pesan: "Semua kolom wajib tidak boleh kosong.",
    };
  }

  const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!polaEmail.test(email)) {
    return { sukses: false, pesan: "Format email tidak valid." };
  }

  if (!["admin", "karyawan", "ketua_divisi", "hrd"].includes(peran)) {
    return { sukses: false, pesan: "Peran pengguna tidak valid." };
  }

  if (Number.isNaN(kuotaAwal) || kuotaAwal < 0 || kuotaAwal > 30) {
    return {
      sukses: false,
      pesan: "Kuota cuti awal harus antara 0 hingga 30 hari.",
    };
  }

  if (Number.isNaN(sisaKuota) || sisaKuota < 0 || sisaKuota > kuotaAwal) {
    return {
      sukses: false,
      pesan: "Sisa kuota cuti harus antara 0 hingga kuota cuti awal.",
    };
  }

  if (kataSandiBaru && kataSandiBaru.length < 6) {
    return {
      sukses: false,
      pesan: "Kata sandi baru minimal terdiri dari 6 karakter.",
    };
  }

  try {
    await jalankanTransaksi(async (klien) => {
      const cekKetua = await klien.query(
        `SELECT id, nama_divisi FROM divisi WHERE ketua_divisi_id = $1`,
        [id]
      );
      if (cekKetua.rows.length > 0 && (peran !== "ketua_divisi" || !statusAktif)) {
        throw new Error(
          `Pengguna sedang menjabat Ketua Divisi ${cekKetua.rows[0].nama_divisi}. Ubah ketua divisi terlebih dahulu sebelum mengganti peran atau menonaktifkan akun.`
        );
      }

      if (kataSandiBaru) {
        const hashBaru = await buatHashKataSandi(kataSandiBaru);
        await klien.query(
          `UPDATE pengguna
           SET username = $1, email = $2, nama_lengkap = $3, peran = $4,
               divisi_id = $5, status_aktif = $6, kuota_cuti_awal = $7,
               sisa_kuota_cuti = $8, tanggal_bergabung = $9,
               kata_sandi_hash = $10, diperbarui_pada = NOW()
           WHERE id = $11`,
          [
            username,
            email,
            namaLengkap,
            peran,
            divisiId,
            statusAktif,
            kuotaAwal,
            sisaKuota,
            tanggalBergabung,
            hashBaru,
            id,
          ]
        );
      } else {
        await klien.query(
          `UPDATE pengguna
           SET username = $1, email = $2, nama_lengkap = $3, peran = $4,
               divisi_id = $5, status_aktif = $6, kuota_cuti_awal = $7,
               sisa_kuota_cuti = $8, tanggal_bergabung = $9,
               diperbarui_pada = NOW()
           WHERE id = $10`,
          [
            username,
            email,
            namaLengkap,
            peran,
            divisiId,
            statusAktif,
            kuotaAwal,
            sisaKuota,
            tanggalBergabung,
            id,
          ]
        );
      }
    });

    revalidatePath("/manajemen-pengguna");
    revalidatePath("/manajemen-divisi");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: `Data pengguna ${namaLengkap} berhasil diperbarui.`,
    };
  } catch (kesalahan) {
    if (kesalahan.code === "23505") {
      return {
        sukses: false,
        pesan: "Username atau email sudah digunakan pengguna lain.",
      };
    }
    return {
      sukses: false,
      pesan: kesalahan.message || "Gagal memperbarui data pengguna.",
    };
  }
}

export async function resetKuotaTahunanSemua() {
  await wajibSesiPengguna(["admin"]);

  try {
    const hasil = await jalankanKueri(
      `UPDATE pengguna
       SET sisa_kuota_cuti = kuota_cuti_awal, diperbarui_pada = NOW()
       WHERE status_aktif = TRUE`
    );

    revalidatePath("/manajemen-pengguna");
    revalidatePath("/dasbor");
    revalidatePath("/pengajuan-cuti");
    revalidatePath("/profil");

    return {
      sukses: true,
      pesan: `Kuota cuti tahunan berhasil direset untuk ${hasil.rowCount} pengguna aktif.`,
    };
  } catch {
    return {
      sukses: false,
      pesan: "Gagal mereset kuota cuti tahunan.",
    };
  }
}

export async function hapusDataPengguna(idPengguna) {
  const sesi = await wajibSesiPengguna(["admin"]);
  const idTarget = Number(idPengguna);

  if (idTarget === sesi.id) {
    return {
      sukses: false,
      pesan: "Anda tidak dapat menghapus akun Anda sendiri.",
    };
  }

  const hasilTarget = await jalankanKueri(
    `SELECT id, nama_lengkap, peran FROM pengguna WHERE id = $1`,
    [idTarget]
  );

  if (hasilTarget.rows.length === 0) {
    return { sukses: false, pesan: "Pengguna tidak ditemukan." };
  }

  const target = hasilTarget.rows[0];
  if (!["karyawan", "ketua_divisi"].includes(target.peran)) {
    return {
      sukses: false,
      pesan: "Hanya akun dengan peran Karyawan atau Ketua Divisi yang dapat dihapus.",
    };
  }

  try {
    await jalankanTransaksi(async (klien) => {
      await klien.query(
        `UPDATE divisi SET ketua_divisi_id = NULL WHERE ketua_divisi_id = $1`,
        [idTarget]
      );
      await klien.query(`DELETE FROM pengguna WHERE id = $1`, [idTarget]);
    });

    revalidatePath("/manajemen-pengguna");
    revalidatePath("/manajemen-divisi");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: `Pengguna ${target.nama_lengkap} berhasil dihapus.`,
    };
  } catch {
    return {
      sukses: false,
      pesan: "Gagal menghapus data pengguna.",
    };
  }
}
