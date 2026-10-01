import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Text,
  VStack,
  Stack,
  Badge,
  Spinner,
  Separator,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select"
import { toaster, Toaster } from "@/components/ui/toaster"
import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  LuChevronRight,
  LuChevronLeft,
  LuCircleCheck,
  LuUser,
  LuGraduationCap,
  LuUsers,
  LuClipboardList,
} from "react-icons/lu"
import { addStudent, getActiveRegistration, KELAS_OPTIONS, type KelasOption, type OpenRegistration } from "@/store"
import { getFallbackRegistration } from "@/data/seedData"

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

function buildGoogleFormUrl(data: FormState): string {
  const params = new URLSearchParams()
  params.set(FORM_ENTRIES.pilihanKelas, data.pilihanKelas)
  params.set(FORM_ENTRIES.nama, data.nama.trim())
  params.set(FORM_ENTRIES.noKtp, data.noKtp.trim())
  params.set(FORM_ENTRIES.tempatLahir, data.tempatLahir.trim())
  if (data.tanggalLahir) {
    const [year, month, day] = data.tanggalLahir.split("-")
    params.set(FORM_ENTRIES.tanggalLahir_year, year)
    params.set(FORM_ENTRIES.tanggalLahir_month, String(Number(month)))
    params.set(FORM_ENTRIES.tanggalLahir_day, String(Number(day)))
  }
  params.set(FORM_ENTRIES.alamat, data.alamat.trim())
  params.set(FORM_ENTRIES.kodePos, data.kodePos.trim())
  params.set(FORM_ENTRIES.email, data.email.trim())
  params.set(FORM_ENTRIES.noHp, data.noHp.trim())
  params.set(FORM_ENTRIES.tinggiBadan, data.tinggiBadan.trim())
  params.set(FORM_ENTRIES.beratBadan, data.beratBadan.trim())
  params.set(FORM_ENTRIES.namaSD, data.namaSD.trim())
  params.set(FORM_ENTRIES.tahunLulusSD, data.tahunLulusSD.trim())
  params.set(FORM_ENTRIES.namaSMP, data.namaSMP.trim())
  params.set(FORM_ENTRIES.tahunLulusSMP, data.tahunLulusSMP.trim())
  params.set(FORM_ENTRIES.namaSMA, data.namaSMA.trim())
  params.set(FORM_ENTRIES.tahunLulusSMA, data.tahunLulusSMA.trim())
  if (data.perguruanTinggiDiploma.trim()) params.set(FORM_ENTRIES.perguruanTinggiDiploma, data.perguruanTinggiDiploma.trim())
  if (data.tahunLulusDiploma.trim()) params.set(FORM_ENTRIES.tahunLulusDiploma, data.tahunLulusDiploma.trim())
  if (data.perguruanTinggiS1.trim()) params.set(FORM_ENTRIES.perguruanTinggiS1, data.perguruanTinggiS1.trim())
  params.set(FORM_ENTRIES.namaAyah, data.namaAyah.trim())
  params.set(FORM_ENTRIES.tempatTanggalLahirAyah, data.tempatTanggalLahirAyah.trim())
  params.set(FORM_ENTRIES.namaIbu, data.namaIbu.trim())
  params.set(FORM_ENTRIES.tempatTanggalLahirIbu, data.tempatTanggalLahirIbu.trim())

  return `${GOOGLE_FORM_BASE}?${params.toString()}`
}

interface FormState {
  pilihanKelas: string
  nama: string
  noKtp: string
  tempatLahir: string
  tanggalLahir: string
  alamat: string
  kodePos: string
  email: string
  noHp: string
  tinggiBadan: string
  beratBadan: string
  namaSD: string
  tahunLulusSD: string
  namaSMP: string
  tahunLulusSMP: string
  namaSMA: string
  tahunLulusSMA: string
  perguruanTinggiDiploma: string
  tahunLulusDiploma: string
  perguruanTinggiS1: string
  namaAyah: string
  tempatTanggalLahirAyah: string
  namaIbu: string
  tempatTanggalLahirIbu: string
}

