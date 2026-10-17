import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Text,
  VStack,
  Badge,
  Spinner,
} from "@chakra-ui/react"
import { useState, useEffect, useCallback } from "react"
import {
  LuArrowLeft,
  LuCircleCheck,
  LuUsers,
  LuCalendar,
  LuTrendingUp,
  LuSearch,
  LuDownload,
  LuEye,
  LuLink,
  LuCopy,
  LuClock,
  LuCircleX,
  LuFileText,
  LuSettings,
  LuPlus,
  LuTrash2,
  LuPencil,
  LuSend,
  LuClipboardList,
  LuWallet,
  LuGraduationCap,
  LuCircle,
  LuMessageCircle,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu"
import {
  getStudents,
  getDocumentLinkByStudentId,
  createDocumentLink,
  deactivateDocumentLink,
  getDocumentsByStudentId,
  getDocumentSettings,
  createDocumentSetting,
  updateDocumentSetting,
  deleteDocumentSetting,
  type Student,
  type DocumentLink,
  type UploadedDocument,
  type DocumentSetting,
  confirmPayment,
} from "@/store"
import { buildGoogleFormUrl } from "@/utils/googleForm"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { QrCode } from "@/components/ui/qr-code"
import { toaster } from "@/components/ui/toaster"

function safeFormatDate(value: string | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return opts ? d.toLocaleString("id-ID", opts) : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export default function SuperAdminReports() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)
  const [detailDocs, setDetailDocs] = useState<UploadedDocument[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null)
  const [docLinkModalStudent, setDocLinkModalStudent] = useState<Student | null>(null)
  const [activeLink, setActiveLink] = useState<DocumentLink | null>(null)
  const [copied, setCopied] = useState(false)

  const [linkCache, setLinkCache] = useState<Record<string, DocumentLink | null>>({})
  const [docCountCache, setDocCountCache] = useState<Record<string, number>>({})

  // Document settings state
  const [docSettings, setDocSettings] = useState<DocumentSetting[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<DocumentSetting | null>(null)
  const [showSettingForm, setShowSettingForm] = useState(false)
  const [settingForm, setSettingForm] = useState({ label: "", required: false, isActive: true })
  const [settingsLoading, setSettingsLoading] = useState(false)

  // Payment confirmation modal state
  const [paymentModalStudent, setPaymentModalStudent] = useState<Student | null>(null)
  const [paymentConfirming, setPaymentConfirming] = useState(false)
  const [fullPreviewProof, setFullPreviewProof] = useState(false)

  // Re-registration full preview state
  const [reRegFullPreview, setReRegFullPreview] = useState(false)
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null)

  // Interview schedule modal state
  const [interviewModalStudent, setInterviewModalStudent] = useState<Student | null>(null)

  const refreshDocSettings = useCallback(async () => {
    try {
      const settings = await getDocumentSettings()
      setDocSettings(settings)
    } catch {
      setDocSettings([])
    }
  }, [])

  useEffect(() => {
    getStudents().then(async (list) => {
      setStudents(list)
      const links: Record<string, DocumentLink | null> = {}
      const counts: Record<string, number> = {}
      await Promise.all(list.map(async (s) => {
        links[s.id] = await getDocumentLinkByStudentId(s.id).catch(() => null)
        const docs = await getDocumentsByStudentId(s.id).catch(() => [])
        counts[s.id] = docs.length
      }))
      setLinkCache(links)
      setDocCountCache(counts)
    }).catch(() => {})
  }, [])

  const refreshLink = async (studentId: string) => {
    const link = await getDocumentLinkByStudentId(studentId)
    setActiveLink(link)
    setLinkCache((prev) => ({ ...prev, [studentId]: link }))
  }

  const todayStr = new Date().toDateString()
  const todayCount = students.filter((s) => {
    const d = new Date(s.registeredAt)
    return !isNaN(d.getTime()) && d.toDateString() === todayStr
  }).length
  const thisMonth = students.filter((s) => {
    const d = new Date(s.registeredAt)
    if (isNaN(d.getTime())) return false
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const filtered = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.noHp.includes(search)
  )

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.registeredAt).getTime()
    const db = new Date(b.registeredAt).getTime()
    return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da)
  })

  const handleExport = () => {
    const header = "Nama,Kelas,Email,No HP,Tanggal Daftar\n"
    const rows = students.map((s) =>
      `"${s.nama}","${s.pilihanKelas}","${s.email}","${s.noHp}","${safeFormatDate(s.registeredAt)}"`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "laporan-pendaftaran.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const openDetail = async (student: Student) => {
    setDetailStudent(student)
    setDetailLoading(true)
    try {
      const [docs, link] = await Promise.all([
        getDocumentsByStudentId(student.id).catch(() => []),
        getDocumentLinkByStudentId(student.id).catch(() => null),
      ])
      setDetailDocs(docs)
    } catch {
      setDetailDocs([])

    }
    setDetailLoading(false)
  }

  const closeDetail = () => {
    setDetailStudent(null)
    setDetailDocs([])
    setPreviewDoc(null)
  }

  const openDocLinkModal = (student: Student) => {
    setDocLinkModalStudent(student)
    refreshLink(student.id)
  }

  const handleShareDocLink = async () => {
    if (!docLinkModalStudent) return
    try {
      const link = await createDocumentLink(docLinkModalStudent.id, docLinkModalStudent.nama)
      setActiveLink(link)
      setLinkCache((prev) => ({ ...prev, [docLinkModalStudent.id]: link }))
      toaster.create({ title: "Link dokumen diaktifkan", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengaktifkan link", type: "error" })
    }
  }

  const handleDeactivateDocLink = async () => {
    if (!activeLink) return
    await deactivateDocumentLink(activeLink.id)
    setActiveLink(null)
    setLinkCache((prev) => ({ ...prev, [activeLink.studentId]: null }))
    toaster.create({ title: "Link dinonaktifkan", type: "info" })
  }

  const docShareUrl = activeLink
    ? `${window.location.origin}${window.location.pathname}#/dokumen-public/${activeLink.token}`
    : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(docShareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendTrackingWhatsApp = (student: Student) => {
    if (!student.noHp || !student.trackingToken) {
      toaster.create({ title: "Nomor WhatsApp atau link tracking belum tersedia", type: "error" })
      return
    }
    const phone = student.noHp.replace(/\D/g, "").replace(/^0/, "62")
    const trackingUrl = `${window.location.origin}${window.location.pathname}#/tracking/${student.trackingToken}`
    const message = [
      `Yth. ${student.nama},`,
      "",
      "Terima kasih telah melakukan pendaftaran di Aero Forte Indonesia.",
      "",
      "Untuk memantau status pendaftaran, pembayaran, jadwal wawancara, dan informasi kelulusan, silakan membuka link tracking berikut:",
      trackingUrl,
      "",
      "Simpan link ini dengan baik. Anda dapat membukanya kapan saja untuk melihat pembaruan proses pendaftaran.",
      "",
      "Salam,",
      "Aero Forte Indonesia",
    ].join("\\n")
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
  }

  // ---- Document Settings handlers ----
  const openSettings = () => {
    refreshDocSettings()
    setSettingsOpen(true)
  }

  const openAddSetting = () => {
    setEditingSetting(null)
    setShowSettingForm(true)
    setSettingForm({ label: "", required: false, isActive: true })
  }

  const openEditSetting = (s: DocumentSetting) => {
    setEditingSetting(s)
    setShowSettingForm(true)
    setSettingForm({ label: s.label, required: s.required, isActive: s.isActive })
  }

  const handleSaveSetting = async () => {
    if (!settingForm.label.trim()) {
      toaster.create({ title: "Label dokumen wajib diisi", type: "error" })
      return
    }
    setSettingsLoading(true)
    try {
      if (editingSetting) {
        await updateDocumentSetting(editingSetting.id, settingForm)
        toaster.create({ title: "Setting dokumen diperbarui", type: "success" })
      } else {
        await createDocumentSetting({ ...settingForm, fileType: "any" })
        toaster.create({ title: "Setting dokumen ditambahkan", type: "success" })
      }
      setEditingSetting(null)
      setShowSettingForm(false)
      await refreshDocSettings()
    } catch {
      toaster.create({ title: "Gagal menyimpan setting", type: "error" })
    }
    setSettingsLoading(false)
  }

  const handleDeleteSetting = async (id: string) => {
    try {
      await deleteDocumentSetting(id)
      await refreshDocSettings()
      toaster.create({ title: "Setting dokumen dihapus", type: "info" })
    } catch {
      toaster.create({ title: "Gagal menghapus setting", type: "error" })
    }
  }

  const handleConfirmPayment = async (studentId: string) => {
    setPaymentConfirming(true)
    try {
      await confirmPayment(studentId)
      setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, paymentStatus: "berhasil" } : s))
      toaster.create({ title: "Pembayaran dikonfirmasi", type: "success" })
      setPaymentModalStudent(null)
    } catch {
      toaster.create({ title: "Gagal mengkonfirmasi pembayaran", type: "error" })
    }
    setPaymentConfirming(false)
  }

  const openInterviewModal = (student: Student) => {
    setInterviewModalStudent(student)
  }

  const handleSendWaSchedule = () => {
    if (!interviewModalStudent || !interviewModalStudent.interviewDate || !interviewModalStudent.interviewTime) return
    const formattedDate = new Date(interviewModalStudent.interviewDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    const message = `Halo ${interviewModalStudent.nama}, kami dari AERO FORTE INDONESIA menginformasikan bahwa jadwal wawancara Anda adalah:\n\nTanggal: ${formattedDate}\nJam: ${interviewModalStudent.interviewTime} WIB\n\nMohon hadir tepat waktu dan gunakan pakaian yang rapi dan sopan. Terima kasih.`
    const phone = interviewModalStudent.noHp.replace(/[^0-9]/g, "").replace(/^0/, "62")
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, "_blank")
  }

  const handleToggleSettingActive = async (s: DocumentSetting) => {
    try {
      await updateDocumentSetting(s.id, { isActive: !s.isActive })
      await refreshDocSettings()
    } catch {
      toaster.create({ title: "Gagal mengubah status", type: "error" })
    }
  }

  // ---- Detail view ----
  if (detailStudent) {
    return (
      <Stack gap="6">
        <HStack justify="space-between" flexWrap="wrap" gap="4">
          <HStack gap="4">
            <Button variant="ghost" size="sm" onClick={closeDetail}>
              <Icon><LuArrowLeft /></Icon>
              Kembali
            </Button>
            <Stack gap="0">
              <Heading fontSize="2xl" fontWeight="bold" color="gray.900">{detailStudent.nama}</Heading>
              <Text color="gray.500" fontSize="sm">Detail Pendaftar</Text>
            </Stack>
          </HStack>
          <Badge colorPalette="blue" size="lg" px="4" borderRadius="full">{detailStudent.pilihanKelas}</Badge>
        </HStack>

        {detailLoading ? (
          <Stack gap="4" align="center" py="20">
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.500">Memuat data pendaftar...</Text>
          </Stack>
        ) : (
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6" alignItems="start">
            <Stack gap="6">
              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Informasi Pendaftaran</Text>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  <DetailItem label="Nama" value={detailStudent.nama} />
                  <DetailItem label="Pilihan Kelas" value={detailStudent.pilihanKelas} />
                  <DetailItem label="Email" value={detailStudent.email} />
                  <DetailItem label="No HP" value={detailStudent.noHp} />
                  <DetailItem label="No KTP" value={detailStudent.noKtp} />
                  <DetailItem label="Tanggal Daftar" value={safeFormatDate(detailStudent.registeredAt, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                </Grid>
              </Box>

              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Data Pribadi</Text>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  <DetailItem label="Tempat Lahir" value={detailStudent.tempatLahir} />
                  <DetailItem label="Tanggal Lahir" value={detailStudent.tanggalLahir} />
                  <DetailItem label="Alamat" value={detailStudent.alamat} />
                  <DetailItem label="Kode Pos" value={detailStudent.kodePos} />
                  <DetailItem label="Tinggi Badan" value={detailStudent.tinggiBadan ? `${detailStudent.tinggiBadan} cm` : "-"} />
                  <DetailItem label="Berat Badan" value={detailStudent.beratBadan ? `${detailStudent.beratBadan} kg` : "-"} />
                </Grid>
              </Box>

              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Riwayat Pendidikan</Text>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  <DetailItem label="SD" value={detailStudent.namaSD} />
                  <DetailItem label="Tahun Lulus SD" value={detailStudent.tahunLulusSD} />
                  <DetailItem label="SMP" value={detailStudent.namaSMP} />
                  <DetailItem label="Tahun Lulus SMP" value={detailStudent.tahunLulusSMP} />
                  <DetailItem label="SMA" value={detailStudent.namaSMA} />
                  <DetailItem label="Tahun Lulus SMA" value={detailStudent.tahunLulusSMA} />
                  <DetailItem label="Diploma" value={detailStudent.perguruanTinggiDiploma} />
                  <DetailItem label="Tahun Lulus Diploma" value={detailStudent.tahunLulusDiploma} />
                  <DetailItem label="S1" value={detailStudent.perguruanTinggiS1} />
                </Grid>
              </Box>

              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Data Orang Tua</Text>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  <DetailItem label="Nama Ayah" value={detailStudent.namaAyah} />
                  <DetailItem label="TT Lahir Ayah" value={detailStudent.tempatTanggalLahirAyah} />
                  <DetailItem label="Nama Ibu" value={detailStudent.namaIbu} />
                  <DetailItem label="TT Lahir Ibu" value={detailStudent.tempatTanggalLahirIbu} />
                </Grid>
              </Box>
            </Stack>

            <Stack gap="6" position="sticky" top="4">
              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <HStack justify="space-between" mb="4">
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">Dokumen Terupload</Text>
                  <Badge colorPalette={detailDocs.length > 0 ? "green" : "gray"} size="sm">{detailDocs.length} file</Badge>
                </HStack>
                {detailDocs.length === 0 ? (
                  <Box bg="gray.50" rounded="lg" p="6" textAlign="center">
                    <VStack gap="2">
                      <Icon fontSize="2xl" color="gray.300"><LuFileText /></Icon>
                      <Text fontSize="sm" color="gray.500">Belum ada dokumen diupload</Text>
                    </VStack>
                  </Box>
                ) : (
                  <VStack gap="3" alignItems="stretch">
                    {detailDocs.map((doc) => (
                      <Box
                        key={doc.id}
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.200"
                        rounded="lg"
                        p="4"
                        cursor="pointer"
                        _hover={{ borderColor: "blue.300", bg: "blue.50" }}
                        transition="all 0.15s"
                        onClick={() => setPreviewDoc(doc)}
                      >
                        <HStack gap="3" justify="space-between">
                          <HStack gap="3">
                            <Box w="10" h="10" bg="white" rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0} overflow="hidden">
                              {doc.fileType.startsWith("image/") ? (
                                <img src={doc.filePath} alt={doc.fileName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                              ) : (
                                <Icon color="blue.600"><LuFileText /></Icon>
                              )}
                            </Box>
                            <VStack gap="0" alignItems="flex-start">
                              <Text fontSize="sm" fontWeight="semibold" color="gray.800">{doc.documentLabel || doc.fileName}</Text>
                              <Text fontSize="xs" color="gray.500">
                                {safeFormatDate(doc.createdAt, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </Text>
                            </VStack>
                          </HStack>
                          <Badge colorPalette="green" size="sm">
                            <Icon mr="1"><LuCircleCheck /></Icon>
                            Terverifikasi
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              {detailStudent.trackingToken && (
                <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">QR Code Tracking</Text>
                  <VStack gap="3">
                    <QrCode
                      value={`${window.location.origin}${window.location.pathname}#/tracking/${detailStudent.trackingToken}`}
                      size={160}
                      downloadable
                      downloadName={`qr-tracking-${detailStudent.nama.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.jpg`}
                      downloadTitle={detailStudent.nama}
                      downloadInfo={[
                        { label: "Kelas", value: detailStudent.pilihanKelas },
                        { label: "Email", value: detailStudent.email },
                        { label: "No HP", value: detailStudent.noHp },
                        { label: "Daftar", value: safeFormatDate(detailStudent.registeredAt) },
                      ]}
                    />
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Scan QR code ini untuk membuka halaman tracking pendaftaran peserta.
                    </Text>
                    <HStack gap="2" w="full">
                      <Input
                        value={`${window.location.origin}${window.location.pathname}#/tracking/${detailStudent.trackingToken}`}
                        readOnly
                        fontSize="xs"
                        bg="gray.50"
                      />
                      <Button
                        size="sm"
                        colorPalette="blue"
                        flexShrink={0}
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/tracking/${detailStudent.trackingToken}`)
                          toaster.create({ title: "Link disalin", type: "success" })
                        }}
                      >
                        <Icon><LuCopy /></Icon>
                      </Button>
                    </HStack>
                    <Button colorPalette="green" w="full" onClick={() => handleSendTrackingWhatsApp(detailStudent)}>
                      <Icon><LuMessageCircle /></Icon>
                      Kirim Link Tracking via WhatsApp
                    </Button>
                  </VStack>
                </Box>
              )}

              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Status Tracking Pendaftaran</Text>
                <VStack gap="3" alignItems="stretch">
                  {[
                    { label: "Isi Data Diri", icon: LuClipboardList, done: true, info: "Data sudah terisi saat pendaftaran" },
                    { label: "Upload Dokumen", icon: LuFileText, done: detailDocs.length > 0, info: detailDocs.length > 0 ? `${detailDocs.length} dokumen terupload` : "Belum ada dokumen diupload" },
                    { label: "Pembayaran", icon: LuWallet, done: detailStudent.paymentStatus === "berhasil", info: detailStudent.paymentStatus === "berhasil" ? "Pembayaran terkonfirmasi" : detailStudent.paymentStatus === "proses" ? "Menunggu konfirmasi admin" : "Belum membayar" },
                    { label: "Wawancara", icon: LuUsers, done: detailStudent.interviewStatus === "lulus", info: detailStudent.interviewStatus === "lulus" ? "Wawancara lulus" : detailStudent.interviewStatus === "terjadwal" ? "Wawancara terjadwal" : detailStudent.interviewStatus === "tidak_lulus" ? "Belum lulus wawancara" : "Belum dijadwalkan" },
                    { label: "Surat Kelulusan", icon: LuGraduationCap, done: detailStudent.finalStatus === "siap_diklat", info: detailStudent.finalStatus === "siap_diklat" ? "Surat kelulusan tersedia" : "Belum tersedia" },
                    { label: "Daftar Ulang", icon: LuWallet, done: detailStudent.reRegistrationStatus === "berhasil", info: detailStudent.reRegistrationStatus === "berhasil" ? "Daftar ulang terkonfirmasi" : detailStudent.reRegistrationStatus === "proses" ? "Bukti transfer menunggu verifikasi" : "Belum mengirim bukti transfer" },
                  ].map((step, i) => (
                    <HStack key={i} gap="3" align="flex-start">
                      <Box
                        w="9"
                        h="9"
                        rounded="full"
                        bg={step.done ? "green.500" : "gray.100"}
                        color={step.done ? "white" : "gray.400"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon fontSize="sm">{step.done ? <LuCircleCheck /> : <step.icon />}</Icon>
                      </Box>
                      <VStack gap="0" alignItems="flex-start" flex="1">
                        <HStack gap="2">
                          <Text fontSize="sm" fontWeight="semibold" color={step.done ? "green.700" : "gray.700"}>{i + 1}. {step.label}</Text>
                          {step.done ? (
                            <Badge colorPalette="green" size="sm">Selesai</Badge>
                          ) : (
                            <Badge colorPalette="gray" size="sm">Belum</Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">{step.info}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* Re-registration Payment Status */}
              {detailStudent.interviewStatus === "lulus" && (
                <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                  <HStack gap="3" mb="4">
                    <Icon color="blue.500"><LuWallet /></Icon>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700">Status Pembayaran Daftar Ulang</Text>
                  </HStack>
                  {detailStudent.reRegistrationStatus === "berhasil" ? (
                    <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="lg" p="4" textAlign="center">
                      <Icon fontSize="2xl" color="green.500"><LuCircleCheck /></Icon>
                      <Text fontSize="sm" fontWeight="bold" color="green.700" mt="2">Sudah Bayar</Text>
                      <Text fontSize="xs" color="green.600" mt="1">Daftar ulang terkonfirmasi</Text>
                    </Box>
                  ) : detailStudent.reRegistrationStatus === "proses" ? (
                    <VStack gap="3">
                      {detailStudent.reRegistrationProof && (
                        <Box rounded="xl" overflow="hidden" border="1px solid" borderColor="gray.200" cursor="zoom-in" onClick={() => setReRegFullPreview(true)} _hover={{ borderColor: "blue.300" }} transition="all 0.15s" w="full">
                          <img src={detailStudent.reRegistrationProof} alt="Bukti daftar ulang" style={{ width: "100%", maxHeight: "250px", objectFit: "contain", background: "#f7f7f7" }} />
                        </Box>
                      )}
                      <Box bg="orange.50" border="1px solid" borderColor="orange.200" rounded="lg" p="3" textAlign="center" w="full">
                        <Text fontSize="sm" fontWeight="bold" color="orange.700">Proses</Text>
                        <Text fontSize="xs" color="orange.600" mt="1">Menunggu verifikasi official admin</Text>
                      </Box>
                    </VStack>
                  ) : (
                    <Box bg="gray.50" border="1px solid" borderColor="gray.200" rounded="lg" p="4" textAlign="center">
                      <Text fontSize="sm" color="gray.500">Belum mengirim bukti transfer</Text>
                    </Box>
                  )}
                </Box>
              )}
            </Stack>
          </Grid>
        )}

        {/* Document Preview Dialog */}
        <DialogRoot open={!!previewDoc} onOpenChange={(e) => { if (!e.open) setPreviewDoc(null) }} size="md">
          <DialogContent>
            {previewDoc && (
              <>
                <DialogHeader>
                  <DialogTitle>{previewDoc.documentLabel || previewDoc.fileName}</DialogTitle>
                </DialogHeader>
                <DialogBody p="2" overflow="auto">
                  {previewDoc.fileType.startsWith("image/") ? (
                    <img
                      src={previewDoc.filePath}
                      alt={previewDoc.fileName}
                      style={{ maxWidth: "100%", maxHeight: "50vh", objectFit: "contain", display: "block", margin: "0 auto", borderRadius: "8px" }}
                    />
                  ) : (
                    <iframe
                      src={previewDoc.filePath}
                      title={previewDoc.fileName}
                      style={{ width: "100%", height: "50vh", border: "none", borderRadius: "8px", background: "white" }}
                    />
                  )}
                </DialogBody>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPreviewDoc(null)}>Tutup</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </DialogRoot>
      </Stack>
    )
  }

  // ---- List view ----
  return (
    <Stack gap="8">
      <HStack justify="space-between" flexWrap="wrap" gap="4">
        <Stack gap="1">
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Laporan Pendaftaran</Heading>
          <Text color="gray.500" fontSize="sm">Data seluruh siswa yang mendaftar</Text>
        </Stack>
        <HStack gap="3">
          <Button variant="outline" onClick={openSettings}>
            <Icon><LuSettings /></Icon>
            Setting Dokumen
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Icon><LuDownload /></Icon>
            Export CSV
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="6">
        {[
          { label: "Total Pendaftar", value: students.length, icon: LuUsers, color: "blue.500", bg: "blue.50" },
          { label: "Hari Ini", value: todayCount, icon: LuCalendar, color: "orange.500", bg: "orange.50" },
          { label: "Bulan Ini", value: thisMonth, icon: LuTrendingUp, color: "green.500", bg: "green.50" },
        ].map((card) => (
          <Box key={card.label} bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
            <HStack justify="space-between" align="start">
              <Stack gap="1">
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{card.label}</Text>
                <Text fontSize="3xl" fontWeight="black" color="gray.900">{card.value}</Text>
              </Stack>
              <Box w="12" h="12" bg={card.bg} rounded="xl" display="flex" alignItems="center" justifyContent="center">
                <Icon color={card.color} fontSize="xl"><card.icon /></Icon>
              </Box>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" overflow="hidden">
        <Box p="5" borderBottom="1px solid" borderColor="gray.200">
          <HStack gap="3">
            <Box pos="relative" flex="1" maxW="sm">
              <Box pos="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.500" zIndex="1">
                <Icon fontSize="sm"><LuSearch /></Icon>
              </Box>
              <Input pl="9" placeholder="Cari nama, email, atau no HP..." value={search} onChange={(e) => setSearch(e.target.value)} size="sm" />
            </Box>
            <Text fontSize="sm" color="gray.500">{sorted.length} data</Text>
          </HStack>
        </Box>

        <Stack display={{ base: "flex", md: "none" }} gap="3" p="3">
          {sorted.map((s, i) => {
            const isExpanded = expandedStudentId === s.id
            const hasSchedule = s.interviewStatus === "terjadwal" || s.interviewStatus === "lulus" || s.interviewStatus === "tidak_lulus"
            const hasResult = s.interviewStatus === "lulus" || s.interviewStatus === "tidak_lulus"
            const link = linkCache[s.id] ?? null
            const docs = docCountCache[s.id] ?? 0
            return (
              <Box
                key={s.id}
                bg="white"
                border="1px solid"
                borderColor={isExpanded ? "blue.300" : "gray.200"}
                rounded="xl"
                p="4"
                cursor="pointer"
                onClick={() => setExpandedStudentId(isExpanded ? null : s.id)}
                transition="all 0.15s"
                _active={{ transform: "scale(0.99)" }}
              >
                <HStack justify="space-between" gap="3">
                  <HStack gap="3" minW="0">
                    <Box w="9" h="9" bg="blue.100" rounded="full" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                      <Text fontWeight="bold" fontSize="xs" color="blue.600">{s.nama.slice(0, 2).toUpperCase()}</Text>
                    </Box>
                    <Stack gap="0" minW="0">
                      <Text fontWeight="semibold" fontSize="sm" color="gray.900" truncate>{s.nama}</Text>
                      <Text fontSize="xs" color="gray.500" truncate>{s.email || "Email belum diisi"}</Text>
                    </Stack>
                  </HStack>
                  <Icon color="gray.500" flexShrink={0}>{isExpanded ? <LuChevronUp /> : <LuChevronDown />}</Icon>
                </HStack>
                <HStack mt="3" gap="2" flexWrap="wrap">
                  <Badge colorPalette="blue" variant="subtle" fontSize="xs">{s.pilihanKelas}</Badge>
                  {hasResult ? (
                    <Badge colorPalette={s.interviewStatus === "lulus" ? "green" : "red"} fontSize="xs">{s.interviewStatus === "lulus" ? "Lulus" : "Tidak Lulus"}</Badge>
                  ) : hasSchedule ? (
                    <Badge colorPalette="blue" fontSize="xs">Wawancara</Badge>
                  ) : (
                    <Badge colorPalette="orange" fontSize="xs">Proses</Badge>
                  )}
                </HStack>
                {isExpanded && (
                  <Stack gap="3" mt="4" pt="4" borderTop="1px solid" borderColor="gray.100">
                    <Grid templateColumns="1fr 1fr" gap="3">
                      <DetailItem label="No HP" value={s.noHp} />
                      <DetailItem label="Tanggal Daftar" value={safeFormatDate(s.registeredAt)} />
                      <DetailItem label="Pembayaran" value={s.paymentStatus === "berhasil" ? "Telah Bayar" : s.paymentStatus === "proses" ? "Menunggu Konfirmasi" : "Belum Bayar"} />
                      <DetailItem label="Daftar Ulang" value={s.interviewStatus === "lulus" ? (s.reRegistrationStatus === "berhasil" ? "Sudah Bayar" : s.reRegistrationStatus === "proses" ? "Proses" : "Belum Bayar") : "-"} />
                      <DetailItem label="Dokumen" value={`${docs} file${docs === 1 ? "" : "s"}`} />
                      <DetailItem label="Link Dokumen" value={link ? "Aktif" : "Belum Aktif"} />
                    </Grid>
                    <HStack gap="2" flexWrap="wrap">
                      <Button size="sm" colorPalette="blue" variant="outline" onClick={(e) => { e.stopPropagation(); openDetail(s) }}>
                        <Icon><LuEye /></Icon>
                        Lihat Detail
                      </Button>
                      <Button size="sm" variant="outline" colorPalette={link ? "green" : "orange"} onClick={(e) => { e.stopPropagation(); openDocLinkModal(s) }}>
                        <Icon><LuLink /></Icon>
                        Link Dokumen
                      </Button>
                      <Button size="sm" variant="outline" colorPalette="blue" onClick={(e) => { e.stopPropagation(); window.open(buildGoogleFormUrl(s), "_blank", "noopener,noreferrer") }}>
                        <Icon><LuSend /></Icon>
                        Google Form
                      </Button>
                    </HStack>
                  </Stack>
                )}
              </Box>
            )
          })}
          {sorted.length === 0 && <Text textAlign="center" color="gray.500" py="8">Tidak ada data ditemukan</Text>}
        </Stack>

        <Table.Root display={{ base: "none", md: "table" }}>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">#</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Nama</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>Kelas</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Email</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>No HP</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Tanggal Daftar</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", lg: "table-cell" }}>Pembayaran</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center">Status</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center" display={{ base: "none", xl: "table-cell" }}>Daftar Ulang</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center">Aksi</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((s, i) => {
              const link = linkCache[s.id] ?? null
              const docs = docCountCache[s.id] ?? 0
              return (
                <Table.Row key={s.id} _hover={{ bg: "bg.subtle" }} transition="background 0.15s">
                  <Table.Cell><Text fontSize="sm" color="gray.500">{i + 1}</Text></Table.Cell>
                  <Table.Cell>
                    <HStack gap="3">
                      <Box w="8" h="8" bg="blue.100" rounded="full" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                        <Text fontWeight="bold" fontSize="xs" color="blue.600">{s.nama.slice(0, 2).toUpperCase()}</Text>
                      </Box>
                      <Text fontWeight="medium" fontSize="sm" color="gray.900">{s.nama}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell display={{ base: "none", md: "table-cell" }}><Text fontSize="sm" color="gray.500">{s.pilihanKelas}</Text></Table.Cell>
                  <Table.Cell><Text fontSize="sm" color="gray.500">{s.email}</Text></Table.Cell>
                  <Table.Cell display={{ base: "none", md: "table-cell" }}><Text fontSize="sm" color="gray.500">{s.noHp}</Text></Table.Cell>
                  <Table.Cell><Text fontSize="sm" color="gray.500">{safeFormatDate(s.registeredAt)}</Text></Table.Cell>
                  <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                    {s.paymentStatus === "berhasil" ? (
                      <Badge colorPalette="green" size="sm" variant="solid">Telah Bayar</Badge>
                    ) : s.paymentStatus === "proses" ? (
                      <Button size="xs" colorPalette="green" variant="solid" onClick={() => setPaymentModalStudent(s)}>
                        <Icon mr="1"><LuCircleCheck /></Icon>
                        Konfirmasi
                      </Button>
                    ) : (
                      <Badge colorPalette="red" size="sm" variant="subtle">Belum Bayar</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap="1" justifyContent="center">
                      {s.interviewStatus === "lulus" ? (
                        <Badge colorPalette="green" size="sm" variant="solid">Lulus</Badge>
                      ) : s.interviewStatus === "tidak_lulus" ? (
                        <Badge colorPalette="red" size="sm" variant="solid">Tidak Lulus</Badge>
                      ) : s.interviewStatus === "terjadwal" ? (
                        <Button
                          size="xs"
                          variant="subtle"
                          colorPalette="blue"
                          onClick={() => openInterviewModal(s)}
                        >
                          <Icon mr="1"><LuCalendar /></Icon>
                          Wawancara
                        </Button>
                      ) : (
                        <Badge colorPalette="orange" size="sm" variant="subtle">Proses</Badge>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell display={{ base: "none", xl: "table-cell" }}>
                    {s.interviewStatus === "lulus" ? (
                      s.reRegistrationStatus === "berhasil" ? (
                        <Badge colorPalette="green" size="sm" variant="solid">Sudah Bayar</Badge>
                      ) : s.reRegistrationStatus === "proses" ? (
                        <Badge colorPalette="orange" size="sm" variant="subtle">Proses</Badge>
                      ) : (
                        <Badge colorPalette="red" size="sm" variant="subtle">Belum Bayar</Badge>
                      )
                    ) : (
                      <Text fontSize="xs" color="gray.300">-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap="1" justifyContent="center">
                      <Button variant="ghost" size="sm" colorPalette="blue" onClick={() => openDetail(s)} title="Lihat Detail">
                        <Icon><LuEye /></Icon>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        colorPalette={link ? "green" : "orange"}
                        onClick={() => openDocLinkModal(s)}
                        title="Link Dokumen"
                        pos="relative"
                      >
                        <Icon><LuLink /></Icon>
                        {docs > 0 && (
                          <Box pos="absolute" top="1" right="1" w="2" h="2" bg="green.500" rounded="full" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        colorPalette="blue"
                        onClick={() => {
                          const url = buildGoogleFormUrl(s)
                          window.open(url, "_blank")
                          toaster.create({ title: "Google Form dibuka", description: `Data ${s.nama} terisi otomatis di Google Form`, type: "info" })
                        }}
                        title="Kirim ke Google Form"
                      >
                        <Icon><LuSend /></Icon>
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              )
            })}
            {sorted.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={10} textAlign="center" py="12">
                  <Text color="gray.500">Tidak ada data ditemukan</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Document Link Modal */}
      <DialogRoot open={!!docLinkModalStudent} onOpenChange={(e) => { if (!e.open) { setDocLinkModalStudent(null); setActiveLink(null) } }} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Dokumen — {docLinkModalStudent?.nama}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {activeLink ? (
              <VStack gap="5">
                <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="xl" p="4" w="full" textAlign="center">
                  <HStack gap="2" justifyContent="center" mb="1">
                    <Icon color="green.500"><LuClock /></Icon>
                    <Text fontSize="xs" color="green.600" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                      Link Aktif — Berakhir {safeFormatDate(activeLink.expiresAt, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </HStack>
                </Box>

                <VStack gap="2" w="full">
                  <Text fontSize="sm" color="gray.600" fontWeight="medium">Link Upload Dokumen:</Text>
                  <HStack gap="2" w="full">
                    <Input value={docShareUrl} readOnly bg="gray.50" fontSize="xs" />
                    <Button size="sm" colorPalette="blue" onClick={handleCopy} flexShrink="0">
                      <Icon><LuCopy /></Icon>
                      {copied ? "Tersalin!" : "Salin"}
                    </Button>
                  </HStack>
                </VStack>

                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Link ini dapat diakses selama 24 jam sejak diaktifkan.
                  User yang membuka link dapat mengupload dokumen yang tersimpan dengan data pendaftaran mereka.
                </Text>
              </VStack>
            ) : (
              <VStack gap="4" textAlign="center">
                <Box w="14" h="14" bg="orange.50" rounded="full" display="flex" alignItems="center" justifyContent="center" mx="auto">
                  <Icon fontSize="2xl" color="orange.400"><LuLink /></Icon>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Bagikan link publik kepada peserta <Text as="span" fontWeight="bold" color="gray.900">{docLinkModalStudent?.nama}</Text> untuk mengupload dokumen. Link akan aktif selama 24 jam.
                </Text>
                <Text fontSize="xs" color="gray.400">
                  User yang membuka link akan melihat data pendaftarannya dan dapat mengupload dokumen yang diperlukan.
                </Text>
              </VStack>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDocLinkModalStudent(null); setActiveLink(null) }}>Tutup</Button>
            {activeLink ? (
              <Button colorPalette="red" onClick={handleDeactivateDocLink}>
                <Icon><LuCircleX /></Icon>
                Nonaktifkan Link
              </Button>
            ) : (
              <Button colorPalette="orange" onClick={handleShareDocLink}>
                <Icon><LuLink /></Icon>
                Aktifkan Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Document Settings Modal */}
      <DialogRoot open={settingsOpen} onOpenChange={(e) => { setSettingsOpen(e.open); if (!e.open) setEditingSetting(null) }} size="lg">
        <DialogContent maxW="2xl">
          <DialogHeader>
            <DialogTitle>Setting Dokumen</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="5">
              <Text fontSize="sm" color="gray.500">
                Atur jenis dokumen apa saja yang dapat diupload oleh peserta melalui link dokumen.
                Peserta dapat mengupload foto maupun PDF.
              </Text>

              {showSettingForm ? (
                <Box bg="gray.50" rounded="xl" p="5" border="1px solid" borderColor="gray.200">
                  <Stack gap="4">
                    <Field label="Nama Dokumen" required>
                      <Input
                        placeholder="Contoh: KTP, Ijazah, Pas Foto"
                        value={settingForm.label}
                        onChange={(e) => setSettingForm({ ...settingForm, label: e.target.value })}
                      />
                    </Field>
                    <HStack gap="6">
                      <HStack gap="2">
                        <Switch
                          checked={settingForm.required}
                          onChange={(e) => setSettingForm({ ...settingForm, required: e.target.checked })}
                        />
                        <Text fontSize="sm" color="gray.700">Wajib diupload</Text>
                      </HStack>
                      <HStack gap="2">
                        <Switch
                          checked={settingForm.isActive}
                          onChange={(e) => setSettingForm({ ...settingForm, isActive: e.target.checked })}
                        />
                        <Text fontSize="sm" color="gray.700">Aktif</Text>
                      </HStack>
                    </HStack>
                    <HStack gap="3">
                      <Button variant="outline" size="sm" onClick={() => { setEditingSetting(null); setShowSettingForm(false) }}>Batal</Button>
                      <Button colorPalette="orange" size="sm" loading={settingsLoading} onClick={handleSaveSetting}>
                        {editingSetting && docSettings.find((s) => s.id === editingSetting.id) ? "Perbarui" : "Simpan"}
                      </Button>
                    </HStack>
                  </Stack>
                </Box>
              ) : (
                <>
                  {docSettings.length > 0 ? (
                    <VStack gap="2" alignItems="stretch">
                      {docSettings.map((s) => (
                        <Box key={s.id} bg="white" border="1px solid" borderColor="gray.200" rounded="lg" p="4">
                          <HStack gap="3" justify="space-between">
                            <HStack gap="3">
                              <Box w="9" h="9" bg="blue.50" rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                                <Icon color="blue.600" fontSize="sm">
                                  <LuFileText />
                                </Icon>
                              </Box>
                              <VStack gap="0" alignItems="flex-start">
                                <HStack gap="2">
                                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">{s.label}</Text>
                                  {s.required && <Badge colorPalette="red" size="sm">Wajib</Badge>}
                                  {!s.isActive && <Badge colorPalette="gray" size="sm">Nonaktif</Badge>}
                                </HStack>
                                <Text fontSize="xs" color="gray.500">
                                  Foto atau PDF
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack gap="2">
                              <Switch
                                size="sm"
                                checked={s.isActive}
                                onChange={() => handleToggleSettingActive(s)}
                              />
                              <Button variant="ghost" size="sm" colorPalette="blue" onClick={() => openEditSetting(s)}>
                                <Icon><LuPencil /></Icon>
                              </Button>
                              <Button variant="ghost" size="sm" colorPalette="red" onClick={() => handleDeleteSetting(s.id)}>
                                <Icon><LuTrash2 /></Icon>
                              </Button>
                            </HStack>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Box bg="gray.50" rounded="xl" p="8" textAlign="center">
                      <VStack gap="2">
                        <Icon fontSize="2xl" color="gray.300"><LuFileText /></Icon>
                        <Text fontSize="sm" color="gray.500">Belum ada setting dokumen</Text>
                        <Text fontSize="xs" color="gray.400">Tambahkan jenis dokumen yang perlu diupload peserta</Text>
                      </VStack>
                    </Box>
                  )}
                  <Button colorPalette="orange" variant="outline" size="sm" onClick={openAddSetting}>
                    <Icon><LuPlus /></Icon>
                    Tambah Jenis Dokumen
                  </Button>
                </>
              )}
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setSettingsOpen(false); setEditingSetting(null); setShowSettingForm(false) }}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Payment Confirmation Modal */}
      <DialogRoot open={!!paymentModalStudent} onOpenChange={(e) => { if (!e.open) setPaymentModalStudent(null) }} size="md">
        <DialogContent
          w="calc(100vw - 32px)"
          maxW={{ base: "calc(100vw - 32px)", sm: "lg" }}
          maxH="calc(100dvh - 32px)"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {paymentModalStudent && (
            <>
              <DialogHeader flexShrink={0}>
                <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
              </DialogHeader>
              <DialogBody overflowY="auto" flex="1" minH="0">
                <Stack gap="4">
                  <Box bg="gray.50" rounded="lg" p="4">
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3">
                      <DetailItem label="Nama" value={paymentModalStudent.nama} />
                      <DetailItem label="Kelas" value={paymentModalStudent.pilihanKelas} />
                      <DetailItem label="Email" value={paymentModalStudent.email} />
                      <DetailItem label="No HP" value={paymentModalStudent.noHp} />
                    </Grid>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Bukti Pembayaran</Text>
                    {paymentModalStudent.paymentProof ? (
                      <Box
                        rounded="xl"
                        overflow="hidden"
                        border="1px solid"
                        borderColor="gray.200"
                        cursor="zoom-in"
                        onClick={() => setFullPreviewProof(true)}
                        _hover={{ borderColor: "blue.300" }}
                        transition="all 0.15s"
                      >
                        <img
                          src={paymentModalStudent.paymentProof}
                          alt="Bukti Pembayaran"
                          style={{ width: "100%", maxHeight: "300px", objectFit: "contain", background: "#f7f7f7" }}
                        />
                      </Box>
                    ) : (
                      <Box bg="gray.50" rounded="lg" p="8" textAlign="center">
                        <VStack gap="2">
                          <Icon fontSize="2xl" color="gray.300"><LuFileText /></Icon>
                          <Text fontSize="sm" color="gray.500">Tidak ada bukti pembayaran</Text>
                        </VStack>
                      </Box>
                    )}
                    <Text fontSize="xs" color="gray.400" mt="2" textAlign="center">
                      Klik gambar untuk melihat ukuran penuh
                    </Text>
                  </Box>
                </Stack>
              </DialogBody>
              <DialogFooter flexDirection={{ base: "column-reverse", sm: "row" }} gap="2" flexShrink={0}>
                <Button w={{ base: "full", sm: "auto" }} variant="ghost" onClick={() => setPaymentModalStudent(null)}>Batal</Button>
                <Button w={{ base: "full", sm: "auto" }} colorPalette="green" loading={paymentConfirming} onClick={() => handleConfirmPayment(paymentModalStudent.id)}>
                  <Icon><LuCircleCheck /></Icon>
                  Konfirmasi Pembayaran
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogRoot>

      {/* Interview Schedule Modal */}
      <DialogRoot open={!!interviewModalStudent} onOpenChange={(e) => { if (!e.open) setInterviewModalStudent(null) }} size="sm">
        <DialogContent
          w="calc(100vw - 32px)"
          maxW={{ base: "calc(100vw - 32px)", sm: "md" }}
          maxH="calc(100dvh - 32px)"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {interviewModalStudent && (
            <>
              <DialogHeader flexShrink={0}>
                <DialogTitle>Jadwal Wawancara</DialogTitle>
              </DialogHeader>
              <DialogBody overflowY="auto" flex="1" minH="0">
                <Stack gap="4">
                  <Box bg="gray.50" rounded="lg" p="3">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">Pendaftar</Text>
                    <Text fontSize="sm" fontWeight="bold" color="gray.900">{interviewModalStudent.nama}</Text>
                    <Text fontSize="xs" color="gray.500">{interviewModalStudent.pilihanKelas}</Text>
                  </Box>
                  {interviewModalStudent.interviewDate && interviewModalStudent.interviewTime ? (
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                      <Box bg="blue.50" rounded="lg" p="4">
                        <Text fontSize="xs" color="blue.600" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Tanggal</Text>
                        <Text fontSize="md" fontWeight="bold" color="gray.900" mt="1">
                          {new Date(interviewModalStudent.interviewDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                        </Text>
                      </Box>
                      <Box bg="blue.50" rounded="lg" p="4">
                        <Text fontSize="xs" color="blue.600" fontWeight="bold" textTransform="uppercase" letterSpacing="wide">Jam</Text>
                        <Text fontSize="md" fontWeight="bold" color="gray.900" mt="1">{interviewModalStudent.interviewTime} WIB</Text>
                      </Box>
                    </Grid>
                  ) : (
                    <Box bg="gray.50" rounded="lg" p="5" textAlign="center">
                      <Text fontSize="sm" color="gray.500">Belum ada jadwal wawancara. Jadwal diatur oleh official admin.</Text>
                    </Box>
                  )}
                  <Text fontSize="xs" color="gray.500">Klik "Kirim via WhatsApp" untuk mengirim jadwal ke nomor WA pendaftar.</Text>
                </Stack>
              </DialogBody>
              <DialogFooter flexDirection={{ base: "column-reverse", sm: "row" }} gap="2" flexShrink={0}>
                <Button w={{ base: "full", sm: "auto" }} variant="ghost" onClick={() => setInterviewModalStudent(null)}>Tutup</Button>
                <Button w={{ base: "full", sm: "auto" }} colorPalette="green" onClick={handleSendWaSchedule} disabled={!interviewModalStudent.interviewDate || !interviewModalStudent.interviewTime}>
                  <Icon><LuMessageCircle /></Icon>
                  Kirim via WhatsApp
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogRoot>

      {/* Full Preview Payment Proof */}
      <DialogRoot open={fullPreviewProof} onOpenChange={(e) => { if (!e.open) setFullPreviewProof(false) }} size="full">
        <DialogContent w="calc(100vw - 32px)" maxW="calc(100vw - 32px)" maxH="calc(100dvh - 32px)" overflow="hidden" display="flex" flexDirection="column">
          <DialogHeader flexShrink={0}>
            <DialogTitle>Bukti Pembayaran — {paymentModalStudent?.nama}</DialogTitle>
          </DialogHeader>
          <DialogBody p="2" overflow="auto" display="flex" justifyContent="center" flex="1" minH="0">
            {paymentModalStudent?.paymentProof && (
              <img
                src={paymentModalStudent.paymentProof}
                alt="Bukti Pembayaran"
                style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
              />
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFullPreviewProof(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Full Preview Re-registration Proof */}
      <DialogRoot open={reRegFullPreview} onOpenChange={(e) => { if (!e.open) setReRegFullPreview(false) }} size="full">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bukti Daftar Ulang — {detailStudent?.nama}</DialogTitle>
          </DialogHeader>
          <DialogBody p="2" overflow="auto" display="flex" justifyContent="center" flex="1" minH="0">
            {detailStudent?.reRegistrationProof && (
              <img
                src={detailStudent.reRegistrationProof}
                alt="Bukti daftar ulang"
                style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }}
              />
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReRegFullPreview(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

    </Stack>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="0">
      <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
      <Text fontSize="sm" color="gray.800" fontWeight="medium">{value || "-"}</Text>
    </Stack>
  )
}
