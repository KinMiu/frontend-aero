import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Badge,
  Spinner,
  Image,
  Stack,
  Grid,
  Input,
} from "@chakra-ui/react"
import * as React from "react"
import { useParams } from "react-router-dom"
import {
  LuCircleCheck,
  LuCircle,
  LuClipboardList,
  LuFileText,
  LuWallet,
  LuUsers,
  LuGraduationCap,
  LuUpload,
  LuPlane,
  LuLoader,
  LuCircleX,
  LuBuilding2,
  LuScrollText,
  LuShieldCheck,
  LuBanknote,
  LuTrash2,
  LuMessageCircle,
  LuExternalLink,
  LuVideo,
} from "react-icons/lu"
import {
  getStudentByToken,
  submitPayment,
  submitReRegistrationPayment,
  resetReRegistrationPayment,
  getRegistrationFee,
  getReRegistrationFee,
  getDocumentsByTrackToken,
  getActiveDocumentSettings,
  uploadTrackingDocument,
  deleteTrackingDocument,
  type Student,
  type RegistrationFee,
  type ReRegistrationFee,
  type UploadedDocument,
  type DocumentSetting,
} from "@/store"
import { ImageUpload } from "@/components/ImageUpload"
import { toaster } from "@/components/ui/toaster"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const STEPS = [
  { id: 0, title: "Isi Data", icon: LuClipboardList, desc: "Mengisi formulir pendaftaran" },
  { id: 1, title: "Upload Dokumen", icon: LuFileText, desc: "Upload dokumen yang diperlukan" },
  { id: 2, title: "Pembayaran", icon: LuWallet, desc: "Membayar biaya pendaftaran" },
  { id: 3, title: "Wawancara", icon: LuUsers, desc: "Wawancara dengan instruktur AVSEC" },
  { id: 4, title: "Surat Kelulusan", icon: LuScrollText, desc: "Lihat surat kelulusan dan biaya daftar ulang" },
  { id: 5, title: "Daftar Ulang", icon: LuBanknote, desc: "Upload bukti transfer daftar ulang" },
]

function NavBar() {
  return (
    <Box as="nav" position="sticky" top="0" zIndex="banner" bg="white" borderBottomWidth="1px" borderBottomColor="gray.100" shadow="sm">
      <Container maxW="lg">
        <HStack h="16" gap="3">
          <Box bg="blue.500" borderRadius="lg" p="2" display="flex" alignItems="center" justifyContent="center">
            <Icon color="white"><LuPlane /></Icon>
          </Box>
          <VStack gap="0" alignItems="flex-start">
            <Text fontWeight="bold" fontSize="md" color="gray.800">AERO FORTE INDONESIA</Text>
            <Text fontSize="xs" color="gray.500">Tracking Pendaftaran</Text>
          </VStack>
        </HStack>
      </Container>
    </Box>
  )
}