const initialForm: FormState = {
  pilihanKelas: "",
  nama: "",
  noKtp: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  kodePos: "",
  email: "",
  noHp: "",
  tinggiBadan: "",
  beratBadan: "",
  namaSD: "",
  tahunLulusSD: "",
  namaSMP: "",
  tahunLulusSMP: "",
  namaSMA: "",
  tahunLulusSMA: "",
  perguruanTinggiDiploma: "",
  tahunLulusDiploma: "",
  perguruanTinggiS1: "",
  namaAyah: "",
  tempatTanggalLahirAyah: "",
  namaIbu: "",
  tempatTanggalLahirIbu: "",
}

const STEPS = [
  { title: "Pilih Kelas", icon: LuClipboardList },
  { title: "Data Diri", icon: LuUser },
  { title: "Pendidikan", icon: LuGraduationCap },
  { title: "Data Orang Tua", icon: LuUsers },
]

function NavBar({ onBack }: { onBack: () => void }) {
  return (
    <Box
      as="nav"
      position="sticky"
      top="0"
      zIndex="banner"
      bg="white"
      borderBottomWidth="1px"
      borderBottomColor="gray.100"
      shadow="sm"
    >
      <Container maxW="6xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <HStack gap="3" cursor="pointer" onClick={onBack}>
            <Image src="/logo.png" h="12" w="12" objectFit="contain" alt="Logo" />
            <Text fontWeight="bold" fontSize="md" color="gray.800" display={{ base: "none", sm: "block" }}>
              AERO FORTE INDONESIA
            </Text>
          </HStack>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Icon><LuChevronLeft /></Icon>
            Kembali ke Beranda
          </Button>
        </Flex>
      </Container>
    </Box>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <HStack gap="2" w="full" flexWrap={{ base: "wrap", sm: "nowrap" }}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <HStack gap="2" flexShrink={0}>
            <Box
              w="9"
              h="9"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={i < current ? "green.500" : i === current ? "blue.600" : "gray.200"}
              color={i <= current ? "white" : "gray.500"}
              transition="all 0.3s"
            >
              {i < current ? (
                <Icon fontSize="sm"><LuCircleCheck /></Icon>
              ) : (
                <Text fontSize="xs" fontWeight="bold">{i + 1}</Text>
              )}
            </Box>
            <Text
              fontSize="xs"
              fontWeight={i === current ? "bold" : "medium"}
              color={i <= current ? "gray.800" : "gray.400"}
              display={{ base: "none", md: "block" }}
            >
              {STEPS[i].title}
            </Text>
          </HStack>
          {i < total - 1 && (
            <Box
              h="2px"
              flex="1"
              minW={{ base: "12px", sm: "20px" }}
              bg={i < current ? "green.500" : "gray.200"}
              borderRadius="full"
              transition="all 0.3s"
            />
          )}
        </React.Fragment>
      ))}
    </HStack>
  )
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" overflow="hidden" shadow="sm">
      <HStack gap="3" px="6" py="4" bg="gray.50" borderBottomWidth="1px" borderColor="gray.200">
        <Box
          w="10"
          h="10"
          bg="blue.100"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon fontSize="lg" color="blue.600">{icon}</Icon>
        </Box>
        <Heading fontSize="md" fontWeight="bold" color="gray.800">{title}</Heading>
      </HStack>
      <Box p="6">{children}</Box>
    </Box>
  )
}

