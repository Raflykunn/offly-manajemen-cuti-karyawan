"use server";

import { revalidatePath } from "next/cache";
import { jalankanKueri, jalankanTransaksi } from "@/lib/db";
import { wajibSesiPengguna } from "@/lib/autentikasi";

export async function ambilDaftarDivisi(filter = {}) {
  await wajibSesiPengguna(["admin"]);

  const kondisi = [];
  const parameter = [];

  if (filter.cari && filter.cari.trim()) {
    parameter.push(`%${filter.cari.trim()}%`);
    kondisi.push(
      `(d.nama_divisi ILIKE $${parameter.length} OR k.nama_lengkap ILIKE $${parameter.length})`
    );
  }

  if (filter.ketua_id && filter.ketua_id !== "semua") {
    parameter.push(Number(filter.ketua_id));
    kondisi.push(`d.ketua_divisi_id = $${parameter.length}`);
  }

  const havingKondisi = [];
  if (filter.rentang_anggota === "kosong") {
    havingKondisi.push(`COUNT(p.id) = 0`);
  } else if (filter.rentang_anggota === "kecil") {
    havingKondisi.push(`COUNT(p.id) BETWEEN 1 AND 5`);
  } else if (filter.rentang_anggota === "besar") {
    havingKondisi.push(`COUNT(p.id) > 5`);
  }

  const klausaWhere =
    kondisi.length > 0 ? `WHERE ${kondisi.join(" AND ")}` : "";
  const klausaHaving =
    havingKondisi.length > 0 ? `HAVING ${havingKondisi.join(" AND ")}` : "";

  const petaUrutan = {
    nama_asc: "d.nama_divisi ASC",
    nama_desc: "d.nama_divisi DESC",
    anggota_banyak: "jumlah_anggota DESC, d.nama_divisi ASC",
    anggota_sedikit: "jumlah_anggota ASC, d.nama_divisi ASC",
    tgl_baru: "d.tanggal_dibentuk DESC",
    tgl_lama: "d.tanggal_dibentuk ASC",
  };
  const urutan = petaUrutan[filter.urutkan] || "d.nama_divisi ASC";

  const [hasilDivisi, hasilKandidatKetua, hasilSemuaKetua] = await Promise.all([
    jalankanKueri(
      `SELECT d.id, d.nama_divisi, d.deskripsi, d.ketua_divisi_id,
              d.batas_kapasitas_persen, d.tanggal_dibentuk,
              k.nama_lengkap AS nama_ketua_divisi, k.email AS email_ketua,
              COUNT(p.id)::int AS jumlah_anggota
       FROM divisi d
       LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
       LEFT JOIN pengguna p ON p.divisi_id = d.id
       ${klausaWhere}
       GROUP BY d.id, k.nama_lengkap, k.email
       ${klausaHaving}
       ORDER BY ${urutan}`,
      parameter
    ),
    jalankanKueri(
      `SELECT p.id, p.nama_lengkap, p.email
       FROM pengguna p
       WHERE p.peran = 'ketua_divisi'
         AND p.status_aktif = TRUE
         AND p.id NOT IN (
           SELECT ketua_divisi_id FROM divisi WHERE ketua_divisi_id IS NOT NULL
         )
       ORDER BY p.nama_lengkap ASC`
    ),
    jalankanKueri(
      `SELECT id, nama_lengkap FROM pengguna WHERE peran = 'ketua_divisi' ORDER BY nama_lengkap ASC`
    ),
  ]);

  return {
    daftarDivisi: hasilDivisi.rows.map((baris) => ({
      ...baris,
      tanggal_dibentuk: new Date(baris.tanggal_dibentuk)
        .toISOString()
        .slice(0, 10),
    })),
    kandidatKetuaTersedia: hasilKandidatKetua.rows,
    semuaKetua: hasilSemuaKetua.rows,
  };
}

