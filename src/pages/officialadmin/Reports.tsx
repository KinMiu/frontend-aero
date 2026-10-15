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
import { useState, useEffect } from "react"
import {
  LuArrowLeft,
  LuCircleCheck,
  LuCircleX,
  LuUsers,
  LuCalendar,
  LuSearch,
  LuDownload,
  LuClock,
  LuFileText,
  LuEye,
  LuWallet,
} from "react-icons/lu"
import {
  getStudents,
  getDocumentsByStudentId,
  scheduleInterview,
  setInterviewResult,
  confirmReRegistrationPayment,
  type Student,
  type UploadedDocument,
} from "@/store"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

function safeFormatDate(value: string | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return "-"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  return opts ? d.toLocaleString("id-ID", opts) : d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="0">
      <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">{label}</Text>
      <Text fontSize="sm" color="gray.800" fontWeight="medium">{value || "-"}</Text>
    </Stack>
  )
}

export default function OfficialReports() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [scheduleModalStudent, setScheduleModalStudent] = useState<Student | null>(null)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [scheduleZoomLink, setScheduleZoomLink] = useState("")
  const [scheduling, setScheduling] = useState(false)

  // Detail view state
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)
  const [detailDocs, setDetailDocs] = useState<UploadedDocument[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null)
  const [resultLoading, setResultLoading] = useState(false)
  const [reRegModalStudent, setReRegModalStudent] = useState<Student | null>(null)
  const [reRegConfirming, setReRegConfirming] = useState(false)
  const [reRegFullPreview, setReRegFullPreview] = useState(false)

  useEffect(() => {
    getStudents().then(setStudents).catch(() => {})
  }, [])

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
      s.email.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.registeredAt).getTime()
    const db = new Date(b.registeredAt).getTime()
    return (isNaN(db) ? 0 : db) - (isNaN(da) ? 0 : da)
  })

  const handleExport = () => {
    const header = "Nama,Kelas,Email,Tanggal Daftar\n"
    const rows = students.map((s) =>
      `"${s.nama}","${s.pilihanKelas}","${s.email}","${safeFormatDate(s.registeredAt)}"`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "laporan-pendaftaran.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const openScheduleModal = (student: Student) => {
    setScheduleModalStudent(student)
    setScheduleDate(student.interviewDate || "")
    setScheduleTime(student.interviewTime || "")
    setScheduleZoomLink(student.interviewZoomLink || "")
  }

  const handleSchedule = async () => {
    if (!scheduleModalStudent) return
    if (!scheduleDate || !scheduleTime || !scheduleZoomLink.trim()) {
      toaster.create({ title: "Tanggal, jam, dan link Zoom wawancara wajib diisi", type: "error" })
      return
    }
    setScheduling(true)
    try {
      const updated = await scheduleInterview(scheduleModalStudent.id, scheduleDate, scheduleTime, scheduleZoomLink.trim())
      setStudents((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      setScheduleModalStudent(null)
      toaster.create({ title: "Jadwal wawancara dibuat", description: `Jadwal untuk ${updated.nama} telah diperbarui`, type: "success" })
    } catch {
      toaster.create({ title: "Gagal membuat jadwal wawancara", type: "error" })
    }
    setScheduling(false)
  }

  const openDetail = async (student: Student) => {
    setDetailStudent(student)
    setDetailLoading(true)
    try {
      const docs = await getDocumentsByStudentId(student.id).catch(() => [])
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

  const handleSetResult = async (student: Student, result: "lulus" | "tidak_lulus") => {
    setResultLoading(true)
    try {
      const updated = await setInterviewResult(student.id, result)
      setStudents((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      setDetailStudent(updated)
      toaster.create({
        title: result === "lulus" ? "Peserta dinyatakan lulus" : "Peserta dinyatakan tidak lulus",
        type: result === "lulus" ? "success" : "info",
      })
    } catch {
      toaster.create({ title: "Gagal menyimpan hasil wawancara", type: "error" })
    }
    setResultLoading(false)
  }

  const handleConfirmReRegistration = async (studentId: string) => {
    setReRegConfirming(true)
    try {
      const updated = await confirmReRegistrationPayment(studentId)
      setStudents((prev) => prev.map((s) => s.id === updated.id ? updated : s))
      setReRegModalStudent(null)
      toaster.create({ title: "Pembayaran daftar ulang dikonfirmasi", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengkonfirmasi daftar ulang", type: "error" })
    }
    setReRegConfirming(false)
  }

  // ---- Detail view ----
  if (detailStudent) {
    const hasResult = detailStudent.interviewStatus === "lulus" || detailStudent.interviewStatus === "tidak_lulus"
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
              {/* Interview Schedule & Result */}
              <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Jadwal & Hasil Wawancara</Text>
                <Stack gap="4">
                  <Box bg="blue.50" border="1px solid" borderColor="blue.200" rounded="lg" p="4">
                    <Text fontSize="xs" color="blue.600" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" mb="2">Jadwal Wawancara</Text>
                    {detailStudent.interviewDate && detailStudent.interviewTime ? (
                      <HStack gap="6">
                        <Box>
                          <Text fontSize="xs" color="gray.500">Tanggal</Text>
                          <Text fontSize="sm" fontWeight="bold" color="gray.900">
                            {new Date(detailStudent.interviewDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="gray.500">Jam</Text>
                          <Text fontSize="sm" fontWeight="bold" color="gray.900">{detailStudent.interviewTime} WIB</Text>
                        </Box>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500">Belum ada jadwal wawancara</Text>
                    )}
                  </Box>

                  <Box border="1px solid" borderColor="gray.200" rounded="lg" p="4">
                    <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" mb="3">Konfirmasi Kelulusan</Text>
                    {detailStudent.interviewStatus === "lulus" ? (
                      <Box bg="green.50" border="1px solid" borderColor="green.200" rounded="lg" p="4" textAlign="center">
                        <Icon fontSize="2xl" color="green.500"><LuCircleCheck /></Icon>
                        <Text fontSize="sm" fontWeight="bold" color="green.700" mt="2">LULUS</Text>
                        <Text fontSize="xs" color="green.600" mt="1">Siap mengikuti diklat</Text>
                      </Box>
                    ) : detailStudent.interviewStatus === "tidak_lulus" ? (
                      <Box bg="red.50" border="1px solid" borderColor="red.200" rounded="lg" p="4" textAlign="center">
                        <Icon fontSize="2xl" color="red.500"><LuCircleX /></Icon>
                        <Text fontSize="sm" fontWeight="bold" color="red.700" mt="2">TIDAK LULUS</Text>
                      </Box>
                    ) : detailStudent.interviewStatus === "terjadwal" ? (
                      <VStack gap="3">
                        <Button colorPalette="green" w="full" loading={resultLoading} onClick={() => handleSetResult(detailStudent, "lulus")}>
                          <Icon><LuCircleCheck /></Icon>
                          Lulus
                        </Button>
                        <Button colorPalette="red" variant="outline" w="full" loading={resultLoading} onClick={() => handleSetResult(detailStudent, "tidak_lulus")}>
                          <Icon><LuCircleX /></Icon>
                          Tidak Lulus
                        </Button>
                      </VStack>
                    ) : (
                      <Text fontSize="sm" color="gray.500" textAlign="center">Buat jadwal wawancara terlebih dahulu.</Text>
                    )}
                  </Box>
                </Stack>
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
                      <Button colorPalette="green" w="full" loading={reRegConfirming} onClick={() => handleConfirmReRegistration(detailStudent.id)}>
                        <Icon><LuCircleCheck /></Icon>
                        Konfirmasi Pembayaran
                      </Button>
                    </VStack>
                  ) : (
                    <Box bg="gray.50" border="1px solid" borderColor="gray.200" rounded="lg" p="4" textAlign="center">
                      <Text fontSize="sm" color="gray.500">Belum mengirim bukti transfer</Text>
                    </Box>
                  )}
                </Box>
              )}

              {/* Documents */}
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
          <Text color="gray.500" fontSize="sm">Data siswa yang melakukan pendaftaran</Text>
        </Stack>
        <Button variant="outline" onClick={handleExport}>
          <Icon><LuDownload /></Icon>
          Export CSV
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="6">
        {[
          { label: "Total Pendaftar", value: students.length, icon: LuUsers, color: "blue.500", bg: "blue.50" },
          { label: "Hari Ini", value: todayCount, icon: LuCalendar, color: "orange.500", bg: "orange.50" },
          { label: "Bulan Ini", value: thisMonth, icon: LuCalendar, color: "green.500", bg: "green.50" },
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
              <Input pl="9" placeholder="Cari nama atau email..." value={search} onChange={(e) => setSearch(e.target.value)} size="sm" />
            </Box>
            <Text fontSize="sm" color="gray.500">{sorted.length} data</Text>
          </HStack>
        </Box>

        <Table.Root>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">#</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Nama</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>Kelas</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Email</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Tanggal Daftar</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center">Status</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center" display={{ base: "none", lg: "table-cell" }}>Daftar Ulang</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center">Aksi</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((s, i) => {
              const hasSchedule = s.interviewStatus === "terjadwal" || s.interviewStatus === "lulus" || s.interviewStatus === "tidak_lulus"
              const hasResult = s.interviewStatus === "lulus" || s.interviewStatus === "tidak_lulus"
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
                  <Table.Cell><Text fontSize="sm" color="gray.500">{safeFormatDate(s.registeredAt)}</Text></Table.Cell>
                  <Table.Cell>
                    <HStack gap="1" justifyContent="center">
                      {hasResult ? (
                        <Button size="xs" variant="ghost" colorPalette={s.interviewStatus === "lulus" ? "green" : "red"} onClick={() => openDetail(s)}>
                          {s.interviewStatus === "lulus" ? "Lulus" : "Tidak Lulus"}
                        </Button>
                      ) : hasSchedule ? (
                        <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => openDetail(s)}>
                          <Icon mr="1"><LuClock /></Icon>
                          Wawancara
                        </Button>
                      ) : (
                        <Badge colorPalette="orange" size="sm" variant="subtle">Proses</Badge>
                      )}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                    {s.interviewStatus === "lulus" ? (
                      s.reRegistrationStatus === "berhasil" ? (
                        <Badge colorPalette="green" size="sm" variant="solid">Sudah Bayar</Badge>
                      ) : s.reRegistrationStatus === "proses" ? (
                        <Button size="xs" colorPalette="green" variant="solid" onClick={() => setReRegModalStudent(s)}>
                          <Icon mr="1"><LuCircleCheck /></Icon>
                          Konfirmasi
                        </Button>
                      ) : (
                        <Badge colorPalette="red" size="sm" variant="subtle">Belum Bayar</Badge>
                      )
                    ) : (
                      <Text fontSize="xs" color="gray.300">-</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap="1" justifyContent="center">
                      {hasResult ? (
                        <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => openDetail(s)}>
                          <Icon><LuEye /></Icon>
                          Lihat Detail
                        </Button>
                      ) : hasSchedule ? (
                        <Button size="xs" variant="outline" colorPalette="blue" onClick={() => openScheduleModal(s)}>
                          <Icon mr="1"><LuClock /></Icon>
                          {safeFormatDate(s.interviewDate)} {s.interviewTime}
                        </Button>
                      ) : s.paymentStatus === "berhasil" ? (
                        <Button size="xs" colorPalette="orange" variant="solid" onClick={() => openScheduleModal(s)}>
                          <Icon mr="1"><LuCalendar /></Icon>
                          Buat Jadwal
                        </Button>
                      ) : (
                        <Text fontSize="sm" color="gray.300">-</Text>
                      )}
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              )
            })}
            {sorted.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={8} textAlign="center" py="12">
                  <Text color="gray.500">Tidak ada data ditemukan</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Schedule Interview Modal */}
      <DialogRoot open={!!scheduleModalStudent} onOpenChange={(e) => { if (!e.open) setScheduleModalStudent(null) }} size="sm">
        <DialogContent
          w="calc(100vw - 32px)"
          maxW={{ base: "calc(100vw - 32px)", sm: "md" }}
          maxH="calc(100dvh - 32px)"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          <DialogHeader flexShrink={0}>
            <DialogTitle>Buat Jadwal Wawancara</DialogTitle>
          </DialogHeader>
          <DialogBody overflowY="auto" flex="1" minH="0">
            <Stack gap="4">
              <Box bg="gray.50" rounded="lg" p="3">
                <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">Pendaftar</Text>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">{scheduleModalStudent?.nama}</Text>
                <Text fontSize="xs" color="gray.500">{scheduleModalStudent?.pilihanKelas}</Text>
              </Box>
              <Field label="Tanggal Wawancara" required>
                <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </Field>
              <Field label="Jam Wawancara" required>
                <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
              </Field>
              <Field label="Link Zoom Wawancara" required helperText="Gunakan link Zoom HTTPS agar pendaftar dapat langsung bergabung.">
                <Input type="url" placeholder="https://zoom.us/j/..." value={scheduleZoomLink} onChange={(e) => setScheduleZoomLink(e.target.value)} />
              </Field>
              <Text fontSize="xs" color="gray.500">Jadwal dan link Zoom akan tampil di halaman tracking selama wawancara belum memiliki hasil kelulusan.</Text>
            </Stack>
          </DialogBody>
          <DialogFooter flexDirection={{ base: "column-reverse", sm: "row" }} gap="2" flexShrink={0}>
            <Button w={{ base: "full", sm: "auto" }} variant="ghost" onClick={() => setScheduleModalStudent(null)}>Batal</Button>
            <Button w={{ base: "full", sm: "auto" }} colorPalette="orange" loading={scheduling} onClick={handleSchedule}>
              <Icon><LuCalendar /></Icon>
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Re-registration Confirmation Modal */}
      <DialogRoot open={!!reRegModalStudent} onOpenChange={(e) => { if (!e.open) setReRegModalStudent(null) }} size="md">
        <DialogContent
          w="calc(100vw - 32px)"
          maxW={{ base: "calc(100vw - 32px)", sm: "lg" }}
          maxH="calc(100dvh - 32px)"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {reRegModalStudent && (
            <>
              <DialogHeader flexShrink={0}>
                <DialogTitle>Konfirmasi Pembayaran Daftar Ulang</DialogTitle>
              </DialogHeader>
              <DialogBody overflowY="auto" flex="1" minH="0">
                <Stack gap="4">
                  <Box bg="gray.50" rounded="lg" p="4">
                    <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3">
                      <DetailItem label="Nama" value={reRegModalStudent.nama} />
                      <DetailItem label="Kelas" value={reRegModalStudent.pilihanKelas} />
                      <DetailItem label="Email" value={reRegModalStudent.email} />
                      <DetailItem label="No HP" value={reRegModalStudent.noHp} />
                    </Grid>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Bukti Transfer Daftar Ulang</Text>
                    {reRegModalStudent.reRegistrationProof ? (
                      <Box rounded="xl" overflow="hidden" border="1px solid" borderColor="gray.200" cursor="zoom-in" onClick={() => setReRegFullPreview(true)} _hover={{ borderColor: "blue.300" }} transition="all 0.15s">
                        <img src={reRegModalStudent.reRegistrationProof} alt="Bukti daftar ulang" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", background: "#f7f7f7" }} />
                      </Box>
                    ) : (
                      <Box bg="gray.50" rounded="lg" p="8" textAlign="center">
                        <VStack gap="2">
                          <Icon fontSize="2xl" color="gray.300"><LuFileText /></Icon>
                          <Text fontSize="sm" color="gray.500">Tidak ada bukti transfer</Text>
                        </VStack>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </DialogBody>
              <DialogFooter flexDirection={{ base: "column-reverse", sm: "row" }} gap="2" flexShrink={0}>
                <Button w={{ base: "full", sm: "auto" }} variant="ghost" onClick={() => setReRegModalStudent(null)}>Batal</Button>
                <Button w={{ base: "full", sm: "auto" }} colorPalette="green" loading={reRegConfirming} onClick={() => handleConfirmReRegistration(reRegModalStudent.id)}>
                  <Icon><LuCircleCheck /></Icon>
                  Konfirmasi Pembayaran
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </DialogRoot>

      {/* Full Preview Re-registration Proof */}
      <DialogRoot open={reRegFullPreview} onOpenChange={(e) => { if (!e.open) setReRegFullPreview(false) }} size="full">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bukti Daftar Ulang — {reRegModalStudent?.nama}</DialogTitle>
          </DialogHeader>
          <DialogBody p="2" overflow="auto" display="flex" justifyContent="center">
            {reRegModalStudent?.reRegistrationProof && (
              <img src={reRegModalStudent.reRegistrationProof} alt="Bukti daftar ulang" style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain" }} />
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
