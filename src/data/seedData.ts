import type { Testimonial } from "@/store"
import type { StoredArticle, ArticleSection } from "@/data/articles"

export const seedTestimonials: Testimonial[] = [
  {
    id: "seed-1",
    name: "Ahmad Rizki Pratama",
    role: "Aviation Security - Bandara Soekarno-Hatta",
    text: "Diklat di Aero Forte Indonesia sangat berkualitas. Instruktur berpengalaman dan fasilitas lengkap membuat saya siap terjun ke dunia keamanan penerbangan.",
    avatar: "AR",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    name: "Siti Nurhaliza",
    role: "Screener AVSEC - Bandara Radin Inten II",
    text: "Proses lisensi cepat dan biaya terjangkau. Saya bisa langsung bekerja setelah lulus diklat. Terima kasih Aero Forte Indonesia!",
    avatar: "SN",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    name: "Budi Santoso",
    role: "Supervisor AVSEC - Bandara Juanda",
    text: "Dari Awal/Guard sampai SVP/Supervisor, semua program diklatnya berkualitas. Materi up-to-date dan praktik langsung dengan peralatan lengkap.",
    avatar: "BS",
    rating: 5,
    createdAt: new Date().toISOString(),
  },
]

const articleSections1: ArticleSection[] = [
  { type: "heading", text: "Apa Itu AVSEC?" },
  { type: "paragraph", text: "AVSEC (Aviation Security) adalah unit keamanan penerbangan yang bertugas melindungi penumpang, awak pesawat, pesawat, dan fasilitas bandara dari ancaman keamanan. Personel AVSEC merupakan garda terdepan dalam menjaga keamanan dan keselamatan di dunia penerbangan." },
  { type: "heading", text: "Tugas dan Tanggung Jawab" },
  { type: "list", items: ["Melakukan pemeriksaan keamanan terhadap penumpang dan bagasi", "Mengawasi area steril dan non-steril di bandara", "Mencegah dan menangani insiden keamanan", "Melakukan screening terhadap barang bawaan", "Bekerja sama dengan pihak berwenang terkait"] },
  { type: "heading", text: "Cara Menjadi Personel AVSEC" },
  { type: "paragraph", text: "Untuk menjadi personel AVSEC yang bersertifikat, Anda harus mengikuti diklat di lembaga pendidikan resmi yang terlisensi KEMENHUB. Setelah lulus, Anda akan mendapatkan lisensi resmi yang diakui di seluruh bandara di Indonesia." },
  { type: "quote", text: "AVSEC bukan sekadar pekerjaan, tapi pengabdian untuk keamanan bangsa di udara." },
]

const articleSections2: ArticleSection[] = [
  { type: "heading", text: "Peluang Karier yang Luas" },
  { type: "paragraph", text: "Indonesia memiliki ratusan bandara aktif yang masing-masing membutuhkan personel AVSEC. Dengan lisensi resmi, Anda dapat bekerja di bandara-bandara nasional maupun internasional di seluruh Indonesia." },
  { type: "heading", text: "Jenjang Karier AVSEC" },
  { type: "list", items: ["Awal/Guard AVSEC — posisi awal sebagai pengamanan penerbangan", "Skriner AVSEC — operator alat screening", "SVP/Supervisor AVSEC — supervisi operasional keamanan", "Instruktur AVSEC — mengajar dan melatih personel baru"] },
  { type: "heading", text: "Gaji dan Tunjangan" },
  { type: "paragraph", text: "Personel AVSEC mendapatkan penghasilan yang kompetitif dengan tunjangan transport, makan, dan kesehatan. Semakin tinggi jenjang lisensi, semakin baik pula kompensasi yang diterima." },
]

const articleSections3: ArticleSection[] = [
  { type: "heading", text: "Persiapan Fisik" },
  { type: "paragraph", text: "Pastikan kondisi fisik Anda dalam keadaan prima. Pemeriksaan kesehatan meliputi tes buta warna, pendengaran, dan kesehatan jasmani rohani. Mulai menjaga stamina sebelum diklat dimulai." },
  { type: "heading", text: "Persiapan Dokumen" },
  { type: "list", items: ["KTP dan ijazah asli", "SKCK yang masih berlaku", "Surat keterangan sehat dari dokter", "Surat keterangan bebas narkoba"] },
  { type: "heading", text: "Mental dan Motivasi" },
  { type: "paragraph", text: "Diklat AVSEC membutuhkan fokus dan disiplin. Siapkan mental untuk mengikuti pelatihan intensif selama satu bulan penuh. Ingat tujuan akhir Anda: lisensi resmi dan karier di dunia penerbangan." },
  { type: "quote", text: "Persiapan adalah kunci keberhasilan. Mulailah dari sekarang." },
]

export const seedArticles: StoredArticle[] = [
  {
    id: "seed-art-1",
    slug: "apa-itu-avsec-panduan-lengkap",
    title: "Apa Itu AVSEC? Panduan Lengkap Keamanan Penerbangan",
    date: "10 September 2026",
    category: "Edukasi",
    image: "/image copy 3.jpg",
    excerpt: "Mengenal lebih dekat profesi Aviation Security, peran pentingnya di bandara, dan bagaimana cara menjadi personel AVSEC bersertifikat resmi.",
    sections: articleSections1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-art-2",
    slug: "peluang-karier-avsec-di-indonesia",
    title: "Peluang Karier AVSEC di Indonesia yang Menjanjikan",
    date: "5 September 2026",
    category: "Karier",
    image: "/image copy 3.jpg",
    excerpt: "Industri penerbangan Indonesia terus berkembang, dan kebutuhan akan personel AVSEC bersertifikat semakin meningkat setiap tahunnya.",
    sections: articleSections2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-art-3",
    slug: "tips-persiapan-diklat-avsec",
    title: "Tips Persiapan Diklat AVSEC untuk Pemula",
    date: "1 September 2026",
    category: "Tips",
    image: "/image copy 3.jpg",
    excerpt: "Persiapan matang sebelum mengikuti diklat AVSEC akan membantu Anda lulus dengan hasil terbaik. Berikut tipsnya.",
    sections: articleSections3,
    createdAt: new Date().toISOString(),
  },
]

const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

export function getFallbackRegistration(): { month: string; year: number } {
  const now = new Date()
  const day = now.getDate()

  if (day <= 25) {
    return {
      month: MONTH_NAMES_ID[now.getMonth()],
      year: now.getFullYear(),
    }
  }

  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return {
    month: MONTH_NAMES_ID[nextMonth.getMonth()],
    year: nextMonth.getFullYear(),
  }
}