export default function TrackingPage() {
  const { token } = useParams<{ token: string }>()
  const [student, setStudent] = React.useState<Student | null>(null)
  const [fee, setFee] = React.useState<RegistrationFee | null>(null)
  const [reRegistrationFee, setReRegistrationFee] = React.useState<ReRegistrationFee | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [paying, setPaying] = React.useState(false)
  const [paymentProof, setPaymentProof] = React.useState("")
  const [reRegistrationProof, setReRegistrationProof] = React.useState("")
  const [showPayment, setShowPayment] = React.useState(false)
  const [submittingReRegistration, setSubmittingReRegistration] = React.useState(false)
  const [docCount, setDocCount] = React.useState(0)
  const [documents, setDocuments] = React.useState<UploadedDocument[]>([])
  const [documentSettings, setDocumentSettings] = React.useState<DocumentSetting[]>([])
  const [selectedStep, setSelectedStep] = React.useState(0)
  const [blockedStep, setBlockedStep] = React.useState<number | null>(null)
  const [uploadingLabel, setUploadingLabel] = React.useState<string | null>(null)
  const [fullImg, setFullImg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    Promise.all([
      getStudentByToken(token),
      getRegistrationFee().catch(() => null),
      getReRegistrationFee().catch(() => null),
      getActiveDocumentSettings(),
    ]).then(async ([s, f, rf, settings]) => {
      setStudent(s)
      setFee(f)
      setReRegistrationFee(rf)
      setDocumentSettings(settings)
      if (s?.paymentProof) setPaymentProof(s.paymentProof)
      if (s?.reRegistrationProof) setReRegistrationProof(s.reRegistrationProof)
      let computedDocs: UploadedDocument[] = []
      if (s) {
        computedDocs = await getDocumentsByTrackToken(token)
        setDocuments(computedDocs)
        setDocCount(computedDocs.length)
      }
      if (s) {
        const docsDone = computedDocs.length > 0
        const payStatus = s.paymentStatus
        const intStatus = s.interviewStatus
        const finStatus = s.finalStatus
        let initialStep = 0
        if (!docsDone) initialStep = 1
        else if (payStatus !== "berhasil") initialStep = 2
        else if (intStatus !== "lulus") initialStep = 3
        else if (finStatus !== "siap_diklat") initialStep = 4
        else initialStep = 4
        setSelectedStep(initialStep)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [token])

  const fileToWebpDataUrl = async (file: File, maxSize = 1600, quality = 0.8): Promise<string> => {
    const bitmap = await createImageBitmap(file)
    let { width, height } = bitmap
    if (width > maxSize || height > maxSize) {
      const ratio = Math.min(maxSize / width, maxSize / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height)
    return canvas.toDataURL("image/webp", quality)
  }

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, setting: DocumentSetting) => {
    const file = event.target.files?.[0]
    if (!file || !token) return
    if (file.size > 5 * 1024 * 1024) {
      toaster.create({ title: "Ukuran file maksimal 5MB", type: "error" })
      return
    }

    setUploadingLabel(setting.label)
    try {
      const isImage = file.type.startsWith("image/")
      const isPdf = file.type === "application/pdf"
      let fileData: string
      let fileName: string
      let fileType: string
      if (isImage) {
        try {
          fileData = await fileToWebpDataUrl(file)
          fileType = "image/webp"
        } catch {
          fileData = await fileToBase64(file)
          fileType = file.type
        }
        fileName = file.name.replace(/\\.[^.]+$/, "") + ".webp"
      } else if (isPdf) {
        fileData = await fileToBase64(file)
        fileType = "application/pdf"
        fileName = file.name
      } else {
        toaster.create({ title: "File harus berupa gambar atau PDF", type: "error" })
        return
      }
      const uploaded = await uploadTrackingDocument(token, fileData, fileName, fileType, setting.label)
      setDocuments((current) => [uploaded, ...current])
      setDocCount((count) => count + 1)
      toaster.create({ title: `${setting.label} berhasil diupload`, type: "success" })
    } catch {
      toaster.create({ title: `Gagal mengupload ${setting.label}`, type: "error" })
    } finally {
      setUploadingLabel(null)
      event.target.value = ""
    }
  }

  const handleDocumentDelete = async (id: string) => {
    if (!token) return
    try {
      await deleteTrackingDocument(token, id)
      setDocuments((current) => current.filter((doc) => doc.id !== id))
      setDocCount((count) => Math.max(0, count - 1))
      toaster.create({ title: "Dokumen dihapus", type: "info" })
    } catch {
      toaster.create({ title: "Gagal menghapus dokumen", type: "error" })
    }
  }

  const handlePay = async () => {
    if (!token) return
    setPaying(true)
    try {
      const updated = await submitPayment(token, paymentProof)
      setStudent(updated)
      setShowPayment(false)
      toaster.create({ title: "Pembayaran dikirim", description: "Menunggu konfirmasi dari admin", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengirim pembayaran", type: "error" })
    }
    setPaying(false)
  }

  const handleWhatsAppConfirmation = () => {
    const rawNumber = reRegistrationFee?.whatsappAdminNumber?.replace(/\\D/g, "") || ""
    const adminNumber = rawNumber.startsWith("0") ? `62${rawNumber.slice(1)}` : rawNumber
    if (!adminNumber) {
      toaster.create({ title: "Nomor WhatsApp admin belum tersedia", description: "Silakan hubungi admin melalui jalur lain.", type: "error" })
      return
    }
    const message = `Halo Admin, saya ${student?.nama || "peserta"} telah melakukan pembayaran daftar ulang. Mohon konfirmasi status pengirimannya.`
    window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
  }

  const [downloadingLetter, setDownloadingLetter] = React.useState(false)

  const handleDownloadLetter = async () => {
    const letterEl = document.getElementById("graduation-letter")
    if (!letterEl || !student) {
      toaster.create({ title: "Surat kelulusan belum siap", type: "error" })
      return
    }

    setDownloadingLetter(true)
    const fileName = `Surat-Kelulusan-${student.nama.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`

    const downloadPdf = (pdf: jsPDF) => {
      const blob = pdf.output("blob")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.rel = "noopener"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    try {
      const canvas = await html2canvas(letterEl, {
        backgroundColor: "#fffdf5",
        scale: Math.min(2, window.devicePixelRatio || 1),
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 5000,
        onclone: (clonedDocument) => {
          const clonedLetter = clonedDocument.getElementById("graduation-letter")
          if (clonedLetter) clonedLetter.style.boxShadow = "none"
        },
      })

      if (canvas.width === 0 || canvas.height === 0) throw new Error("Preview surat kosong")

      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const sideMargin = 10
      const imageWidth = pageWidth - sideMargin * 2
      const imageHeight = (canvas.height * imageWidth) / canvas.width
      const printableHeight = pageHeight - sideMargin * 2
      const imageData = canvas.toDataURL("image/jpeg", 0.98)
      let remainingHeight = imageHeight
      let y = sideMargin
      let page = 0

      while (remainingHeight > 0) {
        if (page > 0) pdf.addPage()
        pdf.addImage(imageData, "JPEG", sideMargin, y, imageWidth, imageHeight, undefined, "FAST")
        remainingHeight -= printableHeight
        y -= printableHeight
        page += 1
      }

      downloadPdf(pdf)
    } catch {
      const pdf = new jsPDF("p", "mm", "a4")
      const margin = 20
      const pageWidth = pdf.internal.pageSize.getWidth()
      let y = margin
      pdf.setFont("times", "bold")
      pdf.setFontSize(14)
      pdf.text("AERO FORTE INDONESIA", pageWidth / 2, y, { align: "center" })
      y += 12
      pdf.setFont("times", "normal")
      pdf.setFontSize(11)
      ;[
        `Nama: ${student.nama}`,
        `Tempat, Tgl Lahir: ${student.tempatLahir || "-"}, ${student.tanggalLahir || "-"}`,
        `Asal Sekolah: ${student.namaSMA || "-"}`,
        `Program Pendidikan: ${student.pilihanKelas}`,
        "Status: LULUS SELEKSI",
        `Biaya daftar ulang: ${reRegistrationFee?.amount ? formatRupiah(reRegistrationFee.amount) : "Belum ditentukan"}`,
      ].forEach((line) => {
        pdf.text(line, margin, y)
        y += 8
      })
      downloadPdf(pdf)
      toaster.create({ title: "PDF berhasil dibuat", description: "Tampilan cadangan digunakan karena preview tidak dapat dirender.", type: "info" })
    } finally {
      setDownloadingLetter(false)
    }
  }

  const [resettingReRegistration, setResettingReRegistration] = React.useState(false)

  const handleDeleteReRegistrationProof = async () => {
    if (!token) return
    if (reRegistrationStatus === "proses") {
      setResettingReRegistration(true)
      try {
        const updated = await resetReRegistrationPayment(token)
        setStudent(updated)
        setReRegistrationProof("")
        toaster.create({ title: "Bukti transfer dihapus", description: "Silakan upload ulang bukti transfer", type: "info" })
      } catch {
        toaster.create({ title: "Gagal menghapus bukti transfer", type: "error" })
      } finally {
        setResettingReRegistration(false)
      }
    } else {
      setReRegistrationProof("")
      toaster.create({ title: "Bukti transfer dihapus", description: "Silakan upload ulang bukti transfer", type: "info" })
    }
  }

  const handleReRegistrationPayment = async () => {
    if (!token || !reRegistrationProof) {
      toaster.create({ title: "Bukti transfer daftar ulang wajib diupload", type: "error" })
      return
    }
    setSubmittingReRegistration(true)
    try {
      const updated = await submitReRegistrationPayment(token, reRegistrationProof)
      setStudent(updated)
      toaster.create({ title: "Bukti daftar ulang berhasil dikirim", description: "Menunggu verifikasi admin", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengirim bukti daftar ulang", type: "error" })
    } finally {
      setSubmittingReRegistration(false)
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.50">
        <NavBar />
        <Container maxW="lg" py="20">
          <VStack gap="4">
            <Spinner size="xl" color="orange.400" />
            <Text color="gray.500">Memuat data...</Text>
          </VStack>
        </Container>
      </Box>
    )
  }

  if (!student) {
    return (
      <Box minH="100vh" bg="gray.50">
        <NavBar />
        <Container maxW="md" py="20">
          <Box bg="white" borderRadius="2xl" shadow="xl" p="8" textAlign="center">
            <VStack gap="4">
              <Box bg="red.50" borderRadius="full" w="16" h="16" display="flex" alignItems="center" justifyContent="center" mx="auto">
                <Icon fontSize="2xl" color="red.400"><LuCircle /></Icon>
              </Box>
              <Heading fontSize="xl" color="gray.900">Data Tidak Ditemukan</Heading>
              <Text fontSize="sm" color="gray.600">
                Token tracking tidak valid atau data pendaftar tidak ditemukan.
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    )
  }

  // Determine step statuses
  const step0Done = true // Data already filled
  const step1Done = docCount > 0
  const step2Status = student.paymentStatus // belum_bayar | proses | berhasil
  const step3Status = student.interviewStatus // belum | terjadwal | lulus | tidak_lulus
  const step4Status = student.finalStatus // belum | siap_diklat
  const reRegistrationStatus = student.reRegistrationStatus || "belum_bayar"

  const isStepUnlocked = (stepId: number): boolean => {
    if (stepId === 0 || stepId === 1) return true
    if (stepId === 2) return step1Done
    if (stepId === 3) return step2Status === "berhasil"
    return step4Status === "siap_diklat"
  }

  const getBlockedMessage = (stepId: number): string => {
    if (stepId === 2) return "Lakukan upload dokumen terlebih dahulu, baru pembayaran dapat dilakukan."
    if (stepId === 3) return "Setelah pembayaran dikonfirmasi, Anda akan mendapatkan jadwal wawancara oleh instruktur."
    return "Tahap ini tersedia setelah Anda dinyatakan lulus wawancara."
  }

  const getStepStatus = (stepId: number): "done" | "active" | "pending" => {
    if (stepId === 0) return "done"
    if (stepId === 1) return step1Done ? "done" : "active"
    if (stepId === 2) {
      if (step2Status === "berhasil") return "done"
      if (step2Status === "proses") return "active"
      return "pending"
    }
    if (stepId === 3) {
      if (step4Status === "siap_diklat") return "done"
      if (step3Status === "lulus") return "done"
      if (step3Status === "terjadwal") return "active"
      if (step3Status === "belum" && step2Status === "berhasil") return "active"
      return "pending"
    }
    if (stepId === 4) {
      if (step4Status === "siap_diklat") return "done"
      return "pending"
    }
    if (stepId === 5) {
      if (reRegistrationStatus === "berhasil") return "done"
      if (reRegistrationStatus === "proses") return "active"
      return "pending"
    }
    return "pending"
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <NavBar />
      <Container maxW="6xl" py="8">
        <VStack gap="2" mb="6" textAlign="center">
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Status Pendaftaran</Heading>
          <Text fontSize="sm" color="gray.500">Halo, {student.nama}</Text>
          <Badge colorPalette="blue" size="md" px="3" borderRadius="full">{student.pilihanKelas}</Badge>
        </VStack>

        <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap="6" alignItems="start">
          <VStack gap="3" alignItems="stretch">
            {STEPS.map((step, i) => {
              const status = getStepStatus(step.id)
              return (
                <Button
                  key={step.id}
                  variant="ghost"
                  h="auto"
                  p="0"
                  justifyContent="stretch"
                  whiteSpace="normal"
                  onClick={() => {
                    if (!isStepUnlocked(step.id)) {
                      setBlockedStep((current) => current === step.id ? null : step.id)
                      return
                    }
                    setBlockedStep(null)
                    setSelectedStep(step.id)
                  }}
                >
                  <Box
                    bg={selectedStep === step.id ? "blue.50" : "white"}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={selectedStep === step.id ? "blue.400" : status === "done" ? "green.200" : status === "active" ? "orange.200" : "gray.200"}
                    p="4"
                    shadow="sm"
                    w="full"
                    textAlign="left"
                  >
                    <HStack gap="3" alignItems="flex-start">
                      <Box w="10" h="10" borderRadius="full" bg={status === "done" ? "green.500" : status === "active" ? "orange.500" : "gray.100"} color={status === "pending" ? "gray.400" : "white"} display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                        {status === "done" ? <Icon><LuCircleCheck /></Icon> : status === "active" ? <Icon><LuLoader /></Icon> : <Icon><step.icon /></Icon>}
                      </Box>
                      <VStack gap="1" alignItems="flex-start">
                        <HStack gap="2">
                          <Text fontSize="sm" fontWeight="bold" color="gray.800">{i + 1}. {step.title}</Text>
                          {status === "done" && <Badge colorPalette="green" size="sm">Selesai</Badge>}
                          {status === "pending" && <Badge colorPalette="gray" size="sm">Menunggu</Badge>}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">{step.desc}</Text>
                      </VStack>
                    </HStack>
                    {blockedStep === step.id && !isStepUnlocked(step.id) && (
                      <Box mt="3" bg="orange.50" borderWidth="1px" borderColor="orange.200" borderRadius="lg" p="3">
                        <Text fontSize="xs" color="orange.800" lineHeight="tall">{getBlockedMessage(step.id)}</Text>
                      </Box>
                    )}
                  </Box>
                </Button>
              )
            })}
          </VStack>

          <Box bg="white" borderRadius="2xl" borderWidth="1px" borderColor="gray.200" shadow="sm" p={{ base: "5", md: "7" }}>
            {selectedStep === 0 && (
              <VStack gap="5" alignItems="stretch">
                <Box>
                  <Heading fontSize="xl" color="gray.900">Data Diri Pendaftar</Heading>
                  <Text fontSize="sm" color="gray.500" mt="1">Data yang tersimpan saat pendaftaran.</Text>
                </Box>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  {[
                    ["Nama Lengkap", student.nama], ["Kelas", student.pilihanKelas], ["No. KTP", student.noKtp],
                    ["Email", student.email], ["No. HP", student.noHp], ["Tempat Lahir", student.tempatLahir],
                    ["Tanggal Lahir", student.tanggalLahir], ["Alamat", student.alamat], ["Kode Pos", student.kodePos],
                    ["Tinggi Badan", `${student.tinggiBadan} cm`], ["Berat Badan", `${student.beratBadan} kg`],
                    ["Nama Ayah", student.namaAyah], ["Nama Ibu", student.namaIbu],
                  ].map(([label, value]) => (
                    <Box key={label} bg="gray.50" borderRadius="lg" p="3">
                      <Text fontSize="xs" color="gray.500" mb="1">{label}</Text>
                      <Text fontSize="sm" color="gray.800" fontWeight="medium">{value || "-"}</Text>
                    </Box>
                  ))}
                </Grid>
              </VStack>
            )}

            {selectedStep === 1 && (
              <VStack gap="5" alignItems="stretch">
                <Box>
                  <Heading fontSize="xl" color="gray.900">Upload Dokumen</Heading>
                  <Text fontSize="sm" color="gray.500" mt="1">Upload langsung dari halaman tracking. Tidak perlu menunggu link dari admin.</Text>
                </Box>
                <VStack gap="4" alignItems="stretch">
                  {(documentSettings.length > 0 ? documentSettings : [{ id: "default", label: "Dokumen Pendaftaran", fileType: "any" as const, required: true, isActive: true, createdAt: "" }]).map((setting) => {
                    const settingDocs = documents.filter((doc) => doc.documentLabel === setting.label)
                    return (
                      <Box key={setting.id} borderWidth="1px" borderColor="gray.200" borderRadius="xl" p="4">
                        <HStack gap="2" mb="2"><Icon color="blue.600"><LuFileText /></Icon><Text fontWeight="bold" fontSize="sm" color="gray.800">{setting.label}</Text>{setting.required && <Badge colorPalette="red" size="sm">Wajib</Badge>}</HStack>
                        {settingDocs.map((doc) => (
                          <HStack key={doc.id} justify="space-between" bg="green.50" p="3" rounded="lg" mb="3">
                            <HStack gap="2"><Icon color="green.600"><LuCircleCheck /></Icon><Text fontSize="sm" color="green.700">{doc.fileName}</Text></HStack>
                            <Button size="xs" variant="ghost" colorPalette="red" onClick={() => handleDocumentDelete(doc.id)}>Hapus</Button>
                          </HStack>
                        ))}
                        {settingDocs.length === 0 && (
                        <Box as="label" cursor="pointer" display="block" textAlign="center" bg="blue.50" border="2px dashed" borderColor="blue.300" rounded="lg" p="5" _hover={{ bg: "blue.100" }}>
                          <VStack gap="2"><Icon fontSize="2xl" color="blue.500"><LuUpload /></Icon><Text fontSize="sm" color="blue.700" fontWeight="semibold">{uploadingLabel === setting.label ? "Mengupload..." : `Klik untuk upload ${setting.label}`}</Text><Text fontSize="xs" color="gray.500">JPG, PNG, WebP, PDF — maksimal 5MB</Text></VStack>
                          <Input type="file" accept="image/*,.pdf" display="none" disabled={uploadingLabel !== null} onChange={(event) => handleDocumentUpload(event, setting)} />
                        </Box>
                        )}
                      </Box>
                    )
                  })}
                </VStack>
              </VStack>
            )}

            {selectedStep === 2 && (
              <VStack gap="5" alignItems="stretch">
                <Box>
                  <Heading fontSize="xl" color="gray.900">Pembayaran</Heading>
                  <Text fontSize="sm" color="gray.500" mt="1">Selesaikan pembayaran untuk mendapatkan jadwal wawancara.</Text>
                </Box>
                <Box bg={step2Status === "berhasil" ? "green.50" : step2Status === "proses" ? "orange.50" : "red.50"} borderWidth="1px" borderColor={step2Status === "berhasil" ? "green.200" : step2Status === "proses" ? "orange.200" : "red.200"} borderRadius="xl" p="4">
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">Status pembayaran</Text>
                  <Text fontSize="lg" fontWeight="bold" color={step2Status === "berhasil" ? "green.700" : step2Status === "proses" ? "orange.700" : "red.700"} mt="1">
                    {step2Status === "berhasil" ? "Pembayaran berhasil" : step2Status === "proses" ? "Menunggu konfirmasi admin" : "Belum bayar"}
                  </Text>
                </Box>
                <Box bg="gray.50" borderRadius="xl" p="5" textAlign="center">
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">Total biaya pendaftaran</Text>
                  <Text fontSize="3xl" fontWeight="black" color="gray.900" mt="1">{fee?.amount ? formatRupiah(fee.amount) : "Rp 0"}</Text>
                </Box>
                {fee?.qrisImage && <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p="4"><Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Bayar dengan QRIS</Text><Box bg="gray.50" borderRadius="lg" p="4" display="flex" justifyContent="center"><Image src={fee.qrisImage} alt="QRIS pembayaran" boxSize="220px" objectFit="contain" cursor="zoom-in" onClick={() => setFullImg(fee.qrisImage!)} _hover={{ opacity: 0.85 }} transition="opacity 0.15s" /></Box><Text fontSize="xs" color="gray.400" textAlign="center" mt="1">Klik gambar untuk memperbesar</Text></Box>}
                {fee?.bankAccounts && fee.bankAccounts.filter((account) => account.bankName.trim() || account.accountNumber.trim()).length > 0 && <Box><Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Transfer bank</Text><VStack gap="2" alignItems="stretch">{fee.bankAccounts.filter((account) => account.bankName.trim() || account.accountNumber.trim()).map((account, index) => <Box key={index} borderWidth="1px" borderColor="gray.200" borderRadius="lg" p="3"><Text fontSize="sm" fontWeight="bold" color="gray.800">{account.bankName}</Text><Text fontSize="sm" color="gray.700" fontFamily="mono">{account.accountNumber}</Text><Text fontSize="xs" color="gray.500">a.n. {account.accountHolder || "-"}</Text></Box>)}</VStack></Box>}
                {student.paymentProof && <Box><Text fontSize="sm" fontWeight="bold" color="gray.700" mb="2">Bukti pembayaran yang dikirim</Text><Box position="relative" display="inline-block"><Image src={student.paymentProof} alt="Bukti pembayaran" maxW="280px" borderRadius="lg" borderWidth="1px" borderColor="gray.200" cursor="zoom-in" onClick={() => setFullImg(student.paymentProof!)} _hover={{ opacity: 0.85 }} transition="opacity 0.15s" /><Box position="absolute" bottom="2" right="2" bg="blackAlpha.600" borderRadius="md" px="2" py="1" pointerEvents="none"><Text fontSize="xs" color="white" fontWeight="medium">Klik untuk perbesar</Text></Box></Box></Box>}
                <Button colorPalette="orange" size="lg" onClick={() => setShowPayment(true)}><Icon><LuWallet /></Icon>{step2Status === "belum_bayar" ? "Bayar Sekarang" : "Lihat / Kirim Bukti Pembayaran"}</Button>
              </VStack>
            )}
            {selectedStep === 3 && (
              <VStack gap="5" alignItems="stretch">
                <Box>
                  <Heading fontSize="xl" color="gray.900">Wawancara</Heading>
                  <Text fontSize="sm" color="gray.500" mt="1">{student.interviewDate && student.interviewTime ? "Jadwal wawancara Anda telah ditentukan oleh instruktur." : "Jadwal wawancara akan ditentukan oleh instruktur setelah pembayaran dikonfirmasi."}</Text>
                </Box>
                <Box bg={step3Status === "lulus" ? "green.50" : step3Status === "terjadwal" ? "blue.50" : step3Status === "tidak_lulus" ? "red.50" : "gray.50"} borderWidth="1px" borderColor={step3Status === "lulus" ? "green.200" : step3Status === "terjadwal" ? "blue.200" : step3Status === "tidak_lulus" ? "red.200" : "gray.200"} borderRadius="xl" p="5">
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">Status wawancara</Text>
                  <Text fontSize="lg" fontWeight="bold" color={step3Status === "lulus" ? "green.700" : step3Status === "terjadwal" ? "blue.700" : step3Status === "tidak_lulus" ? "red.700" : "gray.700"} mt="1">
                    {step3Status === "terjadwal" ? "Terjadwal" : step3Status === "lulus" ? "Lulus" : step3Status === "tidak_lulus" ? "Belum lulus" : "Belum dijadwalkan"}
                  </Text>
                  {student.interviewDate && student.interviewTime && (
                    <Box mt="4" pt="4" borderTop="1px solid" borderColor={step3Status === "terjadwal" ? "blue.200" : "gray.200"}>
                      <HStack gap="6">
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">Tanggal</Text>
                          <Text fontSize="md" fontWeight="bold" color="gray.900" mt="1">{new Date(student.interviewDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">Jam</Text>
                          <Text fontSize="md" fontWeight="bold" color="gray.900" mt="1">{student.interviewTime} WIB</Text>
                        </Box>
                      </HStack>
                      {step3Status === "terjadwal" && student.interviewZoomLink && (
                        <Button as="a" href={student.interviewZoomLink} target="_blank" rel="noreferrer" colorPalette="blue" mt="4" width="full">
                          <Icon><LuVideo /></Icon>Gabung Wawancara via Zoom
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </VStack>
            )}
            {selectedStep === 4 && (
              <VStack gap="5" alignItems="stretch">
                <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap="3">
                  <Box>
                    <Heading fontSize="xl" color="gray.900">Surat Kelulusan</Heading>
                    <Text fontSize="sm" color="gray.500" mt="1">Dokumen resmi hasil seleksi dan informasi daftar ulang Anda.</Text>
                  </Box>
                  {step4Status === "siap_diklat" && <Button colorPalette="blue" variant="outline" loading={downloadingLetter} onClick={handleDownloadLetter}><Icon><LuFileText /></Icon>Download / Simpan PDF</Button>}
                </HStack>
                {step4Status === "siap_diklat" ? (
                  <Box id="graduation-letter" className="graduation-letter" bg="#fffdf5" border="1px solid" borderColor="gray.300" borderRadius="sm" p={{ base: "5", md: "10" }} shadow="md" fontFamily="Georgia, serif" color="gray.900">
                    <VStack gap="2" textAlign="center" borderBottom="1px solid" borderColor="gray.400" pb="5" mb="5">
                      <Image src="/logo.png" alt="Logo Aero Forte Indonesia" maxH="16" maxW="52" objectFit="contain" />
                      <Text fontSize="xs" letterSpacing="widest" fontWeight="bold">AERO FORTE INDONESIA</Text>
                      <Text fontSize="xs" color="gray.600">PUSAT PENDIDIKAN DAN PELATIHAN KEAMANAN PENERBANGAN</Text>
                    </VStack>
                    <HStack justify="space-between" align="start" fontSize="xs" mb="5">
                      <VStack alignItems="flex-start" gap="1"><Text>Hal : Keputusan Hasil Seleksi</Text><Text>Lampiran : 6 (enam) halaman</Text><Text>Sifat : RAHASIA</Text></VStack>
                      <VStack alignItems="flex-end" gap="1"><Text>Indonesia</Text><Text>{new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</Text></VStack>
                    </HStack>
                    <Text fontSize="sm" lineHeight="tall" mb="5">Berdasarkan hasil seleksi dan penilaian yang telah dilaksanakan, dengan ini kami menyampaikan keputusan sebagai berikut:</Text>
                    <Box fontSize="sm" mb="5">
                      <Text><b>Nama</b><Text as="span" ml="10">: {student.nama}</Text></Text>
                      <Text><b>Tempat, Tgl Lahir</b><Text as="span" ml="2">: {student.tempatLahir || "-"}, {student.tanggalLahir || "-"}</Text></Text>
                      <Text><b>Asal Sekolah</b><Text as="span" ml="5">: {student.namaSMA || "-"}</Text></Text>
                    </Box>
                    <Box textAlign="center" my="6"><Text fontSize="sm">Dinyatakan</Text><Text fontSize="xl" fontWeight="black" letterSpacing="wide">DITERIMA</Text></Box>
                    <Box fontSize="sm" mb="5"><Text><b>Program Pendidikan</b><Text as="span" ml="2">: {student.pilihanKelas}</Text></Text><Text><b>Status</b><Text as="span" ml="16">: LULUS SELEKSI</Text></Text></Box>
                    <Box borderTop="1px solid" borderColor="gray.300" pt="5" mt="6">
                      <Text fontSize="sm" fontWeight="bold" mb="2">Informasi biaya daftar ulang</Text>
                      <Text fontSize="sm" lineHeight="tall">Kami menghimbau agar Saudara/i melakukan transfer biaya daftar ulang paling lambat sesuai arahan panitia. Pembayaran daftar ulang <b>hanya dapat dilakukan melalui transfer bank</b> ke rekening yang tertera di bawah ini.</Text>
                      <Box borderWidth="1px" borderColor="gray.400" mt="4" fontSize="sm">
                        <Grid templateColumns="1fr 1.4fr 1.4fr" fontWeight="bold" bg="gray.100"><Text p="2">Nama Bank</Text><Text p="2">Nama Rekening</Text><Text p="2">Nomor Rekening</Text></Grid>
                        <Grid templateColumns="1fr 1.4fr 1.4fr" borderTopWidth="1px" borderColor="gray.300"><Text p="2">{reRegistrationFee?.bankName || "-"}</Text><Text p="2">{reRegistrationFee?.accountHolder || "-"}</Text><Text p="2" fontFamily="mono">{reRegistrationFee?.accountNumber || "-"}</Text></Grid>
                      </Box>
                      <Box bg="orange.50" borderWidth="1px" borderColor="orange.300" p="3" mt="4"><Text fontSize="sm" fontWeight="bold">Biaya daftar ulang: {reRegistrationFee?.amount ? formatRupiah(reRegistrationFee.amount) : "Belum ditentukan"}</Text><Text fontSize="xs" color="orange.900" mt="1">Pastikan nama dan nomor rekening sesuai surat sebelum melakukan transfer. Biaya yang sudah dibayarkan tidak dapat dikembalikan.</Text></Box>
                    </Box>
                    <HStack gap="2" mt="6" color="gray.600"><Icon><LuShieldCheck /></Icon><Text fontSize="xs">Surat ini diterbitkan secara digital oleh Aero Forte Indonesia.</Text></HStack>
                  </Box>
                ) : step3Status === "tidak_lulus" ? (
                  <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="xl" p="5"><HStack gap="3" mb="2"><Icon fontSize="2xl" color="red.500"><LuCircleX /></Icon><Text fontSize="lg" fontWeight="bold" color="red.700">Anda dinyatakan TIDAK LULUS</Text></HStack><Text fontSize="sm" color="red.600">Mohon maaf, Anda belum lolos pada tahap wawancara.</Text></Box>
                ) : (
                  <Box bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="xl" p="5"><Text fontSize="sm" color="gray.600">Surat kelulusan akan tersedia setelah Anda dinyatakan lulus wawancara.</Text></Box>
                )}
              </VStack>
            )}
            {selectedStep === 5 && (
              <VStack gap="5" alignItems="stretch">
                <Box><Heading fontSize="xl" color="gray.900">Daftar Ulang</Heading><Text fontSize="sm" color="gray.500" mt="1">Ikuti instruksi pada surat kelulusan dan upload bukti transfer Anda.</Text></Box>
                <Box bg="blue.50" borderWidth="1px" borderColor="blue.200" borderRadius="xl" p="5">
                  <HStack gap="3" mb="3"><Icon color="blue.600" fontSize="xl"><LuBuilding2 /></Icon><Text fontWeight="bold" color="blue.900">Rincian pembayaran daftar ulang</Text></HStack>
                  <Text fontSize="sm" color="blue.900" lineHeight="tall">Silakan melakukan daftar ulang dengan rincian biaya <b>{reRegistrationFee?.amount ? formatRupiah(reRegistrationFee.amount) : "yang tertera pada surat kelulusan"}</b>. Pembayaran hanya dapat dilakukan melalui transfer bank ke rekening yang tertera di surat kelulusan.</Text>
                  <Button variant="outline" colorPalette="blue" mt="4" onClick={() => setSelectedStep(4)}><Icon><LuScrollText /></Icon>Lihat Surat Kelulusan</Button>
                </Box>
                <Box bg={reRegistrationStatus === "proses" ? "orange.50" : reRegistrationStatus === "berhasil" ? "green.50" : "gray.50"} borderWidth="1px" borderColor={reRegistrationStatus === "proses" ? "orange.200" : reRegistrationStatus === "berhasil" ? "green.200" : "gray.200"} borderRadius="xl" p="5">
                  <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase">Status daftar ulang</Text>
                  <Text fontSize="lg" fontWeight="bold" color={reRegistrationStatus === "proses" ? "orange.700" : reRegistrationStatus === "berhasil" ? "green.700" : "gray.700"} mt="1">{reRegistrationStatus === "proses" ? "Bukti transfer sedang diverifikasi" : reRegistrationStatus === "berhasil" ? "Daftar ulang sudah dikonfirmasi" : "Belum mengirim bukti transfer"}</Text>
                </Box>
                {reRegistrationStatus === "proses" && (
                  <Box bg="green.50" borderWidth="1px" borderColor="green.200" borderRadius="xl" p="5">
                    <HStack gap="3" alignItems="flex-start">
                      <Icon color="green.600" fontSize="xl"><LuMessageCircle /></Icon>
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="bold" color="green.900">Kirim konfirmasi ke admin</Text>
                        <Text fontSize="sm" color="green.800" mt="1">Bukti transfer Anda sedang diverifikasi. Kirim pesan WhatsApp agar admin dapat memeriksa pengiriman Anda.</Text>
                        <Button colorPalette="green" mt="3" onClick={handleWhatsAppConfirmation}><Icon><LuMessageCircle /></Icon>Kirim Konfirmasi WhatsApp</Button>
                      </Box>
                    </HStack>
                  </Box>
                )}
                {reRegistrationStatus === "berhasil" && (
                  <Box bg="green.50" borderWidth="1px" borderColor="green.200" borderRadius="xl" p="5">
                    <HStack gap="3" alignItems="flex-start">
                      <Icon color="green.600" fontSize="xl"><LuUsers /></Icon>
                      <Box flex="1">
                        <Text fontSize="sm" fontWeight="bold" color="green.900">Daftar ulang telah terkonfirmasi</Text>
                        <Text fontSize="sm" color="green.800" mt="1">Silakan bergabung ke grup WhatsApp untuk menerima informasi berikutnya.</Text>
                        {reRegistrationFee?.whatsappGroupLink ? <Button as="a" href={reRegistrationFee.whatsappGroupLink} target="_blank" rel="noreferrer" colorPalette="green" mt="3"><Icon><LuExternalLink /></Icon>Gabung Grup WhatsApp</Button> : <Text fontSize="xs" color="green.700" mt="3">Link grup WhatsApp belum tersedia. Silakan hubungi admin.</Text>}
                      </Box>
                    </HStack>
                  </Box>
                )}
                {(reRegistrationStatus === "proses" || reRegistrationStatus === "berhasil") && reRegistrationProof && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="2">Bukti transfer yang dikirim</Text>
                    <Box position="relative" display="inline-block">
                      <Image src={reRegistrationProof} alt="Bukti transfer daftar ulang" maxW="320px" borderRadius="lg" borderWidth="1px" borderColor="gray.200" cursor="zoom-in" onClick={() => setFullImg(reRegistrationProof)} _hover={{ opacity: 0.85 }} transition="opacity 0.15s" />
                      {reRegistrationStatus === "proses" && (
                        <Button size="xs" variant="solid" colorPalette="red" position="absolute" top="2" right="2" loading={resettingReRegistration} onClick={handleDeleteReRegistrationProof}><Icon><LuTrash2 /></Icon>Hapus</Button>
                      )}
                    </Box>
                  </Box>
                )}
                {reRegistrationStatus === "belum_bayar" && (
                  <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" p="5">
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Upload bukti pembayaran daftar ulang</Text>
                    {reRegistrationProof ? (
                      <Box position="relative" display="inline-block" mb="4">
                        <Image src={reRegistrationProof} alt="Bukti transfer daftar ulang" maxW="320px" borderRadius="lg" borderWidth="1px" borderColor="gray.200" cursor="zoom-in" onClick={() => setFullImg(reRegistrationProof)} _hover={{ opacity: 0.85 }} transition="opacity 0.15s" />
                        <Button size="xs" variant="solid" colorPalette="red" position="absolute" top="2" right="2" onClick={handleDeleteReRegistrationProof}><Icon><LuTrash2 /></Icon>Hapus</Button>
                      </Box>
                    ) : (
                      <ImageUpload value={reRegistrationProof} onChange={setReRegistrationProof} label="Klik untuk upload bukti transfer" size={220} />
                    )}
                    <Button colorPalette="blue" loading={submittingReRegistration} onClick={handleReRegistrationPayment} mt="4" width="full" disabled={!reRegistrationProof}><Icon><LuUpload /></Icon>Kirim Bukti Daftar Ulang</Button>
                  </Box>
                )}
              </VStack>
            )}
          </Box>
        </Grid>

        <Box bg="blue.50" borderRadius="xl" borderWidth="1px" borderColor="blue.200" p="5" mt="6"><Text fontSize="xs" color="blue.700" textAlign="center" fontWeight="medium">Klik setiap tahapan di sebelah kiri untuk melihat detailnya. Simpan link ini untuk memantau progress pendaftaran Anda.</Text></Box>
      </Container>

      {/* Fullscreen image lightbox */}
      {fullImg && (
        <Box
          position="fixed"
          inset="0"
          bg="blackAlpha.900"
          zIndex="tooltip"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="4"
          onClick={() => setFullImg(null)}
          cursor="zoom-out"
        >
          <Box maxW="95vw" maxH="95vh" position="relative">
            <Image
              src={fullImg}
              alt="Preview"
              maxW="95vw"
              maxH="95vh"
              objectFit="contain"
              borderRadius="xl"
              shadow="2xl"
            />
            <Box
              position="absolute"
              top="2"
              right="2"
              bg="blackAlpha.700"
              borderRadius="full"
              w="8"
              h="8"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Text color="white" fontWeight="bold" fontSize="lg" lineHeight="1">×</Text>
            </Box>
          </Box>
        </Box>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <Box
          position="fixed"
          inset="0"
          bg="blackAlpha.600"
          zIndex="modal"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="4"
          onClick={() => setShowPayment(false)}
        >
          <Box
            bg="white"
            borderRadius="2xl"
            shadow="2xl"
            maxW="md"
            w="full"
            maxH="90vh"
            overflowY="auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Box bg="orange.500" px="6" py="5" borderTopRadius="2xl">
              <HStack gap="3">
                <Box w="10" h="10" bg="white" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
                  <Icon color="orange.500" fontSize="lg"><LuWallet /></Icon>
                </Box>
                <VStack gap="0" alignItems="flex-start">
                  <Text fontSize="xs" color="whiteAlpha.800" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">Pembayaran</Text>
                  <Text fontSize="lg" fontWeight="bold" color="white">Biaya Pendaftaran</Text>
                </VStack>
              </HStack>
            </Box>

            <Box p="6">
              <Stack gap="5">
                {/* Amount */}
                <Box bg="gray.50" borderRadius="lg" p="4" textAlign="center">
                  <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide" mb="1">Total Biaya</Text>
                  <Text fontSize="3xl" fontWeight="black" color="gray.900">
                    {fee?.amount ? formatRupiah(fee.amount) : "Rp 0"}
                  </Text>
                </Box>

                {/* Upload proof */}
                <Stack gap="3">
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">Upload Bukti Pembayaran (Opsional)</Text>
                  <ImageUpload
                    value={paymentProof}
                    onChange={setPaymentProof}
                    label="Klik untuk upload bukti"
                    size={160}
                  />
                </Stack>

                <HStack gap="3">
                  <Button variant="outline" flex="1" onClick={() => setShowPayment(false)}>Batal</Button>
                  <Button colorPalette="orange" flex="1" loading={paying} onClick={handlePay}>
                    <Icon><LuUpload /></Icon>
                    Sudah Bayar
                  </Button>
                </HStack>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
