import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  Badge,
  Stack,
  Grid,
  Spinner,
} from "@chakra-ui/react"
import * as React from "react"
import { useParams } from "react-router-dom"
import {
  LuClock,
  LuCircleCheck,
  LuFileText,
  LuUpload,
  LuTrash2,
  LuPlane,
  LuIdCard,
  LuEye,
} from "react-icons/lu"
import { FaWhatsapp } from "react-icons/fa"
import {
  getDocumentLinkByToken,
  isDocumentLinkValid,
  getPublicDocumentData,
  uploadPublicDocument,
  deletePublicDocument,
  getActiveDocumentSettings,
  type Student,
  type UploadedDocument,
  type DocumentLink,
  type DocumentSetting,
} from "@/store"
import { Field as FieldUI } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"

async function fileToWebpDataUrl(file: File, maxSize = 1600, quality = 0.8): Promise<string> {
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
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(bitmap, 0, 0, width, height)
  return canvas.toDataURL("image/webp", quality)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PublicDocumentPage() {
  const { token } = useParams<{ token: string }>()
  const [link, setLink] = React.useState<DocumentLink | null>(null)
  const [isValid, setIsValid] = React.useState(false)
  const [loadingLink, setLoadingLink] = React.useState(true)

  const [student, setStudent] = React.useState<Student | null>(null)
  const [docs, setDocs] = React.useState<UploadedDocument[]>([])
  const [docSettings, setDocSettings] = React.useState<DocumentSetting[]>([])
  const [uploadingLabel, setUploadingLabel] = React.useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = React.useState<UploadedDocument | null>(null)

  const openPreview = (doc: UploadedDocument) => setPreviewDoc(doc)

  React.useEffect(() => {
    if (!token) return
    Promise.all([
      getDocumentLinkByToken(token),
      getActiveDocumentSettings(),
    ]).then(async ([result, settings]) => {
      setDocSettings(settings)
      if (result) {
        setLink(result.link)
        setIsValid(result.valid)
        if (result.valid && result.link.studentId) {
          try {
            const data = await getPublicDocumentData(token)
            if (data) {
              setStudent(data.student)
              setDocs(data.docs)
            }
          } catch {}
        }
      }
      setLoadingLink(false)
    })
  }, [token])

  const refreshDocs = async () => {
    if (!token) return
    const data = await getPublicDocumentData(token)
    if (data) setDocs(data.docs)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, setting: DocumentSetting) => {
    const file = e.target.files?.[0]
    if (!file || !student) return

    if (file.size > 5 * 1024 * 1024) {
      toaster.create({ title: "Ukuran file maksimal 5MB", type: "error" })
      return
    }

    setUploadingLabel(setting.label)
    try {
      let fileData: string
      let fileName: string
      let fileType: string

      const isImage = file.type.startsWith("image/")
      const isPdf = file.type === "application/pdf"

      if (isImage) {
        try {
          fileData = await fileToWebpDataUrl(file)
          fileType = "image/webp"
        } catch {
          fileData = await fileToBase64(file)
          fileType = file.type
        }
        fileName = file.name.replace(/\.[^.]+$/, "") + ".webp"
      } else if (isPdf) {
        fileData = await fileToBase64(file)
        fileType = "application/pdf"
        fileName = file.name
      } else {
        toaster.create({ title: "File harus berupa gambar atau PDF", type: "error" })
        setUploadingLabel(null)
        return
      }

      await uploadPublicDocument(token!, fileData, fileName, fileType, setting.label)
      await refreshDocs()
      toaster.create({ title: `${setting.label} berhasil diupload`, type: "success" })
    } catch {
      toaster.create({ title: `Gagal mengupload ${setting.label}`, type: "error" })
    }
    setUploadingLabel(null)
    e.target.value = ""
  }

  const handleDelete = async (id: string) => {
    await deletePublicDocument(token!, id)
    await refreshDocs()
    toaster.create({ title: "Dokumen dihapus", type: "info" })
  }

  if (loadingLink) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p="6">
        <Text color="gray.500">Memuat...</Text>
      </Box>
    )
  }

  if (!link || !isValid) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p="6">
        <Container maxW="md">
          <Box bg="white" borderRadius="2xl" shadow="xl" p="8" textAlign="center">
            <VStack gap="5">
              <Box bg="red.50" borderRadius="full" w="16" h="16" display="flex" alignItems="center" justifyContent="center" mx="auto">
                <Icon fontSize="2xl" color="red.400"><LuClock /></Icon>
              </Box>
              <Heading fontSize="xl" color="gray.900">Link Tidak Aktif</Heading>
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                Maaf, link dokumen ini sudah tidak aktif atau telah kedaluwarsa.
                Silakan hubungi administrator untuk mengaktifkannya kembali.
              </Text>
              <Button
                as="a"
                href="https://wa.me/6285212932226?text=Halo%20Aero%20Forte%20Indonesia%2C%20saya%20ingin%20mengupload%20dokumen%20tapi%20link%20tidak%20aktif"
                target="_blank"
                rel="noopener noreferrer"
                colorPalette="green"
                size="lg"
                w="full"
              >
                <Icon><FaWhatsapp /></Icon>
                Hubungi via WhatsApp
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    )
  }

  if (!student) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p="6">
        <Text color="gray.500">Data peserta tidak ditemukan</Text>
      </Box>
    )
  }

  const timeLeft = new Date(link.expiresAt).getTime() - new Date().getTime()
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  const settingsToShow = docSettings.length > 0 ? docSettings : [
    { id: "default", label: "KTP", fileType: "any" as const, required: true, isActive: true, createdAt: "" }
  ]

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="blue.950" py="6">
        <Container maxW="lg">
          <HStack gap="3" justifyContent="center">
            <Box bg="blue.500" borderRadius="lg" p="2" display="flex" alignItems="center" justifyContent="center">
              <Icon color="white"><LuPlane /></Icon>
            </Box>
            <VStack gap="0" alignItems="flex-start">
              <Text fontWeight="bold" fontSize="md" color="white">AERO FORTE INDONESIA</Text>
              <Text fontSize="xs" color="blue.300">Upload Dokumen Pendaftaran</Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="lg" py="8">
        <VStack gap="2" mb="6" textAlign="center">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Upload Dokumen</Badge>
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
            Selamat datang, {student.nama}
          </Heading>
          <HStack gap="1.5" mt="1">
            <Icon color="green.500" fontSize="sm"><LuClock /></Icon>
            <Text fontSize="xs" color="green.600" fontWeight="medium">
              Link aktif — sisa {hoursLeft}j {minutesLeft}m
            </Text>
          </HStack>
        </VStack>

        {/* Student data summary */}
        <Box bg="white" borderRadius="2xl" shadow="lg" p="6" mb="6">
          <Text fontSize="sm" fontWeight="bold" color="gray.700" mb="4">Data Pendaftaran Anda</Text>
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3">
            <DataItem label="Nama" value={student.nama} />
            <DataItem label="Kelas" value={student.pilihanKelas} />
            <DataItem label="Email" value={student.email} />
            <DataItem label="No HP" value={student.noHp} />
            <DataItem label="No KTP" value={student.noKtp} />
            <DataItem label="Tempat Lahir" value={student.tempatLahir} />
          </Grid>
        </Box>

        {/* Upload sections per document type */}
        <VStack gap="4" alignItems="stretch">
          {settingsToShow.map((setting) => {
            const settingDocs = docs.filter((d) => d.documentLabel === setting.label)
            const isUploading = uploadingLabel === setting.label
            return (
              <Box key={setting.id} bg="white" borderRadius="2xl" shadow="lg" p="6">
                <HStack gap="2" mb="2">
                  <Icon color="blue.600"><LuIdCard /></Icon>
                  <Text fontSize="sm" fontWeight="bold" color="gray.700">{setting.label}</Text>
                  {setting.required && <Badge colorPalette="red" size="sm">Wajib</Badge>}
                </HStack>
                <Text fontSize="xs" color="gray.500" mb="4">
                  Upload foto/scan atau file PDF dengan jelas. Format JPG, PNG, WebP (auto konversi WebP) atau PDF. Maksimal 5MB.
                </Text>

                {settingDocs.length > 0 && (
                  <VStack gap="3" alignItems="stretch" mb="4">
                    {settingDocs.map((doc) => (
                      <Box key={doc.id} bg="gray.50" border="1px solid" borderColor="gray.200" rounded="lg" p="4">
                        <HStack gap="3" justify="space-between">
                          <HStack gap="3" cursor="pointer" onClick={() => openPreview(doc)}>
                            <Box w="10" h="10" bg="white" rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0} overflow="hidden">
                              {doc.fileType.startsWith("image/") ? (
                                <img src={doc.filePath} alt={doc.fileName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                              ) : (
                                <Icon color="blue.600"><LuFileText /></Icon>
                              )}
                            </Box>
                            <VStack gap="0" alignItems="flex-start">
                              <Text fontSize="sm" fontWeight="semibold" color="gray.800">{doc.fileName}</Text>
                              <HStack gap="1">
                                <Icon color="green.500" fontSize="xs"><LuCircleCheck /></Icon>
                                <Text fontSize="xs" color="green.600">Terverifikasi</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <Button variant="ghost" size="sm" colorPalette="red" onClick={() => handleDelete(doc.id)}>
                            <Icon><LuTrash2 /></Icon>
                          </Button>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}

                {settingDocs.length === 0 && (
                  <Box
                    as="label"
                    cursor="pointer"
                    bg="blue.50"
                    border="2px dashed"
                    borderColor="blue.300"
                    borderRadius="xl"
                    p="6"
                    textAlign="center"
                    _hover={{ bg: "blue.100", borderColor: "blue.400" }}
                    transition="all 0.2s"
                    display="block"
                  >
                    <VStack gap="2">
                      {isUploading ? (
                        <Spinner size="sm" color="blue.500" />
                      ) : (
                        <Icon fontSize="2xl" color="blue.500"><LuUpload /></Icon>
                      )}
                      <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                        {isUploading ? "Mengupload..." : `Klik untuk upload ${setting.label}`}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        JPG, PNG, WebP, PDF — maks 5MB
                      </Text>
                    </VStack>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleUpload(e, setting)}
                      display="none"
                    />
                  </Box>
                )}
              </Box>
            )
          })}
        </VStack>

        <Text fontSize="xs" color="gray.400" textAlign="center" mt="6">
          Jika ada kendala, hubungi administrator via WhatsApp.
        </Text>
      </Container>

      {/* Preview Modal */}
      <DialogRoot open={!!previewDoc} onOpenChange={(e) => { if (!e.open) setPreviewDoc(null) }} size="full">
        <DialogContent maxW="90vw" maxH="90vh">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle>{previewDoc.fileName}</DialogTitle>
              </DialogHeader>
              <DialogBody p="2" overflow="auto">
                {previewDoc.fileType.startsWith("image/") ? (
                  <img
                    src={previewDoc.filePath}
                    alt={previewDoc.fileName}
                    style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block", margin: "0 auto" }}
                  />
                ) : (
                  <iframe
                    src={previewDoc.filePath}
                    title={previewDoc.fileName}
                    style={{ width: "100%", height: "70vh", border: "none", borderRadius: "8px", background: "white" }}
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
    </Box>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="0">
      <Text fontSize="xs" color="gray.500" fontWeight="medium">{label}</Text>
      <Text fontSize="sm" color="gray.800" fontWeight="medium">{value || "-"}</Text>
    </Stack>
  )
}
