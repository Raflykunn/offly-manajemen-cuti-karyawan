"use client";

import { useActionState, useState } from "react";
import {
  CalendarCheck,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { ubahProfilSendiri } from "@/actions/pengguna-aksi";
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
  const [statusAksi, simpanProfil, sedangMenyimpan] = useActionState(
    ubahProfilSendiri,
    null
  );
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
    if (berkas.size > 1024 * 1024) {
      aturGalatFoto("Ukuran gambar maksimal 1 MB.");
      event.target.value = "";
      return;
    }
    aturGalatFoto("");
    const pembaca = new FileReader();
    pembaca.onload = () => {
      if (typeof pembaca.result === "string") {
        aturPratinjauFoto(pembaca.result);
      }
    };
    pembaca.readAsDataURL(berkas);
  }

  const fotoDariUnggahanLokal = pratinjauFoto.startsWith("data:");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil &amp; Kuota Cuti</h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi akun pribadi Anda dan pantau sisa kuota cuti tahunan secara real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader className="items-center text-center pb-3">
              <Avatar className="size-20 mx-auto border-2 border-primary/30">
                {pratinjauFoto && (
                  <AvatarImage src={pratinjauFoto} alt={pengguna.nama_lengkap} />
                )}
                <AvatarFallback className="bg-primary/15 text-accent-foreground text-xl font-bold">
                  {pengguna.nama_lengkap?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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

          <Card className="border-primary/25 bg-accent/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarCheck className="size-4 text-primary" aria-hidden="true" />
                  Informasi Kuota Tahunan
                </CardTitle>
                <Badge variant={layakTahunan ? "default" : "secondary"}>
                  {layakTahunan ? "Eligible" : "Masa Kerja < 1 Thn"}
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
                    autoComplete="tel"
                    defaultValue={pengguna.telepon || ""}
                    placeholder="0812xxxxxxxx"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foto_profil_url">URL Foto Profil (Opsional)</Label>
                  <input type="hidden" name="foto_profil" value={pratinjauFoto} />
                  <Input
                    id="foto_profil_url"
                    type="url"
                    value={fotoDariUnggahanLokal ? "" : pratinjauFoto}
                    onChange={(e) => {
                      aturGalatFoto("");
                      aturPratinjauFoto(e.target.value);
                    }}
                    placeholder={
                      fotoDariUnggahanLokal
                        ? "Gambar lokal dipilih (siap disimpan)"
                        : "https://... atau pilih file gambar"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unggah_foto_lokal">Atau Pilih Gambar Lokal (&le; 1 MB)</Label>
                  <Input
                    id="unggah_foto_lokal"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-invalid={galatFoto ? "true" : undefined}
                    aria-describedby={galatFoto ? "galat-foto-lokal" : undefined}
                    onChange={tanganiPilihBerkasFoto}
                  />
                  {galatFoto && (
                    <p id="galat-foto-lokal" role="alert" className="text-xs text-destructive">
                      {galatFoto}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="my-2" />

              <div className="space-y-2">
                <Label
                  htmlFor="kata_sandi_baru"
                  className="flex items-center gap-1.5"
                >
                  <KeyRound className="size-3.5 text-primary" aria-hidden="true" />
                  Kata Sandi Baru (Kosongkan jika tidak ingin mengganti)
                </Label>
                <Input
                  id="kata_sandi_baru"
                  name="kata_sandi_baru"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  aria-describedby="bantuan-sandi-baru"
                  placeholder="Minimal 6 karakter"
                />
                <p id="bantuan-sandi-baru" className="text-xs text-muted-foreground">
                  Gunakan minimal 6 karakter bila ingin mengganti kata sandi.
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
