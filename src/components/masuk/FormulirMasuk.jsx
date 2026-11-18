"use client";

import { useActionState, useState } from "react";
import {
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { masukAkun } from "@/actions/autentikasi-aksi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const AKUN_DEMO = [
  { peran: "Admin", identitas: "admin@offly.id", sandi: "password123" },
  { peran: "HRD", identitas: "hrd@offly.id", sandi: "password123" },
  { peran: "Ketua Divisi", identitas: "budi.ketua@offly.id", sandi: "password123" },
  { peran: "Karyawan", identitas: "rafly@offly.id", sandi: "password123" },
];

export default function FormulirMasuk() {
  const [statusAksi, jalankanMasuk, sedangMemproses] = useActionState(
    masukAkun,
    null
  );
  const [identitas, aturIdentitas] = useState("");
  const [kataSandi, aturKataSandi] = useState("");
  const [tampilkanSandi, aturTampilkanSandi] = useState(false);
  const [ingatSaya, aturIngatSaya] = useState(true);

  function isiAkunDemo(akun) {
    aturIdentitas(akun.identitas);
    aturKataSandi(akun.sandi);
  }

  return (
    <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 rounded-xl border bg-card p-6 md:p-8 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <CalendarCheck2 className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Offly</h1>
                <p className="text-xs text-muted-foreground">
                  Sistem Manajemen Cuti Karyawan
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Badge variant="secondary" className="bg-accent text-accent-foreground border border-primary/20">
                <Sparkles className="size-3 mr-1" />
                Alur Persetujuan Terotomasi
              </Badge>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
                Kelola pengajuan, kuota, dan persetujuan cuti tim dalam satu tempat.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dirancang untuk Karyawan, Ketua Divisi, HRD, dan Admin dengan deteksi peran otomatis, simulasi kuota real-time, serta penerbitan surat cuti resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <UserCheck className="size-4 text-primary" />
                  Verifikasi Berjenjang
                </div>
                <p className="text-xs text-muted-foreground">
                  Karyawan → Ketua Divisi → HRD, atau langsung Ketua Divisi → HRD.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  Kapasitas &amp; Blackout
                </div>
                <p className="text-xs text-muted-foreground">
                  Validasi otomatis hari kerja, 0.5 hari, dan batas kapasitas divisi.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" />4 Peran Terintegrasi
            </span>
            <span>PostgreSQL + Next.js App Router</span>
          </div>
        </div>

        <Card className="lg:col-span-6 shadow-sm flex flex-col justify-center">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Masuk ke Akun Anda
            </CardTitle>
            <CardDescription>
              Masukkan email atau username. Peran pengguna akan terdeteksi secara otomatis setelah masuk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {statusAksi && !statusAksi.sukses && (
              <Alert variant="destructive">
                <AlertDescription>{statusAksi.pesan}</AlertDescription>
              </Alert>
            )}

            <form action={jalankanMasuk} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identitas">Email atau Username</Label>
                <div className="relative">
                  <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="identitas"
                    name="identitas"
                    type="text"
                    placeholder="nama@offly.id atau username"
                    value={identitas}
                    onChange={(e) => aturIdentitas(e.target.value)}
                    className="pl-9 h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kata_sandi">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="kata_sandi"
                    name="kata_sandi"
                    type={tampilkanSandi ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={kataSandi}
                    onChange={(e) => aturKataSandi(e.target.value)}
                    className="pl-9 pr-9 h-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => aturTampilkanSandi(!tampilkanSandi)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Ubah tampilan kata sandi"
                  >
                    {tampilkanSandi ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox
                    checked={ingatSaya}
                    onCheckedChange={(nilai) => aturIngatSaya(Boolean(nilai))}
                  />
                  <input
                    type="hidden"
                    name="ingat_saya"
                    value={ingatSaya ? "on" : ""}
                  />
                  <span className="text-muted-foreground">
                    Ingat Saya (Remember Me)
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-9 font-medium"
                disabled={sedangMemproses}
              >
                <LogIn className="size-4 mr-1.5" />
                {sedangMemproses ? "Memeriksa Akun..." : "Masuk ke Offly"}
              </Button>
            </form>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Akun Uji Cepat
                </span>
                <Separator className="flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {AKUN_DEMO.map((akun) => (
                  <Button
                    key={akun.peran}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => isiAkunDemo(akun)}
                    className="justify-start text-xs h-8"
                  >
                    <span className="truncate">
                      {akun.peran}: {akun.identitas.split("@")[0]}
                    </span>
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-center text-muted-foreground">
                Kata sandi seluruh akun uji awal: <code className="font-mono font-semibold">password123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
