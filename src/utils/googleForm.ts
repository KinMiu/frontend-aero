import type { Student } from "@/store"

const GOOGLE_FORM_BASE =
  "https://docs.google.com/forms/d/e/1FAIpQLSe2rHkl2i3rlllRUrvj9gdCofTOIJJI-ZEalFmpTZS7agqB3Q/viewform"

const FORM_ENTRIES = {
  pilihanKelas: "entry.334465567",
  nama: "entry.713303293",
  noKtp: "entry.1061738437",
  tempatLahir: "entry.1934962697",
  tanggalLahir_year: "entry.1483891593_year",
  tanggalLahir_month: "entry.1483891593_month",
  tanggalLahir_day: "entry.1483891593_day",
  alamat: "entry.2084692434",
  kodePos: "entry.1514365427",
  email: "entry.124827448",
  noHp: "entry.489321488",
  tinggiBadan: "entry.122780676",
  beratBadan: "entry.1340086136",
  namaSD: "entry.1907326249",
  tahunLulusSD: "entry.649753534",
  namaSMP: "entry.236631725",
  tahunLulusSMP: "entry.484196752",
  namaSMA: "entry.1560701451",
  tahunLulusSMA: "entry.324840941",
  perguruanTinggiDiploma: "entry.1312896515",
  tahunLulusDiploma: "entry.719009621",
  perguruanTinggiS1: "entry.233330635",
  namaAyah: "entry.1752113802",
  tempatTanggalLahirAyah: "entry.2060326049",
  namaIbu: "entry.1024227842",
  tempatTanggalLahirIbu: "entry.573030138",
} as const

export function buildGoogleFormUrl(s: Student): string {
  const params = new URLSearchParams()
  params.set(FORM_ENTRIES.pilihanKelas, s.pilihanKelas)
  params.set(FORM_ENTRIES.nama, s.nama.trim())
  params.set(FORM_ENTRIES.noKtp, s.noKtp.trim())
  params.set(FORM_ENTRIES.tempatLahir, s.tempatLahir.trim())
  if (s.tanggalLahir) {
    const [year, month, day] = s.tanggalLahir.split("-")
    params.set(FORM_ENTRIES.tanggalLahir_year, year)
    params.set(FORM_ENTRIES.tanggalLahir_month, String(Number(month)))
    params.set(FORM_ENTRIES.tanggalLahir_day, String(Number(day)))
  }
  params.set(FORM_ENTRIES.alamat, s.alamat.trim())
  params.set(FORM_ENTRIES.kodePos, s.kodePos.trim())
  params.set(FORM_ENTRIES.email, s.email.trim())
  params.set(FORM_ENTRIES.noHp, s.noHp.trim())
  params.set(FORM_ENTRIES.tinggiBadan, s.tinggiBadan.trim())
  params.set(FORM_ENTRIES.beratBadan, s.beratBadan.trim())
  params.set(FORM_ENTRIES.namaSD, s.namaSD.trim())
  params.set(FORM_ENTRIES.tahunLulusSD, s.tahunLulusSD.trim())
  params.set(FORM_ENTRIES.namaSMP, s.namaSMP.trim())
  params.set(FORM_ENTRIES.tahunLulusSMP, s.tahunLulusSMP.trim())
  params.set(FORM_ENTRIES.namaSMA, s.namaSMA.trim())
  params.set(FORM_ENTRIES.tahunLulusSMA, s.tahunLulusSMA.trim())
  if (s.perguruanTinggiDiploma?.trim()) params.set(FORM_ENTRIES.perguruanTinggiDiploma, s.perguruanTinggiDiploma.trim())
  if (s.tahunLulusDiploma?.trim()) params.set(FORM_ENTRIES.tahunLulusDiploma, s.tahunLulusDiploma.trim())
  if (s.perguruanTinggiS1?.trim()) params.set(FORM_ENTRIES.perguruanTinggiS1, s.perguruanTinggiS1.trim())
  params.set(FORM_ENTRIES.namaAyah, s.namaAyah.trim())
  params.set(FORM_ENTRIES.tempatTanggalLahirAyah, s.tempatTanggalLahirAyah.trim())
  params.set(FORM_ENTRIES.namaIbu, s.namaIbu.trim())
  params.set(FORM_ENTRIES.tempatTanggalLahirIbu, s.tempatTanggalLahirIbu.trim())

  return `${GOOGLE_FORM_BASE}?${params.toString()}`
}
