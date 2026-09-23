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
import * as React from "react"
import { useParams } from "react-router-dom"
import { LuStar, LuClock, LuCircleCheck, LuPlane } from "react-icons/lu"
import { FaWhatsapp } from "react-icons/fa"
import {
  getTestimonialLinkByToken,
  isTestimonialLinkValid,
  addPublicTestimonial,
  type TestimonialLink,
} from "@/store"
import { Field as FieldUI } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

export default function PublicTestimonialPage() {
  const { token } = useParams<{ token: string }>()
  const [link, setLink] = React.useState<TestimonialLink | null>(null)
  const [isValid, setIsValid] = React.useState(false)
  const [loadingLink, setLoadingLink] = React.useState(true)

  React.useEffect(() => {
    if (!token) return
    getTestimonialLinkByToken(token).then((result) => {
      if (result) {
        setLink(result.link)
        setIsValid(result.valid)
      }
      setLoadingLink(false)
    })
  }, [token])

  const [form, setForm] = React.useState({ name: "", role: "", text: "", rating: 5 })
  const [loading, setLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.text) {
      toaster.create({ title: "Nama dan testimoni wajib diisi", type: "error" })
      return
    }
    setLoading(true)
    const avatar = form.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
    try {
      await addPublicTestimonial(token, { ...form, avatar })
      setSubmitted(true)
      toaster.create({ title: "Testimoni berhasil dikirim", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengirim testimoni", type: "error" })
    }
    setLoading(false)
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
                <Icon fontSize="2xl" color="red.400"><LuClock /></Icon>
              </Box>
              <Heading fontSize="xl" color="gray.900">Link Tidak Aktif</Heading>
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                Maaf, link testimoni ini sudah tidak aktif atau telah kedaluwarsa.
                Silakan hubungi administrator untuk mengaktifkannya kembali.
              </Text>
              <Button
                as="a"
                href="https://wa.me/6285267542226?text=Halo%20Aero%20Forte%20Indonesia%2C%20saya%20ingin%20menambahkan%20testimoni%20tapi%20link%20tidak%20aktif"
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

  // Success view after submission
  if (submitted) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" p="6">
        <Container maxW="md">
          <Box bg="white" borderRadius="2xl" shadow="xl" p="8" textAlign="center">
            <VStack gap="5">
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
              <Heading fontSize="xl" color="gray.900">Testimoni Berhasil Dikirim</Heading>
              <Text fontSize="sm" color="gray.600" lineHeight="tall">
                Terima kasih atas testimoni Anda! Testimoni Anda akan ditampilkan
                setelah diverifikasi oleh administrator.
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    )
  }

  // Valid form view
  const timeLeft = new Date(link.expiresAt).getTime() - new Date().getTime()
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="blue.950" py="6">
        <Container maxW="md">
          <HStack gap="3" justifyContent="center">
            <Box
              bg="blue.500"
              borderRadius="lg"
              p="2"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon color="white"><LuPlane /></Icon>
            </Box>
            <VStack gap="0" alignItems="flex-start">
              <Text fontWeight="bold" fontSize="md" color="white">AERO FORTE INDONESIA</Text>
              <Text fontSize="xs" color="blue.300">Form Testimoni Publik</Text>
            </VStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="md" py="8">
        <VStack gap="2" mb="6" textAlign="center">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Testimoni Alumni</Badge>
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
            Bagikan Pengalaman Anda
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Sampaikan testimoni Anda tentang AERO FORTE INDONESIA
          </Text>
          <HStack gap="1.5" mt="1">
            <Icon color="green.500" fontSize="sm"><LuClock /></Icon>
            <Text fontSize="xs" color="green.600" fontWeight="medium">
              Link aktif — sisa {hoursLeft}j {minutesLeft}m
            </Text>
          </HStack>
        </VStack>

        <Box bg="white" borderRadius="2xl" shadow="lg" p="6">
          <Stack gap="4">
            <FieldUI label="Nama Lengkap">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
              />
            </FieldUI>

            <FieldUI label="Role / Posisi (opsional)">
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Contoh: Alumni — Personel AVSEC Bandara Soekarno-Hatta"
              />
            </FieldUI>

            <FieldUI label="Testimoni">
              <Textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Bagikan pengalaman Anda..."
                rows={5}
              />
            </FieldUI>

            <FieldUI label="Rating">
              <HStack gap="1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Box
                    key={n}
                    as="button"
                    cursor="pointer"
                    onClick={() => setForm({ ...form, rating: n })}
                    p="1"
                  >
                    <Icon
                      color={n <= form.rating ? "orange.400" : "gray.300"}
                      fontSize="xl"
                      fill={n <= form.rating ? "currentColor" : "none"}
                    >
                      <LuStar />
                    </Icon>
                  </Box>
                ))}
              </HStack>
            </FieldUI>

            <Button
              colorPalette="orange"
              size="lg"
              w="full"
              loading={loading}
              onClick={handleSubmit}
              _hover={{ transform: "translateY(-1px)", shadow: "lg" }}
              transition="all 0.2s"
            >
              Kirim Testimoni
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
