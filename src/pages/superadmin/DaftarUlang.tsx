import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import * as React from "react"
import { LuBuilding2, LuSave, LuWallet, LuMessageCircle, LuUsers } from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"
import { getReRegistrationFee, updateReRegistrationFee, type ReRegistrationFee } from "@/store"

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount)
}

export default function DaftarUlangPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [amount, setAmount] = React.useState("")
  const [bankName, setBankName] = React.useState("")
  const [accountHolder, setAccountHolder] = React.useState("")
  const [accountNumber, setAccountNumber] = React.useState("")
  const [whatsappGroupLink, setWhatsappGroupLink] = React.useState("")
  const [whatsappAdminNumber, setWhatsappAdminNumber] = React.useState("")

  React.useEffect(() => {
    getReRegistrationFee()
      .then((fee) => {
        if (fee) {
          setAmount(fee.amount ? String(fee.amount) : "")
          setBankName(fee.bankName)
          setAccountHolder(fee.accountHolder)
          setAccountNumber(fee.accountNumber)
          setWhatsappGroupLink(fee.whatsappGroupLink || "")
          setWhatsappAdminNumber(fee.whatsappAdminNumber || "")
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) {
      toaster.create({ title: "Informasi rekening wajib diisi lengkap", type: "error" })
      return
    }
    setSaving(true)
    try {
      await updateReRegistrationFee({ amount: Number(amount) || 0, bankName, accountHolder, accountNumber, whatsappGroupLink: whatsappGroupLink.trim(), whatsappAdminNumber: whatsappAdminNumber.trim() })
      toaster.create({ title: "Informasi daftar ulang berhasil disimpan", type: "success" })
    } catch {
      toaster.create({ title: "Gagal menyimpan informasi daftar ulang", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Container maxW="3xl" py="20"><Text color="gray.500">Memuat informasi daftar ulang...</Text></Container>
  }

  return (
    <Container maxW="4xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Biaya Daftar Ulang</Heading>
        <Text fontSize="sm" color="gray.500">Atur biaya dan rekening transfer yang tercetak pada surat kelulusan peserta.</Text>
      </VStack>
      <Stack direction={{ base: "column", lg: "1.1fr 0.9fr" }} gap="6" alignItems="stretch">
        <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="2xl" p={{ base: "5", md: "7" }} shadow="sm">
          <HStack gap="3" mb="6"><Box bg="blue.50" color="blue.600" p="2" borderRadius="lg"><Icon><LuWallet /></Icon></Box><Text fontSize="lg" fontWeight="bold" color="gray.800">Informasi pembayaran</Text></HStack>
          <Stack gap="5">
            <Field label="Biaya Daftar Ulang (Rp)" required>
              <InputGroup startElement={<Text fontSize="sm" color="gray.500" fontWeight="medium">Rp</Text>}>
                <Input type="number" min="0" placeholder="5000000" value={amount} onChange={(event) => setAmount(event.target.value)} />
              </InputGroup>
              {amount && <Text fontSize="xs" color="gray.500" mt="1">{formatRupiah(Number(amount) || 0)}</Text>}
            </Field>
            <Field label="Nama Bank" required><Input placeholder="BRI" value={bankName} onChange={(event) => setBankName(event.target.value)} /></Field>
            <Field label="Nama Rekening" required><Input placeholder="AERO FORTE INDONESIA" value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} /></Field>
            <Field label="Nomor Rekening" required><Input placeholder="0098-01-002137-30-3" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} /></Field>
            <Box borderTopWidth="1px" borderColor="gray.200" pt="5">
              <HStack gap="3" mb="4"><Box bg="green.50" color="green.600" p="2" borderRadius="lg"><Icon><LuMessageCircle /></Icon></Box><Text fontSize="lg" fontWeight="bold" color="gray.800">Kontak WhatsApp</Text></HStack>
              <Stack gap="4">
                <Field label="Link Grup WhatsApp" helperText="Tampil setelah pembayaran daftar ulang dikonfirmasi.">
                  <Input type="url" placeholder="https://chat.whatsapp.com/..." value={whatsappGroupLink} onChange={(event) => setWhatsappGroupLink(event.target.value)} />
                </Field>
                <Field label="Nomor WhatsApp Admin" helperText="Dipakai peserta untuk mengirim konfirmasi saat bukti transfer sedang diverifikasi.">
                  <Input type="tel" placeholder="6281234567890" value={whatsappAdminNumber} onChange={(event) => setWhatsappAdminNumber(event.target.value)} />
                </Field>
              </Stack>
            </Box>
            <Button colorPalette="blue" loading={saving} onClick={handleSave} alignSelf="flex-start"><Icon><LuSave /></Icon>Simpan Perubahan</Button>
          </Stack>
        </Box>
        <Box bg="gray.900" borderRadius="2xl" p={{ base: "5", md: "7" }} color="white" position="relative" overflow="hidden">
          <Box position="absolute" right="-10" top="-10" w="40" h="40" borderRadius="full" bg="blue.400" opacity="0.15" />
          <Stack gap="5" position="relative">
            <HStack gap="3"><Icon color="blue.300" fontSize="xl"><LuBuilding2 /></Icon><Text fontSize="xs" textTransform="uppercase" letterSpacing="wider" color="whiteAlpha.700">Preview surat kelulusan</Text></HStack>
            <Box borderTopWidth="1px" borderColor="whiteAlpha.300" pt="5">
              <Text fontSize="xs" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="wider">Transfer daftar ulang ke</Text>
              <Text fontSize="2xl" fontWeight="black" mt="2">{bankName || "Nama Bank"}</Text>
              <Text fontSize="md" color="whiteAlpha.800" mt="1">{accountHolder || "Nama Rekening"}</Text>
              <Text fontSize="lg" fontFamily="mono" color="blue.200" mt="3">{accountNumber || "Nomor Rekening"}</Text>
            </Box>
            <Box bg="whiteAlpha.100" borderRadius="xl" p="4">
              <Text fontSize="xs" color="whiteAlpha.700">Biaya daftar ulang</Text>
              <Text fontSize="2xl" fontWeight="bold" mt="1">{amount ? formatRupiah(Number(amount) || 0) : "Rp 0"}</Text>
            </Box>
            <Text fontSize="xs" color="whiteAlpha.600" lineHeight="tall">Peserta hanya dapat melakukan pembayaran melalui transfer bank ke rekening yang tercantum pada surat kelulusan.</Text>
            {(whatsappGroupLink || whatsappAdminNumber) && <Box borderTopWidth="1px" borderColor="whiteAlpha.300" pt="4"><HStack gap="2" color="green.300" mb="2"><Icon><LuUsers /></Icon><Text fontSize="sm" fontWeight="bold">Akses WhatsApp peserta</Text></HStack><Text fontSize="xs" color="whiteAlpha.700">Link grup dan nomor admin akan tampil otomatis sesuai status daftar ulang peserta.</Text></Box>}
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
