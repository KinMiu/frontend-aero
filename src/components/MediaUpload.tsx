import { Box, Button, HStack, Icon, Text, VStack, Spinner, Image } from "@chakra-ui/react"
import * as React from "react"
import { LuUpload, LuTrash2, LuImage, LuVideo, LuX } from "react-icons/lu"
import { toaster } from "@/components/ui/toaster"

export interface MediaItem {
  url: string
  type: "image" | "video"
}

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

export interface MediaUploadProps {
  items: MediaItem[]
  onChange: (items: MediaItem[]) => void
  label?: string
  maxItems?: number
}

export function MediaUpload({
  items,
  onChange,
  label = "Klik untuk upload foto atau video",
  maxItems = 10,
}: MediaUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  const processFile = (file: File): Promise<MediaItem> => {
    if (file.type.startsWith("image/")) {
      return fileToWebpDataUrl(file)
        .then((dataUrl) => {
          if (!dataUrl || dataUrl.length < 100) throw new Error("Empty result")
          return { url: dataUrl, type: "image" as const }
        })
        .catch(() => {
          return new Promise<MediaItem>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result as string
              if (result && result.length > 100) {
                resolve({ url: result, type: "image" })
              } else {
                reject(new Error("Failed"))
              }
            }
            reader.onerror = () => reject(new Error("Failed"))
            reader.readAsDataURL(file)
          })
        })
    } else {
      return fileToWebMDataUrl(file)
        .then((dataUrl) => {
          if (!dataUrl || dataUrl.length < 100) throw new Error("Empty result")
          return { url: dataUrl, type: "video" as const }
        })
        .catch(() => {
          return new Promise<MediaItem>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result as string
              if (result && result.length > 100) {
                resolve({ url: result, type: "video" })
              } else {
                reject(new Error("Failed"))
              }
            }
            reader.onerror = () => reject(new Error("Failed"))
            reader.readAsDataURL(file)
          })
        })
    }
  }

  const handleFiles = (files: FileList) => {
    const fileArr = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    )
    if (fileArr.length === 0) {
      setError(true)
      toaster.create({ title: "Format tidak didukung", description: "Pilih file JPG, PNG, WebP, atau video (MP4, MOV, WebM)", type: "error" })
      return
    }

    const remaining = maxItems - items.length
    if (remaining <= 0) {
      toaster.create({ title: `Maksimal ${maxItems} file`, type: "warning" })
      return
    }
    const toProcess = fileArr.slice(0, remaining)
    if (fileArr.length > remaining) {
      toaster.create({ title: `Hanya ${remaining} file tersisa yang diproses`, type: "warning" })
    }

    setError(false)
    setLoading(true)
    const hasVideo = toProcess.some((f) => f.type.startsWith("video/"))
    if (hasVideo) {
      toaster.create({ title: "Memproses media...", description: "Konversi video ke WebM mungkin butuh sebentar", type: "info" })
    }

    Promise.all(toProcess.map(processFile))
      .then((newItems) => {
        onChange([...items, ...newItems])
        setLoading(false)
        const videoCount = newItems.filter((m) => m.type === "video").length
        const imageCount = newItems.filter((m) => m.type === "image").length
        if (videoCount > 0 && imageCount > 0) {
          toaster.create({ title: `${newItems.length} media ditambahkan (${imageCount} foto, ${videoCount} video)`, type: "success" })
        } else if (videoCount > 0) {
          toaster.create({ title: `${videoCount} video ditambahkan`, type: "success" })
        } else {
          toaster.create({ title: `${imageCount} foto ditambahkan`, type: "success" })
        }
      })
      .catch(() => {
        setError(true)
        setLoading(false)
        toaster.create({ title: "Gagal mengunggah beberapa media", type: "error" })
      })
  }

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
          e.target.value = ""
        }}
      />

      {items.length > 0 && (
        <HStack gap="3" flexWrap="wrap" mb="3" alignItems="flex-start">
          {items.map((item, i) => (
            <Box
              key={i}
              position="relative"
              w="24"
              h="24"
              borderRadius="lg"
              overflow="hidden"
              borderWidth="1px"
              borderColor="gray.200"
              flexShrink="0"
            >
              {item.type === "video" ? (
                <Box position="relative" w="full" h="full">
                  <video src={item.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted preload="metadata" />
                  <Box
                    position="absolute"
                    inset="0"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="blackAlpha.400"
                  >
                    <Icon color="white" fontSize="lg"><LuVideo /></Icon>
                  </Box>
                </Box>
              ) : (
                <Image src={item.url} alt={`Media ${i + 1}`} w="full" h="full" objectFit="cover" />
              )}
              <Box
                position="absolute"
                top="1"
                right="1"
                bg="red.500"
                color="white"
                borderRadius="full"
                w="5"
                h="5"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                _hover={{ bg: "red.600" }}
                onClick={() => removeItem(i)}
              >
                <Icon fontSize="xs"><LuX /></Icon>
              </Box>
              {item.type === "video" && (
                <Box
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  bg="blackAlpha.600"
                  textAlign="center"
                  py="0.5"
                >
                  <Text fontSize="2xs" color="white" fontWeight="semibold">VIDEO</Text>
                </Box>
              )}
            </Box>
          ))}
        </HStack>
      )}

      <HStack gap="3" alignItems="flex-start">
        <Box
          border="2px dashed"
          borderColor={error ? "red.300" : "gray.300"}
          borderRadius="lg"
          w="24"
          h="24"
          minW="24"
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          position="relative"
          bg="gray.50"
          _hover={{ borderColor: error ? "red.400" : "blue.400", bg: error ? "red.50" : "blue.50" }}
          transition="all 0.2s"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
          }}
        >
          {loading ? (
            <VStack gap="1">
              <Spinner size="sm" color="gray.400" />
              <Text fontSize="2xs" color="gray.400">Memproses...</Text>
            </VStack>
          ) : error ? (
            <VStack gap="1">
              <Icon fontSize="xl" color="red.400"><LuUpload /></Icon>
              <Text fontSize="2xs" color="red.500" textAlign="center" px="1">Gagal, coba lagi</Text>
            </VStack>
          ) : items.length >= maxItems ? (
            <VStack gap="1">
              <Icon fontSize="xl" color="gray.300"><LuImage /></Icon>
              <Text fontSize="2xs" color="gray.400" textAlign="center" px="1">Maksimal tercapai</Text>
            </VStack>
          ) : (
            <VStack gap="1">
              <Icon fontSize="xl" color="gray.400"><LuUpload /></Icon>
              <Text fontSize="2xs" color="gray.500" textAlign="center" px="1">{label}</Text>
            </VStack>
          )}
        </Box>
        <VStack gap="2" alignItems="flex-start" pt="1">
          <Button size="xs" variant="outline" onClick={() => inputRef.current?.click()} isDisabled={items.length >= maxItems || loading}>
            <Icon><LuUpload /></Icon>
            Pilih File
          </Button>
          {items.length > 0 && (
            <Button size="xs" variant="ghost" colorPalette="red" onClick={() => onChange([])}>
              <Icon><LuTrash2 /></Icon>
              Hapus Semua
            </Button>
          )}
          <HStack gap="1">
            <Icon fontSize="sm" color="gray.400"><LuImage /></Icon>
            <Text fontSize="2xs" color="gray.400">Foto → WebP</Text>
          </HStack>
          <HStack gap="1">
            <Icon fontSize="sm" color="gray.400"><LuVideo /></Icon>
            <Text fontSize="2xs" color="gray.400">Video → WebM</Text>
          </HStack>
          <Text fontSize="2xs" color="gray.400">{items.length}/{maxItems} file</Text>
        </VStack>
      </HStack>
    </Box>
  )
}
