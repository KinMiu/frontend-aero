import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Input,
  Textarea,
  Text,
  VStack,
  Badge,
  Stack,
} from "@chakra-ui/react"
import { Field as FieldUI } from "@/components/ui/field"
import * as React from "react"
import { useParams } from "react-router-dom"
import { LuClock, LuCircleCheck, LuPlane, LuCalendar, LuVideo } from "react-icons/lu"
import { FaWhatsapp } from "react-icons/fa"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getWebinarByToken,
  registerWebinar,
  type Webinar,
} from "@/store"
import { toaster } from "@/components/ui/toaster"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function WebinarRegisterPage() {
  const { token } = useParams<{ token: string }>()
  const [webinar, setWebinar] = React.useState<Webinar | null>(null)
  const [loadingWebinar, setLoadingWebinar] = React.useState(true)
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [waLink, setWaLink] = React.useState<string | null>(null)
  const [showWaModal, setShowWaModal] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    getWebinarByToken(token).then((w) => {
      setWebinar(w)
      setLoadingWebinar(false)
    })
  }, [token])

  const handleSubmit = async () => {
    if (!webinar || !token) return
    for (const field of webinar.fields) {
      if (field.required && !formData[field.label]?.trim()) {
        toaster.create({ title: `${field.label} wajib diisi`, type: "error" })
        return
      }
    }
    setLoading(true)
    try {
      const result = await registerWebinar(token, formData)
      setWaLink(result.waLink)
      setShowWaModal(true)
      toaster.create({ title: "Pendaftaran berhasil!", type: "success" })
    } catch (err) {
      toaster.create({
        title: "Gagal mendaftar",
        description: err instanceof Error ? err.message : undefined,
        type: "error",
      })
    }
    setLoading(false)
  }

  if (loadingWebinar) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p="6">
        <Text color="gray.500">Memuat...</Text>
      </Box>
    )
  }

  if (!webinar) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p="6">
        <Container maxW="md">
          <Box bg="white" borderRadius="2xl" shadow="xl" p="8" textAlign="center">
            <VStack gap="5">
              <Box
                bg="red.50"
                borderRadius="full"
                w="16"
                h="16"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
              >
                <Icon fontSize="2xl" color="red.400"><LuVideo /></Icon>
              </Box>
              <Heading fontSize="xl" color="gray.900">Webinar Tidak Tersedia</Heading>
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                Maaf, webinar ini tidak ditemukan atau sudah tidak aktif.
                Silakan hubungi administrator untuk informasi lebih lanjut.
              </Text>
              <Button
                as="a"
                href="https://wa.me/6285212932226?text=Halo%20Aero%20Forte%20Indonesia%2C%20saya%20ingin%20bertanya%20tentang%20webinar"
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

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="blue.950" py="6">
        <Container maxW="md">
          <HStack gap="3" justifyContent="center">
            <Box bg="blue.500" borderRadius="lg" p="2" display="flex" alignItems="center" justifyContent="center">
              <Icon color="white"><LuPlane /></Icon>
            </Box>
            <VStack gap="0" alignItems="flex-start">
              <Text fontWeight="bold" fontSize="md" color="white">AERO FORTE INDONESIA</Text>
              <Text fontSize="xs" color="blue.300">Pendaftaran Webinar</Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="md" py="8">
        <VStack gap="2" mb="6" textAlign="center">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Pendaftaran Webinar</Badge>
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
            {webinar.title}
          </Heading>
          <HStack gap="4" mt="1">
            <HStack gap="1">
              <Icon color="gray.400" fontSize="sm"><LuCalendar /></Icon>
              <Text fontSize="sm" color="gray.600">{formatDate(webinar.date)}</Text>
            </HStack>
            <HStack gap="1">
              <Icon color="gray.400" fontSize="sm"><LuClock /></Icon>
              <Text fontSize="sm" color="gray.600">{webinar.time}</Text>
            </HStack>
          </HStack>
          {webinar.description && (
            <Text fontSize="sm" color="gray.600" lineHeight="tall" mt="2" maxW="md">
              {webinar.description}
            </Text>
          )}
        </VStack>

        <Box bg="white" borderRadius="2xl" shadow="lg" p="6">
          <Stack gap="4">
            {webinar.fields.map((field, i) => (
              <FieldUI key={i} label={field.label + (field.required ? " *" : "")}>
                {field.type === "textarea" ? (
                  <Textarea
                    value={formData[field.label] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    placeholder={`Masukkan ${field.label.toLowerCase()}`}
                    rows={3}
                  />
                ) : (
                  <Input
                    type={field.type === "text" ? "text" : field.type}
                    value={formData[field.label] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                    placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  />
                )}
              </FieldUI>
            ))}

            <Button
              colorPalette="orange"
              size="lg"
              w="full"
              loading={loading}
              onClick={handleSubmit}
              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
              transition="all 0.2s"
            >
              Daftar Webinar
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* WhatsApp Group Modal */}
      <DialogRoot open={showWaModal} onOpenChange={(e) => { if (!e.open) window.location.href = window.location.origin + "/" }} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle textAlign="center">Pendaftaran Berhasil!</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap="5" textAlign="center">
              <Box
                bg="green.50"
                borderRadius="full"
                w="16"
                h="16"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
              >
                <Icon fontSize="2xl" color="green.500"><LuCircleCheck /></Icon>
              </Box>
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                Terima kasih telah mendaftar webinar <strong>{webinar.title}</strong>.
                Yuk gabung ke grup WhatsApp untuk mendapatkan informasi terbaru tentang webinar ini.
              </Text>
              {waLink && (
                <Button
                  as="a"
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorPalette="green"
                  size="lg"
                  w="full"
                >
                  <Icon><FaWhatsapp /></Icon>
                  Gabung Grup WhatsApp
                </Button>
              )}
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" w="full" onClick={() => { window.location.href = window.location.origin + "/" }}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  )
}
