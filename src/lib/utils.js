import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function gabungKelas(...masukan) {
  return twMerge(clsx(masukan));
}

export { gabungKelas as cn };
