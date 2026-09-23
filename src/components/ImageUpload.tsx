import { Box, Button, HStack, Icon, Text, VStack, Spinner, Image } from "@chakra-ui/react"
import * as React from "react"
import { LuUpload, LuTrash2 } from "react-icons/lu"

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

  const handleFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      return
    }
    setLoading(true)
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
      setLoading(false)
    }
    reader.onerror = () => setLoading(false)
    reader.readAsDataURL(file)
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
          borderColor={value ? "transparent" : "gray.300"}
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
          _hover={{ borderColor: value ? "transparent" : "blue.400", bg: value ? "gray.50" : "blue.50" }}
          transition="all 0.2s"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {loading ? (
            <Spinner size="sm" color="gray.400" />
          ) : value ? (
            <Image src={value} alt="Preview" w="full" h="full" objectFit="cover" />
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
          <Text fontSize="xs" color="gray.400">Max 2MB · JPG, PNG, WebP</Text>
        </VStack>
      </HStack>
    </Box>
  )
}
