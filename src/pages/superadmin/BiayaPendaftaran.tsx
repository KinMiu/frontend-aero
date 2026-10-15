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
  Spinner,
  Badge,
  Separator,
} from "@chakra-ui/react"
import * as React from "react"
import { LuSave, LuWallet, LuBuilding, LuQrCode, LuPlus, LuTrash2 } from "react-icons/lu"
import {
  getRegistrationFee,
  updateRegistrationFee,
  type RegistrationFee,
  type BankAccount,
} from "@/store"
import { ImageUpload } from "@/components/ImageUpload"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const emptyAccount: BankAccount = { bankName: "", accountHolder: "", accountNumber: "" }

export default function BiayaPendaftaranPage() {
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [data, setData] = React.useState<RegistrationFee | null>(null)
  const [qrisImage, setQrisImage] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([{ ...emptyAccount }])

  React.useEffect(() => {
    getRegistrationFee()
      .then((fee) => {
        if (fee) {
          setData(fee)
          setQrisImage(fee.qrisImage || "")
          setAmount(fee.amount ? String(fee.amount) : "")
          setBankAccounts(
            fee.bankAccounts && fee.bankAccounts.length > 0
              ? fee.bankAccounts
              : [{ ...emptyAccount }]
          )
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const addAccount = () => {
    setBankAccounts([...bankAccounts, { ...emptyAccount }])
  }

  const removeAccount = (index: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== index))
  }

  const updateAccount = (index: number, field: keyof BankAccount, value: string) => {
    setBankAccounts(
      bankAccounts.map((acc, i) => (i === index ? { ...acc, [field]: value } : acc))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanedAccounts = bankAccounts.filter(
        (a) => a.bankName.trim() || a.accountHolder.trim() || a.accountNumber.trim()
      )
      const updated = await updateRegistrationFee({
        qrisImage,
        bankAccounts: cleanedAccounts,
        amount: parseInt(amount) || 0,
      })
      setData(updated)
      toaster.create({ title: "Biaya pendaftaran berhasil disimpan", type: "success" })
    } catch {
      toaster.create({ title: "Gagal menyimpan biaya pendaftaran", type: "error" })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Container maxW="5xl" py="8">
        <VStack gap="4" py="20">
          <Spinner size="xl" color="orange.400" />
          <Text color="gray.500">Memuat data...</Text>
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Biaya Pendaftaran
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Atur informasi biaya pendaftaran yang ditampilkan kepada calon peserta
        </Text>
      </VStack>

      <Stack gap="6" direction={{ base: "column", lg: "row" }} alignItems="flex-start">
        {/* Form Section */}
        <Box
          flex="1"
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="xl"
          p="6"
          w="full"
        >
          <HStack gap="2" mb="5">
            <Icon color="orange.500" fontSize="lg"><LuWallet /></Icon>
            <Text fontSize="lg" fontWeight="semibold" color="gray.800">Edit Informasi Pembayaran</Text>
          </HStack>

          <Stack gap="5">
            <Field label="Biaya Pendaftaran (Rp)" required>
              <InputGroup startElement={<Text fontSize="sm" color="gray.500" fontWeight="medium">Rp</Text>}>
                <Input
                  type="number"
                  placeholder="500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </InputGroup>
              {amount && (
                <Text fontSize="xs" color="gray.500" mt="1">
                  {formatRupiah(parseInt(amount) || 0)}
                </Text>
              )}
            </Field>

            <Separator my="2" />

            <Field label="QRIS / QR Code Pembayaran" helperText="Upload gambar QRIS yang akan ditampilkan kepada peserta">
              <ImageUpload
                value={qrisImage}
                onChange={setQrisImage}
                label="Klik untuk upload QRIS"
                size={180}
              />
            </Field>

            <Separator my="2" />

            {/* Bank Accounts */}
            <VStack gap="4" alignItems="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">Rekening Bank</Text>
                <Button size="xs" variant="outline" colorPalette="blue" onClick={addAccount}>
                  <Icon><LuPlus /></Icon>
                  Tambah Rekening
                </Button>
              </HStack>

              {bankAccounts.map((acc, index) => (
                <Box
                  key={index}
                  bg="gray.50"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="lg"
                  p="4"
                >
                  <HStack justify="space-between" mb="3">
                    <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                      Rekening {index + 1}
                    </Text>
                    {bankAccounts.length > 1 && (
                      <Button
                        size="xs"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => removeAccount(index)}
                      >
                        <Icon><LuTrash2 /></Icon>
                      </Button>
                    )}
                  </HStack>
                  <Stack gap="3">
                    <Field label="Nama Bank">
                      <Input
                        placeholder="BCA, Mandiri, BNI, dll."
                        value={acc.bankName}
                        onChange={(e) => updateAccount(index, "bankName", e.target.value)}
                      />
                    </Field>
                    <Field label="Nomor Rekening">
                      <Input
                        placeholder="1234567890"
                        value={acc.accountNumber}
                        onChange={(e) => updateAccount(index, "accountNumber", e.target.value)}
                      />
                    </Field>
                    <Field label="Nama Pemilik Rekening">
                      <Input
                        placeholder="John Doe"
                        value={acc.accountHolder}
                        onChange={(e) => updateAccount(index, "accountHolder", e.target.value)}
                      />
                    </Field>
                  </Stack>
                </Box>
              ))}
            </VStack>

            <Button colorPalette="orange" loading={saving} onClick={handleSave} size="md" alignSelf="flex-start" mt="2">
              <Icon><LuSave /></Icon>
              Simpan Perubahan
            </Button>
          </Stack>
        </Box>

        {/* Preview Section */}
        <Box
          w={{ base: "full", lg: "380px" }}
          flexShrink={0}
          position={{ lg: "sticky" }}
          top={{ lg: "8" }}
        >
          <Text fontSize="lg" fontWeight="semibold" color="gray.800" mb="3">
            Preview
          </Text>
          <Box
            bg="white"
            borderWidth="1px"
            borderColor="gray.200"
            borderRadius="2xl"
            overflow="hidden"
            shadow="sm"
          >
            {/* Header */}
            <Box bg="orange.500" px="6" py="5">
              <HStack gap="3">
                <Box
                  w="10"
                  h="10"
                  bg="white"
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon color="orange.500" fontSize="lg"><LuWallet /></Icon>
                </Box>
                <VStack gap="0" alignItems="flex-start">
                  <Text fontSize="xs" color="whiteAlpha.800" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
                    Informasi Pembayaran
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="white">Biaya Pendaftaran</Text>
                </VStack>
              </HStack>
            </Box>

            {/* Amount */}
            <Box px="6" py="5" borderBottom="1px solid" borderColor="gray.100">
              <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide" mb="1">
                Total Biaya
              </Text>
              <Text fontSize="3xl" fontWeight="black" color="gray.900">
                {amount ? formatRupiah(parseInt(amount)) : "Rp 0"}
              </Text>
            </Box>

            {/* QRIS */}
            <Box px="6" py="5" borderBottom="1px solid" borderColor="gray.100">
              <HStack gap="2" mb="3">
                <Icon color="gray.600" fontSize="sm"><LuQrCode /></Icon>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">Bayar via QRIS</Text>
              </HStack>
              {qrisImage ? (
                <Box
                  bg="gray.50"
                  borderRadius="lg"
                  p="4"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <img
                    src={qrisImage}
                    alt="QRIS"
                    style={{ width: 200, height: 200, objectFit: "contain", borderRadius: 8 }}
                  />
                </Box>
              ) : (
                <Box
                  bg="gray.50"
                  borderRadius="lg"
                  h="200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <VStack gap="2">
                    <Icon fontSize="3xl" color="gray.300"><LuQrCode /></Icon>
                    <Text fontSize="xs" color="gray.400">Belum ada QRIS</Text>
                  </VStack>
                </Box>
              )}
            </Box>

            {/* Bank Transfer */}
            <Box px="6" py="5">
              <HStack gap="2" mb="4">
                <Icon color="gray.600" fontSize="sm"><LuBuilding /></Icon>
                <Text fontSize="sm" fontWeight="semibold" color="gray.700">Transfer Bank</Text>
              </HStack>
              <VStack gap="3" alignItems="stretch">
                {bankAccounts
                  .filter((a) => a.bankName.trim() || a.accountHolder.trim() || a.accountNumber.trim())
                  .map((acc, i) => (
                    <Box
                      key={i}
                      bg="gray.50"
                      borderRadius="lg"
                      p="4"
                      borderWidth="1px"
                      borderColor="gray.100"
                    >
                      <Text fontSize="sm" fontWeight="bold" color="gray.800" mb="1">
                        {acc.bankName || "-"}
                      </Text>
                      <Text fontSize="sm" color="gray.700" fontFamily="mono">
                        {acc.accountNumber || "-"}{" "}
                        <Text as="span" color="gray.500">
                          ({acc.accountHolder || "-"})
                        </Text>
                      </Text>
                    </Box>
                  ))}
                {bankAccounts.every(
                  (a) => !a.bankName.trim() && !a.accountHolder.trim() && !a.accountNumber.trim()
                ) && (
                  <Text fontSize="xs" color="gray.400" textAlign="center" py="4">
                    Belum ada rekening bank
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Footer */}
            <Box bg="gray.50" px="6" py="3" borderTop="1px solid" borderColor="gray.100">
              <HStack gap="2" justifyContent="center">
                <Badge colorPalette="orange" size="sm" variant="subtle">
                  Simulasi tampilan
                </Badge>
              </HStack>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Container>
  )
}
