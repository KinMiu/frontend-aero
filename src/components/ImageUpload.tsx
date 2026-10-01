import { Box, Button, HStack, Icon, Text, VStack, Spinner, Image } from "@chakra-ui/react"
import * as React from "react"
import { LuUpload, LuTrash2 } from "react-icons/lu"
import { toaster } from "@/components/ui/toaster"

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

interface ImageUploadProps {
  value: string
  onChange: (dataUrl: string) => void
  label?: string
  shape?: "square" | "circle"
  size?: number
  maxWidth?: number
}

export function ImageUpload({
  value,
  onChange,
  label = "Klik untuk upload gambar",
  shape = "square",
  size = 120,
  maxWidth = 320,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  const handleFile = (file: File) => {
    setError(false)
    if (!file.type.startsWith("image/")) {
      setError(true)
      toaster.create({ title: "File bukan gambar", description: "Pilih file dengan format JPG, PNG, atau WebP", type: "error" })
      return
    }
    setLoading(true)
    fileToWebpDataUrl(file)
      .then((dataUrl) => {
        if (!dataUrl || dataUrl.length < 100) {
          throw new Error("Conversion produced empty result")
        }
        onChange(dataUrl)
        setLoading(false)
      })
      .catch(() => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          if (result && result.length > 100) {
            onChange(result)
            toaster.create({ title: "Gambar diunggah (tanpa kompresi WebP)", description: "Format asli digunakan karena kompresi WebP gagal", type: "warning" })
          } else {
            setError(true)
            toaster.create({ title: "Gagal mengunggah gambar", description: "File tidak dapat dibaca. Coba gambar lain.", type: "error" })
          }
          setLoading(false)
        }
        reader.onerror = () => {
          setError(true)
          setLoading(false)
          toaster.create({ title: "Gagal membaca file", description: "File tidak dapat dibaca. Coba gambar lain.", type: "error" })
        }
        reader.readAsDataURL(file)
      })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) handleFile(file)
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ""
        }}
      />
      <HStack gap="3" alignItems="flex-start">
        <Box
          border="2px dashed"
          borderColor={value ? "transparent" : error ? "red.300" : "gray.300"}
          borderRadius={shape === "circle" ? "full" : "lg"}
          w={size}
          h={size}
          minW={size}
          cursor="pointer"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          position="relative"
          bg="gray.50"
          _hover={{ borderColor: value ? "transparent" : error ? "red.400" : "blue.400", bg: value ? "gray.50" : error ? "red.50" : "blue.50" }}
          transition="all 0.2s"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {loading ? (
            <Spinner size="sm" color="gray.400" />
          ) : value ? (
            <Image src={value} alt="Preview" w="full" h="full" objectFit="cover" />
          ) : error ? (
            <VStack gap="1">
              <Icon fontSize="2xl" color="red.400"><LuUpload /></Icon>
              <Text fontSize="xs" color="red.500" textAlign="center" px="2">
                Gagal upload, coba lagi
              </Text>
            </VStack>
          ) : (
            <VStack gap="1">
              <Icon fontSize="2xl" color="gray.400"><LuUpload /></Icon>
              <Text fontSize="xs" color="gray.500" textAlign="center" px="2">
                {label}
              </Text>
            </VStack>
          )}
        </Box>
        <VStack gap="2" alignItems="flex-start" pt="1">
          <Button size="xs" variant="outline" onClick={() => inputRef.current?.click()}>
            <Icon><LuUpload /></Icon>
            Pilih File
          </Button>
          {value && (
            <Button size="xs" variant="ghost" colorPalette="red" onClick={() => onChange("")}>
              <Icon><LuTrash2 /></Icon>
              Hapus
            </Button>
          )}
          <Text fontSize="xs" color="gray.400">Auto-convert WebP · JPG, PNG, WebP</Text>
        </VStack>
      </HStack>
    </Box>
  )
}
