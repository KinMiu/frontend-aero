import {
  Box,
  Button,
  Container,
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
  Grid,
  Separator,
  Image,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import {
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
  LuCircleCheck,
} from "react-icons/lu"
import {
  getStudents,
  getDocumentLinkByStudentId,
  createDocumentLink,
  deactivateDocumentLink,
  getDocumentsByStudentId,
  type Student,
  type DocumentLink,
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
import { toaster } from "@/components/ui/toaster"

export default function SuperAdminReports() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")
  const [detailStudent, setDetailStudent] = useState<Student | null>(null)
  const [detailDocs, setDetailDocs] = useState<UploadedDocument[]>([])
  const [docLinkModalStudent, setDocLinkModalStudent] = useState<Student | null>(null)
  const [activeLink, setActiveLink] = useState<DocumentLink | null>(null)
  const [copied, setCopied] = useState(false)

  const [linkCache, setLinkCache] = useState<Record<string, DocumentLink | null>>({})
  const [docCountCache, setDocCountCache] = useState<Record<string, number>>({})

  useEffect(() => {
    getStudents().then(async (list) => {
      setStudents(list)
      const links: Record<string, DocumentLink | null> = {}
      const counts: Record<string, number> = {}
      await Promise.all(list.map(async (s) => {
        links[s.id] = await getDocumentLinkByStudentId(s.id)
        const docs = await getDocumentsByStudentId(s.id)
        counts[s.id] = docs.length
      }))
      setLinkCache(links)
      setDocCountCache(counts)
    })
  }, [])

  const refreshLink = async (studentId: string) => {
    const link = await getDocumentLinkByStudentId(studentId)
    setActiveLink(link)
    setLinkCache((prev) => ({ ...prev, [studentId]: link }))
  }

  const todayStr = new Date().toDateString()
  const todayCount = students.filter((s) => new Date(s.registeredAt).toDateString() === todayStr).length
  const thisMonth = students.filter((s) => {
    const d = new Date(s.registeredAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const filtered = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.noHp.includes(search)
  )

  const sorted = [...filtered].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())

  const handleExport = () => {
    const header = "Nama,Kelas,Email,No HP,Tanggal Daftar\n"
    const rows = students.map((s) =>
      `"${s.nama}","${s.pilihanKelas}","${s.email}","${s.noHp}","${new Date(s.registeredAt).toLocaleDateString("id-ID")}"`
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
    const docs = await getDocumentsByStudentId(student.id)
    setDetailDocs(docs)
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

  return (
    <Stack gap="8">
      <HStack justify="space-between" flexWrap="wrap" gap="4">
        <Stack gap="1">
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Laporan Pendaftaran</Heading>
          <Text color="gray.500" fontSize="sm">Data seluruh siswa yang mendaftar</Text>
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

        <Table.Root>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">#</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Nama</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>Kelas</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Email</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>No HP</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Tanggal Daftar</Table.ColumnHeader>
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
                  <Table.Cell><Text fontSize="sm" color="gray.500">{new Date(s.registeredAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</Text></Table.Cell>
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
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              )
            })}
            {sorted.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={7} textAlign="center" py="12">
                  <Text color="gray.500">Tidak ada data ditemukan</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Detail Modal */}
      <DialogRoot open={!!detailStudent} onOpenChange={(e) => { if (!e.open) setDetailStudent(null) }} size="lg">
        <DialogContent maxW="3xl">
          <DialogHeader>
            <DialogTitle>Detail Pendaftar</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {detailStudent && (
              <Stack gap="5">
                <Box bg="blue.50" rounded="xl" p="5">
                  <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                    <DetailItem label="Nama" value={detailStudent.nama} />
                    <DetailItem label="Pilihan Kelas" value={detailStudent.pilihanKelas} />
                    <DetailItem label="Email" value={detailStudent.email} />
                    <DetailItem label="No HP" value={detailStudent.noHp} />
                    <DetailItem label="No KTP" value={detailStudent.noKtp} />
                    <DetailItem label="Tanggal Daftar" value={new Date(detailStudent.registeredAt).toLocaleString("id-ID")} />
                  </Grid>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Data Pribadi</Text>
                  <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                    <DetailItem label="Tempat Lahir" value={detailStudent.tempatLahir} />
                    <DetailItem label="Tanggal Lahir" value={detailStudent.tanggalLahir} />
                    <DetailItem label="Alamat" value={detailStudent.alamat} />
                    <DetailItem label="Kode Pos" value={detailStudent.kodePos} />
                    <DetailItem label="Tinggi Badan" value={detailStudent.tinggiBadan ? `${detailStudent.tinggiBadan} cm` : "-"} />
                    <DetailItem label="Berat Badan" value={detailStudent.beratBadan ? `${detailStudent.beratBadan} kg` : "-"} />
                  </Grid>
                </Box>

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Riwayat Pendidikan</Text>
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

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Data Orang Tua</Text>
                  <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                    <DetailItem label="Nama Ayah" value={detailStudent.namaAyah} />
                    <DetailItem label="TT Lahir Ayah" value={detailStudent.tempatTanggalLahirAyah} />
                    <DetailItem label="Nama Ibu" value={detailStudent.namaIbu} />
                    <DetailItem label="TT Lahir Ibu" value={detailStudent.tempatTanggalLahirIbu} />
                  </Grid>
                </Box>

                <Separator />

                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="3">Dokumen Terupload</Text>
                  {detailDocs.length === 0 ? (
                    <Box bg="gray.50" rounded="lg" p="6" textAlign="center">
                      <VStack gap="2">
                        <Icon fontSize="2xl" color="gray.300"><LuFileText /></Icon>
                        <Text fontSize="sm" color="gray.500">Belum ada dokumen yang diupload</Text>
                      </VStack>
                    </Box>
                  ) : (
                    <VStack gap="3" alignItems="stretch">
                      {detailDocs.map((doc) => (
                        <Box key={doc.id} bg="white" border="1px solid" borderColor="gray.200" rounded="lg" p="4">
                          <HStack gap="3" justify="space-between">
                            <HStack gap="3">
                              <Box w="10" h="10" bg="blue.50" rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                                <Icon color="blue.600"><LuFileText /></Icon>
                              </Box>
                              <VStack gap="0" alignItems="flex-start">
                                <Text fontSize="sm" fontWeight="semibold" color="gray.800">{doc.fileName}</Text>
                                <Text fontSize="xs" color="gray.500">
                                  Diupload {new Date(doc.uploadedAt).toLocaleString("id-ID")}
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
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDetailStudent(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

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
                      Link Aktif — Berakhir {new Date(activeLink.expiresAt).toLocaleString("id-ID")}
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
                  User yang membuka link dapat mengupload dokumen (KTP) yang tersimpan dengan data pendaftaran mereka.
                </Text>
              </VStack>
            ) : (
              <VStack gap="4" textAlign="center">
                <Box w="14" h="14" bg="orange.50" rounded="full" display="flex" alignItems="center" justifyContent="center" mx="auto">
                  <Icon fontSize="2xl" color="orange.400"><LuLink /></Icon>
                </Box>
                <Text fontSize="sm" color="gray.600">
                  Bagikan link publik kepada peserta <Text as="span" fontWeight="bold" color="gray.900">{docLinkModalStudent?.nama}</Text> untuk mengupload dokumen (KTP). Link akan aktif selama 24 jam.
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
