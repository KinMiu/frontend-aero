import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
  Badge,
  Spinner,
} from "@chakra-ui/react"
import * as React from "react"
import { LuUpload, LuTrash2, LuVideo, LuX, LuCircleCheck, LuPlay } from "react-icons/lu"
import {
  getAllVideos,
  uploadVideo,
  deleteVideo,
  toggleVideo,
  getVideoSettings as fetchVideoSettings,
  toggleDefaultVideo,
  type VideoContent,
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

async function fileToWebMDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "auto"
    video.muted = true
    video.playsInline = true
    const url = URL.createObjectURL(file)
    video.src = url

    video.addEventListener("loadedmetadata", () => {
      const stream = video.captureStream?.()
      if (!stream) {
        URL.revokeObjectURL(url)
        reject(new Error("captureStream not supported"))
        return
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
          ? "video/webm;codecs=vp8"
          : "video/webm"

      let recorder: MediaRecorder
      try {
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_000_000 })
      } catch {
        URL.revokeObjectURL(url)
        reject(new Error("MediaRecorder not supported"))
        return
      }

      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }
      recorder.onstop = () => {
        URL.revokeObjectURL(url)
        const blob = new Blob(chunks, { type: "video/webm" })
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error("Failed to read webm blob"))
        reader.readAsDataURL(blob)
      }
      recorder.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error("Recorder error"))
      }

      recorder.start()
      video.play()

      const duration = video.duration
      const stopAt = isFinite(duration) ? duration * 1000 : 30000
      setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop()
      }, Math.min(stopAt, 30000))
    })

    video.addEventListener("error", () => {
      URL.revokeObjectURL(url)
      reject(new Error("Video load error"))
    })
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function VideoKontenPage() {
  const [videos, setVideos] = React.useState<VideoContent[]>([])
  const [uploadOpen, setUploadOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [title, setTitle] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [converting, setConverting] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState("")
  const [defaultVideoEnabled, setDefaultVideoEnabled] = React.useState(true)
  const [togglingDefault, setTogglingDefault] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const refresh = async () => {
    try {
      setVideos(await getAllVideos())
    } catch {
      setVideos([])
    }
  }

  const refreshSettings = async () => {
    try {
      const s = await fetchVideoSettings()
      setDefaultVideoEnabled(s.defaultVideoEnabled)
    } catch {
      setDefaultVideoEnabled(true)
    }
  }

  React.useEffect(() => {
    refresh()
    refreshSettings()
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toaster.create({ title: "File bukan video", type: "error" })
      return
    }
    setConverting(true)
    toaster.create({ title: "Memproses video ke WebM...", description: "Mohon tunggu sebentar", type: "info" })
    fileToWebMDataUrl(file)
      .then((dataUrl) => {
        if (!dataUrl || dataUrl.length < 100) throw new Error("Empty")
        setPreviewUrl(dataUrl)
        setConverting(false)
        toaster.create({ title: "Video berhasil dikonversi ke WebM", type: "success" })
      })
      .catch(() => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          if (result && result.length > 100) {
            setPreviewUrl(result)
            toaster.create({ title: "Video diunggah (format asli)", description: "Konversi WebM gagal, format asli digunakan", type: "warning" })
          } else {
            toaster.create({ title: "Gagal mengunggah video", type: "error" })
          }
          setConverting(false)
        }
        reader.onerror = () => {
          setConverting(false)
          toaster.create({ title: "Gagal membaca video", type: "error" })
        }
        reader.readAsDataURL(file)
      })
  }

  const handleSave = async () => {
    if (!previewUrl) {
      toaster.create({ title: "Upload video terlebih dahulu", type: "error" })
      return
    }
    setLoading(true)
    try {
      await uploadVideo(title.trim(), previewUrl)
      setTitle("")
      setPreviewUrl("")
      setUploadOpen(false)
      await refresh()
      toaster.create({ title: "Video berhasil ditambahkan", type: "success" })
    } catch {
      toaster.create({ title: "Gagal menambahkan video", type: "error" })
    }
    setLoading(false)
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      await toggleVideo(id, !currentActive)
      await refresh()
      toaster.create({
        title: !currentActive ? "Konten video diaktifkan" : "Konten video dimatikan",
        type: !currentActive ? "success" : "info",
      })
    } catch {
      toaster.create({ title: "Gagal mengubah status", type: "error" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVideo(id)
      setDeleteId(null)
      await refresh()
      toaster.create({ title: "Video dihapus", type: "info" })
    } catch {
      toaster.create({ title: "Gagal menghapus video", type: "error" })
    }
  }

  const resetForm = () => {
    setTitle("")
    setPreviewUrl("")
    setConverting(false)
  }

  const handleToggleDefault = async () => {
    setTogglingDefault(true)
    try {
      const s = await toggleDefaultVideo(!defaultVideoEnabled)
      setDefaultVideoEnabled(s.defaultVideoEnabled)
      toaster.create({
        title: s.defaultVideoEnabled ? "Video default diaktifkan" : "Video default dimatikan",
        type: s.defaultVideoEnabled ? "success" : "info",
      })
    } catch {
      toaster.create({ title: "Gagal mengubah status video default", type: "error" })
    }
    setTogglingDefault(false)
  }

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Kelola Konten Video
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Upload video promosi. Hanya satu video yang aktif dan tampil di halaman beranda. Jika tidak ada video aktif, video default dari sistem yang tampil.
        </Text>
      </VStack>

      

      <Box
        bg="white"
        borderWidth="1px"
        borderColor={defaultVideoEnabled ? "green.300" : "gray.200"}
        borderRadius="xl"
        p="5"
        mb="6"
        _hover={{ shadow: "md", borderColor: defaultVideoEnabled ? "green.400" : "gray.300" }}
        transition="all 0.2s"
      >
        <HStack gap="4" alignItems="center" justifyContent="space-between">
          <HStack gap="4" alignItems="center">
            <Box
              w="14"
              h="14"
              borderRadius="lg"
              overflow="hidden"
              flexShrink="0"
              position="relative"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <video
                src="/videopromosi.webm"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                muted
                preload="metadata"
              />
              <Box
                position="absolute"
                inset="0"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="blackAlpha.400"
              >
                <Icon color="white" fontSize="md"><LuPlay /></Icon>
              </Box>
            </Box>
            <VStack gap="1" alignItems="flex-start">
              <HStack gap="2">
                <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                  Video Default
                </Text>
                {defaultVideoEnabled ? (
                  <Badge colorPalette="green" size="sm">
                    <Icon fontSize="xs" mr="1"><LuCircleCheck /></Icon>
                    Aktif
                  </Badge>
                ) : (
                  <Badge colorPalette="gray" size="sm">Nonaktif</Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.400" fontFamily="mono">
                /videopromosi.webm
              </Text>
            </VStack>
          </HStack>
          <Button
            size="sm"
            colorPalette={defaultVideoEnabled ? "red" : "green"}
            variant="outline"
            loading={togglingDefault}
            onClick={handleToggleDefault}
          >
            {defaultVideoEnabled ? "Matikan" : "Aktifkan"}
          </Button>
        </HStack>
      </Box>

      <HStack justifyContent="space-between" mb="4">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Daftar Video ({videos.length})
        </Text>
        <Button colorPalette="orange" size="sm" onClick={() => { resetForm(); setUploadOpen(true) }}>
          <Icon><LuUpload /></Icon>
          Upload Video
        </Button>
      </HStack>

      {videos.length === 0 ? (
        <Box bg="gray.50" borderRadius="xl" p="12" textAlign="center">
          <VStack gap="3">
            <Icon fontSize="3xl" color="gray.300"><LuVideo /></Icon>
            <Text color="gray.500">Belum ada video di server. Video default akan digunakan.</Text>
          </VStack>
        </Box>
      ) : (
        <VStack gap="3" alignItems="stretch">
          {videos.map((v, i) => (
            <Box
              key={v.id}
              bg="white"
              borderWidth="1px"
              borderColor={v.isActive ? "green.300" : "gray.200"}
              borderRadius="xl"
              p="5"
              _hover={{ shadow: "md", borderColor: v.isActive ? "green.400" : "gray.300" }}
              transition="all 0.2s"
            >
              <HStack gap="4" alignItems="flex-start">
                <Box
                  w="20"
                  h="20"
                  borderRadius="lg"
                  overflow="hidden"
                  flexShrink="0"
                  position="relative"
                  bg="gray.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <video
                    src={v.videoData}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    muted
                    preload="metadata"
                  />
                  <Box
                    position="absolute"
                    inset="0"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="blackAlpha.400"
                  >
                    <Icon color="white" fontSize="lg"><LuPlay /></Icon>
                  </Box>
                </Box>
                <VStack gap="1" alignItems="flex-start" flex="1">
                  <HStack gap="2">
                    <Text fontWeight="semibold" color="gray.800" fontSize="sm">
                      {v.title || `Video ${i + 1}`}
                    </Text>
                    {v.isActive ? (
                      <Badge colorPalette="green" size="sm">
                        <Icon fontSize="xs" mr="1"><LuCircleCheck /></Icon>
                        Aktif
                      </Badge>
                    ) : (
                      <Badge colorPalette="gray" size="sm">Nonaktif</Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    Diupload: {formatDate(v.createdAt)}
                  </Text>
                </VStack>
                <HStack gap="2">
                  <Button
                    size="sm"
                    colorPalette={v.isActive ? "red" : "green"}
                    variant="outline"
                    onClick={() => handleToggle(v.id, v.isActive)}
                  >
                    {v.isActive ? "Matikan" : "Aktifkan"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorPalette="red"
                    onClick={() => setDeleteId(v.id)}
                  >
                    <Icon><LuTrash2 /></Icon>
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Upload Modal */}
      <DialogRoot open={uploadOpen} onOpenChange={(e) => { setUploadOpen(e.open); if (!e.open) resetForm() }} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Video Baru</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <Field label="Judul Video (opsional)">
                <input
                  className="chakra-input"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                  }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Video Promosi 2026"
                />
              </Field>
              <Field label="File Video" helperText="Video akan dikonversi ke WebM. Format didukung: MP4, MOV, WebM, AVI">
                <input
                  ref={inputRef}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                    e.target.value = ""
                  }}
                />
                <Box
                  border="2px dashed"
                  borderColor={previewUrl ? "green.300" : "gray.300"}
                  borderRadius="xl"
                  p="6"
                  textAlign="center"
                  cursor={converting ? "wait" : "pointer"}
                  bg={previewUrl ? "green.50" : "gray.50"}
                  _hover={{ borderColor: previewUrl ? "green.400" : "blue.400", bg: previewUrl ? "green.50" : "blue.50" }}
                  transition="all 0.2s"
                  onClick={() => !converting && !previewUrl && inputRef.current?.click()}
                >
                  {converting ? (
                    <VStack gap="3">
                      <Spinner size="lg" color="blue.400" />
                      <Text fontSize="sm" color="gray.600">Mengkonversi ke WebM...</Text>
                      <Text fontSize="xs" color="gray.400">Mohon tunggu, proses ini membutuhkan waktu</Text>
                    </VStack>
                  ) : previewUrl ? (
                    <VStack gap="3">
                      <video
                        src={previewUrl}
                        controls
                        style={{ maxWidth: "100%", maxHeight: "240px", borderRadius: "8px" }}
                      />
                      <HStack gap="2">
                        <Badge colorPalette="green" size="sm">WebM Siap</Badge>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={(e) => { e.stopPropagation(); setPreviewUrl("") }}
                        >
                          <Icon><LuX /></Icon>
                          Ganti
                        </Button>
                      </HStack>
                    </VStack>
                  ) : (
                    <VStack gap="2">
                      <Icon fontSize="3xl" color="gray.400"><LuUpload /></Icon>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">Klik untuk pilih video</Text>
                      <Text fontSize="xs" color="gray.400">MP4, MOV, WebM — dikonversi ke WebM</Text>
                    </VStack>
                  )}
                </Box>
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setUploadOpen(false)}>Batal</Button>
              <Button colorPalette="orange" flex="1" loading={loading} isDisabled={!previewUrl || converting} onClick={handleSave}>
                Simpan
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirm */}
      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Video</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text color="gray.500" fontSize="sm">
              Apakah Anda yakin ingin menghapus video ini? Tindakan ini tidak dapat dibatalkan.
            </Text>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button bg="red.500" color="white" flex="1" _hover={{ bg: "red.400" }} onClick={() => deleteId && handleDelete(deleteId)}>
                Hapus
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  )
}