export default function RegistrationPage() {
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)
  const [form, setForm] = React.useState<FormState>(initialForm)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const [loading, setLoading] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [activeReg, setActiveReg] = React.useState<OpenRegistration | null>(null)

  React.useEffect(() => {
    getActiveRegistration()
      .then(setActiveReg)
      .catch(() => {
        const fb = getFallbackRegistration()
        setActiveReg({ id: "fallback", month: fb.month, year: fb.year, createdAt: new Date().toISOString() })
      })
  }, [])

  const angkatanLabel = activeReg ? `Angkatan ${activeReg.month} ${activeReg.year}` : ""

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateStep = (s: number): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}

    if (s === 0) {
      if (!form.pilihanKelas) e.pilihanKelas = "Pilih kelas terlebih dahulu"
    }
    if (s === 1) {
      if (!form.nama.trim()) e.nama = "Nama tidak boleh kosong"
      if (!form.noKtp.trim()) e.noKtp = "No. KTP tidak boleh kosong"
      else if (form.noKtp.replace(/\D/g, "").length < 16) e.noKtp = "No. KTP harus 16 digit"
      if (!form.tempatLahir.trim()) e.tempatLahir = "Tempat lahir tidak boleh kosong"
      if (!form.tanggalLahir) e.tanggalLahir = "Tanggal lahir tidak boleh kosong"
      if (!form.alamat.trim()) e.alamat = "Alamat tidak boleh kosong"
      if (!form.kodePos.trim()) e.kodePos = "Kode pos tidak boleh kosong"
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email tidak valid"
      if (!form.noHp.trim() || form.noHp.replace(/\D/g, "").length < 8) e.noHp = "No. HP tidak valid"
      if (!form.tinggiBadan.trim()) e.tinggiBadan = "Tinggi badan tidak boleh kosong"
      if (!form.beratBadan.trim()) e.beratBadan = "Berat badan tidak boleh kosong"
    }
    if (s === 2) {
      if (!form.namaSD.trim()) e.namaSD = "Nama SD tidak boleh kosong"
      if (!form.tahunLulusSD.trim()) e.tahunLulusSD = "Tahun lulus SD tidak boleh kosong"
      if (!form.namaSMP.trim()) e.namaSMP = "Nama SMP tidak boleh kosong"
      if (!form.tahunLulusSMP.trim()) e.tahunLulusSMP = "Tahun lulus SMP tidak boleh kosong"
      if (!form.namaSMA.trim()) e.namaSMA = "Nama SMA tidak boleh kosong"
      if (!form.tahunLulusSMA.trim()) e.tahunLulusSMA = "Tahun lulus SMA tidak boleh kosong"
    }
    if (s === 3) {
      if (!form.namaAyah.trim()) e.namaAyah = "Nama ayah tidak boleh kosong"
      if (!form.tempatTanggalLahirAyah.trim()) e.tempatTanggalLahirAyah = "Tempat & tanggal lahir ayah tidak boleh kosong"
      if (!form.namaIbu.trim()) e.namaIbu = "Nama ibu tidak boleh kosong"
      if (!form.tempatTanggalLahirIbu.trim()) e.tempatTanggalLahirIbu = "Tempat & tanggal lahir ibu tidak boleh kosong"
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) {
      toaster.error({ title: "Lengkapi data", description: "Mohon isi semua field yang wajib diisi." })
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toaster.error({ title: "Lengkapi data", description: "Mohon isi semua field yang wajib diisi." })
      return
    }
    setLoading(true)
    try {
      await addStudent({
        pilihanKelas: form.pilihanKelas as KelasOption,
        nama: form.nama.trim(),
        noKtp: form.noKtp.trim(),
        tempatLahir: form.tempatLahir.trim(),
        tanggalLahir: form.tanggalLahir,
        alamat: form.alamat.trim(),
        kodePos: form.kodePos.trim(),
        email: form.email.trim(),
        noHp: form.noHp.trim(),
        tinggiBadan: form.tinggiBadan.trim(),
        beratBadan: form.beratBadan.trim(),
        namaSD: form.namaSD.trim(),
        tahunLulusSD: form.tahunLulusSD.trim(),
        namaSMP: form.namaSMP.trim(),
        tahunLulusSMP: form.tahunLulusSMP.trim(),
        namaSMA: form.namaSMA.trim(),
        tahunLulusSMA: form.tahunLulusSMA.trim(),
        perguruanTinggiDiploma: form.perguruanTinggiDiploma.trim(),
        tahunLulusDiploma: form.tahunLulusDiploma.trim(),
        perguruanTinggiS1: form.perguruanTinggiS1.trim(),
        namaAyah: form.namaAyah.trim(),
        tempatTanggalLahirAyah: form.tempatTanggalLahirAyah.trim(),
        namaIbu: form.namaIbu.trim(),
        tempatTanggalLahirIbu: form.tempatTanggalLahirIbu.trim(),
      })

      const url = buildGoogleFormUrl(form)
      window.open(url, "_blank")
      toaster.success({
        title: "Data tersimpan!",
        description: "Melanjutkan ke Google Form untuk konfirmasi akhir...",
      })
      setDone(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      toaster.error({
        title: "Terjadi kesalahan",
        description: "Mohon coba lagi dalam beberapa saat.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Box bg="gray.50" minH="100vh">
        <NavBar onBack={() => navigate("/")} />
        <Container maxW="md" py={{ base: "12", md: "20" }}>
          <VStack gap="6" textAlign="center">
            <Box
              w="20"
              h="20"
              borderRadius="full"
              bg="green.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon fontSize="4xl" color="green.500"><LuCircleCheck /></Icon>
            </Box>
            <VStack gap="2">
              <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Pendaftaran Berhasil!</Heading>
              <Text color="gray.600" fontSize="md" lineHeight="tall">
                Terima kasih, <b>{form.nama}</b>. Data Anda untuk kelas{" "}
                <b>{form.pilihanKelas}</b> telah tersimpan. Google Form telah
                terbuka di tab baru dengan semua data sudah terisi otomatis —
                silakan tekan tombol <b>Submit</b> di Google Form tersebut untuk
                menyelesaikan pendaftaran.
              </Text>
            </VStack>
            {activeReg && (
              <Badge colorPalette="green" size="lg" px="4" borderRadius="full">
                {angkatanLabel}
              </Badge>
            )}
            <HStack gap="3" w="full" pt="4">
              <Button variant="outline" flex="1" size="lg" onClick={() => navigate("/")}>
                Kembali ke Beranda
              </Button>
              <Button
                colorPalette="orange"
                flex="1"
                size="lg"
                onClick={() => {
                  setForm(initialForm)
                  setStep(0)
                  setDone(false)
                  setErrors({})
                }}
              >
                Daftar Lagi
              </Button>
            </HStack>
          </VStack>
        </Container>
        <Toaster />
      </Box>
    )
  }

  return (
    <Box bg="gray.50" minH="100vh">
      <NavBar onBack={() => navigate("/")} />

      <Container maxW="3xl" py={{ base: "8", md: "12" }}>
        <VStack gap="2" mb="8" textAlign="center">
          {activeReg && (
            <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">
              Pendaftaran {angkatanLabel}
            </Badge>
          )}
          <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
            Formulir Pendaftaran
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Lengkapi semua data berikut. Field bertanda * wajib diisi.
          </Text>
        </VStack>

        {/* Step indicator */}
        <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" p="5" mb="6" shadow="sm">
          <StepIndicator current={step} total={STEPS.length} />
        </Box>

        {/* Step 0: Pilihan Kelas */}
        {step === 0 && (
          <SectionCard icon={<LuClipboardList />} title="Pilihan Kelas">
            <VStack gap="4" align="stretch">
              <Field label="PILIHAN KELAS" required errorText={errors.pilihanKelas} invalid={!!errors.pilihanKelas}>
                <NativeSelectRoot>
                  <NativeSelectField
                    placeholder="Pilih kelas..."
                    value={form.pilihanKelas}
                    onChange={(e) => setField("pilihanKelas", e.target.value)}
                    items={KELAS_OPTIONS as unknown as string[]}
                  />
                </NativeSelectRoot>
              </Field>
              <Box bg="blue.50" borderRadius="xl" p="4">
                <Text fontSize="xs" color="blue.700" lineHeight="tall">
                  Silakan pilih kelas yang sesuai dengan kebutuhan Anda. Pastikan Anda
                  memenuhi syarat pendaftaran untuk kelas yang dipilih.
                </Text>
              </Box>
            </VStack>
          </SectionCard>
        )}

        {/* Step 1: Data Diri */}
        {step === 1 && (
          <VStack gap="6" align="stretch">
            <SectionCard icon={<LuUser />} title="Data Personal">
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                <Field label="Nama" required errorText={errors.nama} invalid={!!errors.nama}>
                  <Input placeholder="Nama lengkap" value={form.nama} onChange={(e) => setField("nama", e.target.value)} />
                </Field>
                <Field label="No. KTP" required errorText={errors.noKtp} invalid={!!errors.noKtp}>
                  <Input placeholder="16 digit KTP" maxLength={16} value={form.noKtp} onChange={(e) => setField("noKtp", e.target.value)} />
                </Field>
                <Field label="Tempat Lahir" required errorText={errors.tempatLahir} invalid={!!errors.tempatLahir}>
                  <Input placeholder="Contoh: Jakarta" value={form.tempatLahir} onChange={(e) => setField("tempatLahir", e.target.value)} />
                </Field>
                <Field label="Tanggal Lahir" required errorText={errors.tanggalLahir} invalid={!!errors.tanggalLahir}>
                  <Input type="date" value={form.tanggalLahir} onChange={(e) => setField("tanggalLahir", e.target.value)} />
                </Field>
              </Grid>
              <Separator my="2" />
              <Field label="Alamat Lengkap Sesuai KTP" required errorText={errors.alamat} invalid={!!errors.alamat}>
                <Input placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota" value={form.alamat} onChange={(e) => setField("alamat", e.target.value)} />
              </Field>
              <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4" mt="4">
                <Field label="Kode Pos" required errorText={errors.kodePos} invalid={!!errors.kodePos}>
                  <Input placeholder="Contoh: 12345" maxLength={6} value={form.kodePos} onChange={(e) => setField("kodePos", e.target.value)} />
                </Field>
                <Field label="Email" required errorText={errors.email} invalid={!!errors.email}>
                  <Input type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => setField("email", e.target.value)} />
                </Field>
                <Field label="No. HP" required errorText={errors.noHp} invalid={!!errors.noHp}>
                  <Input type="tel" placeholder="08123456789" value={form.noHp} onChange={(e) => setField("noHp", e.target.value)} />
                </Field>
                <Grid templateColumns="1fr 1fr" gap="4">
                  <Field label="Tinggi Badan (cm)" required errorText={errors.tinggiBadan} invalid={!!errors.tinggiBadan}>
                    <Input placeholder="165" value={form.tinggiBadan} onChange={(e) => setField("tinggiBadan", e.target.value)} />
                  </Field>
                  <Field label="Berat Badan (kg)" required errorText={errors.beratBadan} invalid={!!errors.beratBadan}>
                    <Input placeholder="60" value={form.beratBadan} onChange={(e) => setField("beratBadan", e.target.value)} />
                  </Field>
                </Grid>
              </Grid>
            </SectionCard>
          </VStack>
        )}

        {/* Step 2: Pendidikan */}
        {step === 2 && (
          <SectionCard icon={<LuGraduationCap />} title="Riwayat Pendidikan">
            <Stack gap="5">
              <Box>
                <Heading fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="3">
                  Sekolah Dasar (SD)
                </Heading>
                <Grid templateColumns={{ base: "1fr", sm: "2fr 1fr" }} gap="4">
                  <Field label="Nama Sekolah Dasar (SD)" required errorText={errors.namaSD} invalid={!!errors.namaSD}>
                    <Input placeholder="Nama SD" value={form.namaSD} onChange={(e) => setField("namaSD", e.target.value)} />
                  </Field>
                  <Field label="Tahun Lulus" required errorText={errors.tahunLulusSD} invalid={!!errors.tahunLulusSD}>
                    <Input placeholder="2010" maxLength={4} value={form.tahunLulusSD} onChange={(e) => setField("tahunLulusSD", e.target.value)} />
                  </Field>
                </Grid>
              </Box>

              <Separator />

              <Box>
                <Heading fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="3">
                  Sekolah Menengah Pertama (SMP)
                </Heading>
                <Grid templateColumns={{ base: "1fr", sm: "2fr 1fr" }} gap="4">
                  <Field label="Nama Sekolah Menengah Pertama (SMP)" required errorText={errors.namaSMP} invalid={!!errors.namaSMP}>
                    <Input placeholder="Nama SMP" value={form.namaSMP} onChange={(e) => setField("namaSMP", e.target.value)} />
                  </Field>
                  <Field label="Tahun Lulus" required errorText={errors.tahunLulusSMP} invalid={!!errors.tahunLulusSMP}>
                    <Input placeholder="2013" maxLength={4} value={form.tahunLulusSMP} onChange={(e) => setField("tahunLulusSMP", e.target.value)} />
                  </Field>
                </Grid>
              </Box>

              <Separator />

              <Box>
                <Heading fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="3">
                  Sekolah Menengah Atas (SMA)
                </Heading>
                <Grid templateColumns={{ base: "1fr", sm: "2fr 1fr" }} gap="4">
                  <Field label="Nama Sekolah Menengah Atas (SMA)" required errorText={errors.namaSMA} invalid={!!errors.namaSMA}>
                    <Input placeholder="Nama SMA" value={form.namaSMA} onChange={(e) => setField("namaSMA", e.target.value)} />
                  </Field>
                  <Field label="Tahun Lulus" required errorText={errors.tahunLulusSMA} invalid={!!errors.tahunLulusSMA}>
                    <Input placeholder="2016" maxLength={4} value={form.tahunLulusSMA} onChange={(e) => setField("tahunLulusSMA", e.target.value)} />
                  </Field>
                </Grid>
              </Box>

              <Separator />

              <Box>
                <Heading fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="3">
                  Perguruan Tinggi (Opsional)
                </Heading>
                <Grid templateColumns={{ base: "1fr", sm: "2fr 1fr" }} gap="4" mb="4">
                  <Field label="Perguruan Tinggi & Jurusan (Diploma)" optionalText="(opsional)">
                    <Input placeholder="Nama kampus & jurusan diploma" value={form.perguruanTinggiDiploma} onChange={(e) => setField("perguruanTinggiDiploma", e.target.value)} />
                  </Field>
                  <Field label="Tahun Lulus Diploma" optionalText="(opsional)">
                    <Input placeholder="2018" maxLength={4} value={form.tahunLulusDiploma} onChange={(e) => setField("tahunLulusDiploma", e.target.value)} />
                  </Field>
                </Grid>
                <Field label="Perguruan Tinggi & Jurusan S-1 (Sarjana)" optionalText="(opsional)">
                  <Input placeholder="Nama kampus & jurusan S-1" value={form.perguruanTinggiS1} onChange={(e) => setField("perguruanTinggiS1", e.target.value)} />
                </Field>
              </Box>
            </Stack>
          </SectionCard>
        )}

        {/* Step 3: Data Orang Tua */}
        {step === 3 && (
          <SectionCard icon={<LuUsers />} title="Data Orang Tua Kandung">
            <Stack gap="5">
              <Box>
                <Heading fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="3">
                  Ayah Kandung
                </Heading>
                <VStack gap="4" align="stretch">
                  <Field label="Nama Ayah Kandung" required errorText={errors.namaAyah} invalid={!!errors.namaAyah}>
                    <Input placeholder="Nama lengkap ayah" value={form.namaAyah} onChange={(e) => setField("namaAyah", e.target.value)} />
                  </Field>
                  <Field label="Tempat dan Tanggal Lahir Ayah Kandung" required errorText={errors.tempatTanggalLahirAyah} invalid={!!errors.tempatTanggalLahirAyah}>
                    <Input placeholder="Contoh: Jakarta, 10 Januari 1970" value={form.tempatTanggalLahirAyah} onChange={(e) => setField("tempatTanggalLahirAyah", e.target.value)} />
                  </Field>
                </VStack>
              </Box>

              <Separator />

              <Box>
                <Heading fontSize="sm" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb="3">
                  Ibu Kandung
                </Heading>
                <VStack gap="4" align="stretch">
                  <Field label="Nama Ibu Kandung" required errorText={errors.namaIbu} invalid={!!errors.namaIbu}>
                    <Input placeholder="Nama lengkap ibu" value={form.namaIbu} onChange={(e) => setField("namaIbu", e.target.value)} />
                  </Field>
                  <Field label="Tempat dan Tanggal Lahir Ibu Kandung" required errorText={errors.tempatTanggalLahirIbu} invalid={!!errors.tempatTanggalLahirIbu}>
                    <Input placeholder="Contoh: Bandung, 15 Maret 1972" value={form.tempatTanggalLahirIbu} onChange={(e) => setField("tempatTanggalLahirIbu", e.target.value)} />
                  </Field>
                </VStack>
              </Box>
            </Stack>
          </SectionCard>
        )}

        {/* Navigation buttons */}
        <HStack gap="3" mt="8" justify="space-between">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            disabled={step === 0 || loading}
          >
            <Icon><LuChevronLeft /></Icon>
            Sebelumnya
          </Button>
          {step < STEPS.length - 1 ? (
            <Button colorPalette="orange" size="lg" onClick={handleNext}>
              Selanjutnya
              <Icon><LuChevronRight /></Icon>
            </Button>
          ) : (
            <Button
              colorPalette="orange"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : (
                <>
                  Selanjutnya
                  <Icon><LuCircleCheck /></Icon>
                </>
              )}
            </Button>
          )}
        </HStack>
      </Container>
      <Toaster />
    </Box>
  )
}
