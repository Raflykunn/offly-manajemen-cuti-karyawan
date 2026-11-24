"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "cn"

function Table({
  className,
  ...props
}) {
  const refTabel = React.useRef(null)

  React.useEffect(() => {
    const tabel = refTabel.current
    if (!tabel) return

    const perbaruiLabel = () => {
      const daftarLabel = Array.from(
        tabel.querySelectorAll("thead tr th")
      ).map((th) => th.textContent.replace(/\s+/g, " ").trim())

      const daftarBaris = tabel.querySelectorAll("tbody > tr")
      daftarBaris.forEach((tr) => {
        const selKosong = tr.querySelector("td[colspan]")
        if (selKosong) {
          tr.setAttribute("data-kosong", "true")
          return
        }
        tr.removeAttribute("data-kosong")

        const daftarSel = tr.querySelectorAll(":scope > td")
        daftarSel.forEach((td, indeks) => {
          const label = daftarLabel[indeks] || ""
          td.setAttribute("data-label", label)

          if (indeks === 0) {
            td.setAttribute("data-utama", "true")
          } else {
            td.removeAttribute("data-utama")
          }

          if (label === "Aksi" || label === "Simpan") {
            td.setAttribute("data-aksi", "true")
            if (td.textContent.trim() === "" && td.children.length === 0) {
              td.setAttribute("data-kosong", "true")
            } else {
              td.removeAttribute("data-kosong")
            }
          } else {
            td.removeAttribute("data-aksi")
            td.removeAttribute("data-kosong")
          }
        })
      })
    }

    perbaruiLabel()

    const pengamat = new MutationObserver(perbaruiLabel)
    pengamat.observe(tabel, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => pengamat.disconnect()
  }, [])

  return (
    <div
      data-slot="table-container"
      className="relative w-full md:overflow-x-auto md:rounded-lg md:border md:border-border md:bg-card"
    >
      <table
        ref={refTabel}
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-zinc-200/70 dark:bg-muted/80 [&_tr]:border-b [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border/80 transition-colors even:bg-zinc-100/75 dark:even:bg-muted/25 hover:bg-amber-100/60 dark:hover:bg-accent/40 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-foreground/80 [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function KepalaTabelSortir({
  label,
  nilaiAktif,
  nilaiNaik,
  nilaiTurun,
  saatUbah,
  className,
}) {
  const arah =
    nilaiAktif === nilaiNaik
      ? "ascending"
      : nilaiAktif === nilaiTurun
        ? "descending"
        : undefined
  const Ikon =
    arah === "ascending"
      ? ArrowUp
      : arah === "descending"
        ? ArrowDown
        : ArrowUpDown

  return (
    <TableHead scope="col" aria-sort={arah} className={className}>
      <button
        type="button"
        onClick={() =>
          saatUbah(nilaiTurun && nilaiAktif === nilaiNaik ? nilaiTurun : nilaiNaik)
        }
        className="inline-flex items-center gap-1.5 min-h-6 w-full text-left font-semibold uppercase tracking-wide hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm cursor-pointer"
      >
        <span>{label}</span>
        <Ikon
          aria-hidden="true"
          className={cn(
            "size-3.5 shrink-0",
            arah ? "text-primary" : "text-muted-foreground/70"
          )}
        />
      </button>
    </TableHead>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  KepalaTabelSortir,
  TableRow,
  TableCell,
  TableCaption,
}