export async function ambilDetailDivisi(divisiId) {
  await wajibSesiPengguna(["admin"]);
  const id = Number(divisiId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const [hasilDivisi, hasilAnggota, hasilKandidatAnggota] = await Promise.all([
    jalankanKueri(
      `SELECT d.id, d.nama_divisi, d.deskripsi, d.ketua_divisi_id,
              d.batas_kapasitas_persen, d.tanggal_dibentuk,
              k.nama_lengkap AS nama_ketua_divisi, k.email AS email_ketua
       FROM divisi d
       LEFT JOIN pengguna k ON k.id = d.ketua_divisi_id
       WHERE d.id = $1`,
      [id]
    ),
    jalankanKueri(
      `SELECT id, username, email, nama_lengkap, peran, sisa_kuota_cuti,
              tanggal_bergabung, status_aktif
       FROM pengguna
       WHERE divisi_id = $1
       ORDER BY peran DESC, nama_lengkap ASC`,
      [id]
    ),
    jalankanKueri(
      `SELECT p.id, p.nama_lengkap, p.email, p.peran, d.nama_divisi AS nama_divisi_saat_ini
       FROM pengguna p
       LEFT JOIN divisi d ON d.id = p.divisi_id
       WHERE p.peran = 'karyawan'
         AND (p.divisi_id IS NULL OR p.divisi_id <> $1)
       ORDER BY p.nama_lengkap ASC`,
      [id]
    ),
  ]);

  if (hasilDivisi.rows.length === 0) {
    return null;
  }

  return {
    divisi: {
      ...hasilDivisi.rows[0],
      tanggal_dibentuk: new Date(hasilDivisi.rows[0].tanggal_dibentuk)
        .toISOString()
        .slice(0, 10),
    },
    anggota: hasilAnggota.rows.map((baris) => ({
      ...baris,
      sisa_kuota_cuti: Number(baris.sisa_kuota_cuti),
      tanggal_bergabung: new Date(baris.tanggal_bergabung)
        .toISOString()
        .slice(0, 10),
    })),
    kandidatAnggota: hasilKandidatAnggota.rows,
  };
}

export async function buatDivisiBaru(formData) {
  await wajibSesiPengguna(["admin"]);

  const namaDivisi = String(formData.get("nama_divisi") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const ketuaId = Number(formData.get("ketua_divisi_id"));
  const batasKapasitas = Number(formData.get("batas_kapasitas_persen") || 30);

  if (!namaDivisi || !ketuaId) {
    return {
      sukses: false,
      pesan: "Nama divisi dan Ketua Divisi wajib diisi.",
    };
  }

  try {
    await jalankanTransaksi(async (klien) => {
      const cekKetua = await klien.query(
        `SELECT id, peran FROM pengguna WHERE id = $1 AND peran = 'ketua_divisi'`,
        [ketuaId]
      );
      if (cekKetua.rows.length === 0) {
        throw new Error("Kandidat yang dipilih tidak memiliki peran Ketua Divisi.");
      }

      const cekTerikat = await klien.query(
        `SELECT nama_divisi FROM divisi WHERE ketua_divisi_id = $1`,
        [ketuaId]
      );
      if (cekTerikat.rows.length > 0) {
        throw new Error(
          `Ketua divisi ini sudah memimpin divisi ${cekTerikat.rows[0].nama_divisi} dan tidak boleh merangkap.`
        );
      }

      const hasilBuat = await klien.query(
        `INSERT INTO divisi (nama_divisi, deskripsi, ketua_divisi_id, batas_kapasitas_persen, tanggal_dibentuk)
         VALUES ($1, $2, $3, $4, CURRENT_DATE)
         RETURNING id`,
        [namaDivisi, deskripsi || null, ketuaId, batasKapasitas]
      );

      await klien.query(
        `UPDATE pengguna SET divisi_id = $1, diperbarui_pada = NOW() WHERE id = $2`,
        [hasilBuat.rows[0].id, ketuaId]
      );
    });

    revalidatePath("/manajemen-divisi");
    revalidatePath("/manajemen-pengguna");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: `Divisi ${namaDivisi} berhasil dibuat.`,
    };
  } catch (galat) {
    if (galat.code === "23505") {
      return {
        sukses: false,
        pesan: "Nama divisi sudah digunakan atau ketua divisi telah terikat.",
      };
    }
    return {
      sukses: false,
      pesan: galat.message || "Gagal membuat divisi baru.",
    };
  }
}

export async function ubahDataDivisi(formData) {
  await wajibSesiPengguna(["admin"]);

  const id = Number(formData.get("id"));
  const namaDivisi = String(formData.get("nama_divisi") || "").trim();
  const deskripsi = String(formData.get("deskripsi") || "").trim();
  const ketuaBaruId = Number(formData.get("ketua_divisi_id"));
  const batasKapasitas = Number(formData.get("batas_kapasitas_persen") || 30);

  if (!id || !namaDivisi || !ketuaBaruId) {
    return {
      sukses: false,
      pesan: "Nama divisi dan Ketua Divisi wajib diisi.",
    };
  }

  try {
    await jalankanTransaksi(async (klien) => {
      const divisiLamaRes = await klien.query(
        `SELECT ketua_divisi_id FROM divisi WHERE id = $1 FOR UPDATE`,
        [id]
      );
      if (divisiLamaRes.rows.length === 0) {
        throw new Error("Divisi tidak ditemukan.");
      }

      const ketuaLamaId = divisiLamaRes.rows[0].ketua_divisi_id;
      const cekRangkap = await klien.query(
        `SELECT nama_divisi FROM divisi WHERE ketua_divisi_id = $1 AND id <> $2`,
        [ketuaBaruId, id]
      );
      if (cekRangkap.rows.length > 0) {
        throw new Error(
          `Ketua divisi terpilih sudah terikat pada divisi ${cekRangkap.rows[0].nama_divisi}.`
        );
      }

      await klien.query(
        `UPDATE divisi
         SET nama_divisi = $1, deskripsi = $2, ketua_divisi_id = $3,
             batas_kapasitas_persen = $4, diperbarui_pada = NOW()
         WHERE id = $5`,
        [namaDivisi, deskripsi || null, ketuaBaruId, batasKapasitas, id]
      );

      if (ketuaLamaId && ketuaLamaId !== ketuaBaruId) {
        await klien.query(
          `UPDATE pengguna SET divisi_id = NULL, diperbarui_pada = NOW() WHERE id = $1`,
          [ketuaLamaId]
        );
      }

      await klien.query(
        `UPDATE pengguna SET divisi_id = $1, diperbarui_pada = NOW() WHERE id = $2`,
        [id, ketuaBaruId]
      );
    });

    revalidatePath("/manajemen-divisi");
    revalidatePath(`/manajemen-divisi/${id}`);
    revalidatePath("/manajemen-pengguna");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: `Divisi ${namaDivisi} berhasil diperbarui.`,
    };
  } catch (galat) {
    if (galat.code === "23505") {
      return {
        sukses: false,
        pesan: "Nama divisi sudah ada atau ketua divisi merangkap.",
      };
    }
    return {
      sukses: false,
      pesan: galat.message || "Gagal memperbarui divisi.",
    };
  }
}

