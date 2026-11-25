"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
} from "lucide-react";
import { masukAkun } from "@/actions/autentikasi-aksi";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export default function FormulirMasuk() {
  const [statusAksi, jalankanMasuk, sedangMemproses] = useActionState(
    masukAkun,
    null
  );
  const [identitas, aturIdentitas] = useState("");
  const [kataSandi, aturKataSandi] = useState("");
  const [tampilkanSandi, aturTampilkanSandi] = useState(false);
  const [ingatSaya, aturIngatSaya] = useState(false);

  return (
    <div className="min-h-dvh w-full bg-background flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="hidden lg:col-span-6 rounded-xl border border-primary/80 bg-primary text-primary-foreground p-8 md:p-10 lg:flex flex-col justify-end shadow-md">
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 rounded-lg">
              <div className="size-11 rounded-lg bg-primary-foreground/15 border border-primary-foreground/25 text-primary-foreground flex items-center justify-center shadow-xs">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight block">Offly</span>
                <span className="text-sm text-primary-foreground/90 block">
                  Sistem Manajemen Cuti Karyawan
                </span>
              </div>
            </Link>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">
              Satu pintu pengajuan,
              <br />
              saldo, dan persetujuan cuti tim.
            </h2>
          </div>
        </div>

        <Card className="lg:col-span-6 shadow-xs flex flex-col justify-center">
          <CardHeader className="space-y-1">
            <CardTitle render={<h1 />} className="text-2xl font-semibold tracking-tight">
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
                  <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <Input
                    id="identitas"
                    name="identitas"
                    type="text"
                    autoComplete="username"
                    placeholder="nama@offly.id atau username"
                    autoFocus
                    value={identitas}
                    onChange={(e) => aturIdentitas(e.target.value)}
                    className="pl-9 h-10 md:h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kata_sandi">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <Input
                    id="kata_sandi"
                    name="kata_sandi"
                    type={tampilkanSandi ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    value={kataSandi}
                    onChange={(e) => aturKataSandi(e.target.value)}
                    className="pl-9 pr-11 md:pr-9 h-10 md:h-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => aturTampilkanSandi(!tampilkanSandi)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 size-11 md:size-9 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={tampilkanSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {tampilkanSandi ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
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
                    Tetap masuk di perangkat ini
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 font-medium"
                disabled={sedangMemproses}
              >
                <LogIn className="size-4 mr-1.5" />
                {sedangMemproses ? "Memeriksa Akun..." : "Masuk ke Offly"}
              </Button>
            </form>

            <div className="text-center pt-1">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
