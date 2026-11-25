"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Camera,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import {
  ubahFotoProfilSendiri,
  ubahProfilSendiri,
} from "@/actions/pengguna-aksi";
import {
  apakahLayakCutiTahunan,
  formatAngkaKuota,
  formatTanggalIndo,
  labelPeranPengguna,
} from "@/lib/kalkulasi-cuti";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function FormulirProfil({ pengguna }) {
  const router = useRouter();
  const [statusAksi, simpanProfil, sedangMenyimpan] = useActionState(
    ubahProfilSendiri,
    null
  );
  const [sedangUnggahFoto, mulaiUnggahFoto] = useTransition();
  const inputFotoRef = useRef(null);
  const [pratinjauFoto, aturPratinjauFoto] = useState(
    pengguna?.foto_profil || ""
  );
  const [galatFoto, aturGalatFoto] = useState("");

  const kuotaAwal = Number(pengguna?.kuota_cuti_awal ?? 12);
  const sisaKuota = Number(pengguna?.sisa_kuota_cuti ?? 0);
  const kuotaTerpakai = Math.max(0, kuotaAwal - sisaKuota);
  const persentaseSisa =
    kuotaAwal > 0 ? Math.min(100, Math.round((sisaKuota / kuotaAwal) * 100)) : 0;
  const layakTahunan = apakahLayakCutiTahunan(pengguna?.tanggal_bergabung);

  function tanganiPilihBerkasFoto(event) {
    const berkas = event.target.files?.[0];
    if (!berkas) return;

    const ekstensiValid = /\.(jpe?g|png|webp)$/i.test(berkas.name || "");
    const tipeValid = ["image/jpeg", "image/png", "image/webp"].includes(
      berkas.type
    );
    if (!ekstensiValid || !tipeValid) {
      aturGalatFoto("Hanya menerima berkas gambar (.jpg, .jpeg, .png, .webp).");
      event.target.value = "";
      return;
    }

    if (berkas.size > 1024 * 1024) {
      aturGalatFoto("Ukuran gambar maksimal 1 MB.");
      event.target.value = "";
      return;
    }
    aturGalatFoto("");
    const fotoSebelumnya = pratinjauFoto;
    const pembaca = new FileReader();
    pembaca.onload = () => {
      if (typeof pembaca.result === "string") {
        const dataUrlBaru = pembaca.result;
        aturPratinjauFoto(dataUrlBaru);
        mulaiUnggahFoto(async () => {
          const hasil = await ubahFotoProfilSendiri(dataUrlBaru);
          if (hasil.sukses) {
            router.refresh();
          } else {
            aturPratinjauFoto(fotoSebelumnya);
            aturGalatFoto(hasil.pesan);
          }
        });
      }
    };
    pembaca.readAsDataURL(berkas);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil &amp; Kuota Cuti</h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi akun pribadi Anda dan pantau sisa kuota cuti tahunan secara langsung.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="items-center text-center pb-3">
              <input
                ref={inputFotoRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="hidden"
                aria-label="Pilih foto profil"
                onChange={tanganiPilihBerkasFoto}
              />
              <button
                type="button"
                disabled={sedangUnggahFoto}
                onClick={() => inputFotoRef.current?.click()}
                className="group relative mx-auto rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                aria-label="Ubah foto profil"
                title="Klik untuk memilih foto profil"
              >
                <Avatar className="size-20 border-2 border-primary/30 transition-opacity group-hover:opacity-85">
                  {pratinjauFoto && (
                    <AvatarImage src={pratinjauFoto} alt={pengguna.nama_lengkap} />
                  )}
                  <AvatarFallback className="bg-primary/15 text-accent-foreground text-xl font-bold">
                    {pengguna.nama_lengkap?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-7 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center shadow-xs">
                  <Camera className="size-3.5" aria-hidden="true" />
                </span>
              </button>
              {sedangUnggahFoto && (
                <p className="text-xs text-muted-foreground mt-2">
                  Menyimpan foto profil...
                </p>
              )}
              {galatFoto && (
                <p role="alert" className="text-xs text-destructive mt-1">
                  {galatFoto}
                </p>
              )}
              <CardTitle className="mt-3 text-lg">{pengguna.nama_lengkap}</CardTitle>
              <CardDescription className="font-mono text-xs">
                @{pengguna.username}
              </CardDescription>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                <Badge className="bg-primary text-primary-foreground">
                  {labelPeranPengguna(pengguna.peran)}
                </Badge>
                {pengguna.nama_divisi && (
                  <Badge variant="outline">{pengguna.nama_divisi}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm pt-2">
              <Separator />
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate text-foreground">{pengguna.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-foreground">{pengguna.telepon || "-"}</span>
              </div>
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span className="text-foreground">{pengguna.alamat || "-"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Shield className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-foreground">
                  Bergabung: {formatTanggalIndo(pengguna.tanggal_bergabung)}
                </span>
              </div>
            </CardContent>
          </Card>

          {(pengguna.peran === "karyawan" ||
            pengguna.peran === "ketua_divisi") && (
            <Card className="border-primary/25 bg-accent/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarCheck className="size-4 text-primary" aria-hidden="true" />
                    Informasi Kuota Tahunan
                  </CardTitle>
                  <Badge variant={layakTahunan ? "default" : "secondary"}>
                    {layakTahunan ? "Memenuhi Syarat" : "Masa Kerja < 1 Thn"}
                  </Badge>
                </div>
                <CardDescription>
                  Diperbarui otomatis setiap pengajuan, pembatalan, atau penolakan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
                  <div className="rounded-lg border bg-background p-2.5">
                    <p className="text-[11px] text-muted-foreground">Kuota Awal</p>
                    <p className="text-lg font-bold">{formatAngkaKuota(kuotaAwal)}</p>
                  </div>
                  <div className="rounded-lg border bg-background p-2.5">
                    <p className="text-[11px] text-muted-foreground">Terpakai</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                      {formatAngkaKuota(kuotaTerpakai)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-background p-2.5 border-primary/40">
                    <p className="text-[11px] text-muted-foreground">Sisa Kuota</p>
                    <p className="text-lg font-bold text-primary">
                      {formatAngkaKuota(sisaKuota)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Ketersediaan Kuota</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {persentaseSisa}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${persentaseSisa}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="size-4 text-primary" aria-hidden="true" />
              Perbarui Data Pribadi
            </CardTitle>
            <CardDescription>
              Anda dapat mengubah nama, foto profil, telepon, alamat, serta kata sandi pribadi. Perubahan peran &amp; kuota diatur oleh Admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusAksi && (
              <Alert
                role="status"
                aria-live="polite"
                variant={statusAksi.sukses ? "default" : "destructive"}
                className={`mb-5 ${
                  statusAksi.sukses
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                    : ""
                }`}
              >
                <AlertDescription>{statusAksi.pesan}</AlertDescription>
              </Alert>
            )}

            <form action={simpanProfil} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                  <Input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    autoComplete="name"
                    defaultValue={pengguna.nama_lengkap}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telepon">Nomor Telepon</Label>
                  <Input
                    id="telepon"
                    name="telepon"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    pattern="[0-9]{12,13}"
                    minLength={12}
                    maxLength={13}
                    title="Nomor HP harus terdiri dari 12–13 digit angka."
                    defaultValue={pengguna.telepon || ""}
                    placeholder="0812xxxxxxxx (12–13 digit)"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/\D/g, "")
                        .slice(0, 13);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_pengguna">Email (Dikelola Admin)</Label>
                  <Input id="email_pengguna" value={pengguna.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username_pengguna">Username (Dikelola Admin)</Label>
                  <Input id="username_pengguna" value={pengguna.username} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat Lengkap</Label>
                <Textarea
                  id="alamat"
                  name="alamat"
                  rows={3}
                  autoComplete="street-address"
                  defaultValue={pengguna.alamat || ""}
                  placeholder="Masukkan alamat tempat tinggal"
                />
              </div>

              <input type="hidden" name="foto_profil" value={pratinjauFoto} />

              <Separator className="my-2" />

              <div className="space-y-4">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-primary" aria-hidden="true" />
                  Ubah Kata Sandi (Opsional)
                </p>
                <div className="space-y-2">
                  <Label htmlFor="kata_sandi_lama">Kata Sandi Lama</Label>
                  <Input
                    id="kata_sandi_lama"
                    name="kata_sandi_lama"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi saat ini"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kata_sandi_baru">Kata Sandi Baru</Label>
                    <Input
                      id="kata_sandi_baru"
                      name="kata_sandi_baru"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      aria-describedby="bantuan-sandi-baru"
                      placeholder="Minimal 6 karakter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="konfirmasi_kata_sandi">
                      Konfirmasi Kata Sandi Baru
                    </Label>
                    <Input
                      id="konfirmasi_kata_sandi"
                      name="konfirmasi_kata_sandi"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="Ulangi kata sandi baru"
                    />
                  </div>
                </div>
                <p id="bantuan-sandi-baru" className="text-xs text-muted-foreground">
                  Kosongkan semua kolom kata sandi jika tidak ingin mengganti.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={sedangMenyimpan}>
                  <Save className="size-4 mr-1.5" aria-hidden="true" />
                  {sedangMenyimpan ? "Menyimpan..." : "Simpan Perubahan Profil"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