export async function hapusDivisiDenganKonfirmasi(divisiId, teksKonfirmasi) {
  await wajibSesiPengguna(["admin"]);
  const id = Number(divisiId);

  try {
    const namaTerhapus = await jalankanTransaksi(async (klien) => {
      const hasil = await klien.query(
        `SELECT id, nama_divisi FROM divisi WHERE id = $1 FOR UPDATE`,
        [id]
      );
      if (hasil.rows.length === 0) {
        throw new Error("Divisi tidak ditemukan.");
      }

      const divisi = hasil.rows[0];
      if (
        String(teksKonfirmasi || "").trim().toLowerCase() !==
        divisi.nama_divisi.trim().toLowerCase()
      ) {
        throw new Error(
          `Konfirmasi akhir gagal. Ketik "${divisi.nama_divisi}" secara persis untuk menghapus.`
        );
      }

      await klien.query(
        `UPDATE pengguna SET divisi_id = NULL, diperbarui_pada = NOW() WHERE divisi_id = $1`,
        [id]
      );
      await klien.query(`DELETE FROM divisi WHERE id = $1`, [id]);

      return divisi.nama_divisi;
    });

    revalidatePath("/manajemen-divisi");
    revalidatePath("/manajemen-pengguna");
    revalidatePath("/dasbor");
    return {
      sukses: true,
      pesan: `Divisi ${namaTerhapus} berhasil dihapus dan seluruh anggotanya telah dilepaskan dari divisi.`,
    };
  } catch (galat) {
    return {
      sukses: false,
      pesan: galat.message || "Gagal menghapus divisi.",
    };
  }
}

export async function tambahAnggotaDivisi(divisiId, penggunaId) {
  await wajibSesiPengguna(["admin"]);

  try {
    await jalankanKueri(
      `UPDATE pengguna SET divisi_id = $1, diperbarui_pada = NOW() WHERE id = $2 AND peran = 'karyawan'`,
      [Number(divisiId), Number(penggunaId)]
    );

    revalidatePath(`/manajemen-divisi/${divisiId}`);
    revalidatePath("/manajemen-divisi");
    revalidatePath("/manajemen-pengguna");
    return {
      sukses: true,
      pesan: "Karyawan berhasil ditambahkan ke divisi.",
    };
  } catch {
    return {
      sukses: false,
      pesan: "Gagal menambahkan anggota ke divisi.",
    };
  }
}

export async function keluarkanAnggotaDivisi(divisiId, penggunaId) {
  await wajibSesiPengguna(["admin"]);

  try {
    const cekKetua = await jalankanKueri(
      `SELECT id FROM divisi WHERE id = $1 AND ketua_divisi_id = $2`,
      [Number(divisiId), Number(penggunaId)]
    );
    if (cekKetua.rows.length > 0) {
      return {
        sukses: false,
        pesan: "Ketua divisi tidak dapat dikeluarkan dari anggota tanpa mengganti ketua divisi terlebih dahulu.",
      };
    }

    await jalankanKueri(
      `UPDATE pengguna SET divisi_id = NULL, diperbarui_pada = NOW() WHERE id = $1 AND divisi_id = $2`,
      [Number(penggunaId), Number(divisiId)]
    );

    revalidatePath(`/manajemen-divisi/${divisiId}`);
    revalidatePath("/manajemen-divisi");
    revalidatePath("/manajemen-pengguna");
    return {
      sukses: true,
      pesan: "Anggota berhasil dikeluarkan dari divisi tanpa menghapus akun.",
    };
  } catch {
    return {
      sukses: false,
      pesan: "Gagal mengeluarkan anggota dari divisi.",
    };
  }
}
