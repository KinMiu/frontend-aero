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
  Image,
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
} from "react-icons/lu"
import { FaWhatsapp } from "react-icons/fa"
import {
  getDocumentLinkByToken,
  isDocumentLinkValid,
  getPublicDocumentData,
  uploadPublicDocument,
  deletePublicDocument,
  type Student,
  type UploadedDocument,
  type DocumentLink,
} from "@/store"
import { Field as FieldUI } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

export default function PublicDocumentPage() {
  const { token } = useParams<{ token: string }>()
  const [link, setLink] = React.useState<DocumentLink | null>(null)
  const [isValid, setIsValid] = React.useState(false)
  const [loadingLink, setLoadingLink] = React.useState(true)

  const [student, setStudent] = React.useState<Student | null>(null)
  const [docs, setDocs] = React.useState<UploadedDocument[]>([])
  const [uploading, setUploading] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    getDocumentLinkByToken(token).then(async (result) => {
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !student) return

    if (file.size > 5 * 1024 * 1024) {
      toaster.create({ title: "Ukuran file maksimal 5MB", type: "error" })
      return
    }

    setUploading(true)
    try {
      await uploadPublicDocument(token!, file)
      const data = await getPublicDocumentData(token!)
      if (data) setDocs(data.docs)
      toaster.create({ title: "Dokumen berhasil diupload", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengupload dokumen", type: "error" })
    }
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    await deletePublicDocument(token!, id)
    const data = await getPublicDocumentData(token!)
    if (data) setDocs(data.docs)
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
                href="https://wa.me/6285267542226?text=Halo%20Aero%20Forte%20Indonesia%2C%20saya%20ingin%20mengupload%20dokumen%20tapi%20link%20tidak%20aktif"
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

        {/* Upload section */}
        <Box bg="white" borderRadius="2xl" shadow="lg" p="6">
          <HStack gap="2" mb="4">
            <Icon color="blue.600"><LuIdCard /></Icon>
            <Text fontSize="sm" fontWeight="bold" color="gray.700">Upload KTP</Text>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb="4">
            Upload foto/scan KTP Anda dengan jelas. Format: JPG, PNG, atau PDF. Maksimal 5MB.
          </Text>

          {docs.length > 0 && (
            <VStack gap="3" alignItems="stretch" mb="4">
              {docs.map((doc) => (
                <Box key={doc.id} bg="gray.50" border="1px solid" borderColor="gray.200" rounded="lg" p="4">
                  <HStack gap="3" justify="space-between">
                    <HStack gap="3">
                      <Box w="10" h="10" bg="white" rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink="0">
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

          <Box
            as="label"
            cursor="pointer"
            bg="blue.50"
            border="2px dashed"
            borderColor="blue.300"
            borderRadius="xl"
            p="8"
            textAlign="center"
            _hover={{ bg: "blue.100", borderColor: "blue.400" }}
            transition="all 0.2s"
            display="block"
          >
            <VStack gap="2">
              <Icon fontSize="3xl" color="blue.500"><LuUpload /></Icon>
              <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                {uploading ? "Mengupload..." : "Klik untuk upload KTP"}
              </Text>
              <Text fontSize="xs" color="gray.500">JPG, PNG, PDF — maks 5MB</Text>
            </VStack>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={handleUpload}
              display="none"
            />
          </Box>
        </Box>

        <Text fontSize="xs" color="gray.400" textAlign="center" mt="6">
          Jika ada kendala, hubungi administrator via WhatsApp.
        </Text>
      </Container>
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
