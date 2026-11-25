"use client";

import TampilanKesalahanServer from "@/components/tata-letak/TampilanKesalahanServer";

export default function HalamanKesalahan({ error, reset }) {
  return <TampilanKesalahanServer error={error} reset={reset} />;
}
