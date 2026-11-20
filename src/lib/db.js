import { Pool } from "pg";

const globalUntukPg = globalThis;

export function dapatkanPool() {
  if (!globalUntukPg.__offlyPool) {
    const stringKoneksi = process.env.DATABASE_URL;
    if (!stringKoneksi) {
      throw new Error(
        "Variabel lingkungan DATABASE_URL belum diatur pada berkas .env"
      );
    }
    globalUntukPg.__offlyPool = new Pool({
      connectionString: stringKoneksi,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalUntukPg.__offlyPool;
}

export async function jalankanKueri(teksKueri, parameter = []) {
  const pool = dapatkanPool();
  return pool.query(teksKueri, parameter);
}

export async function jalankanTransaksi(fungsiCallback) {
  const pool = dapatkanPool();
  const klien = await pool.connect();
  try {
    await klien.query("BEGIN");
    const hasil = await fungsiCallback(klien);
    await klien.query("COMMIT");
    return hasil;
  } catch (galat) {
    await klien.query("ROLLBACK");
    throw galat;
  } finally {
    klien.release();
  }
}
