import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fontJetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Offly — Sistem Manajemen Cuti Karyawan",
  description:
    "Platform manajemen pengajuan, verifikasi berjenjang, dan persetujuan cuti karyawan.",
};

export default function TataLetakAkar({ children }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${fontInter.variable} ${fontJetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('offly-tema');var m=document.querySelector('meta[name=\"color-scheme\"]');if(t==='dark'){document.documentElement.classList.add('dark');if(m)m.setAttribute('content','dark');}else if(t==='light'){if(m)m.setAttribute('content','light');}}catch{}",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
