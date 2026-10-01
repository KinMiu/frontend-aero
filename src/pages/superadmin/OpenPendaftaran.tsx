import {
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Icon,
  Stack,
  Table,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react"
import * as React from "react"
import { LuPlus, LuTrash2, LuCalendarDays } from "react-icons/lu"
import {
  getOpenRegistrations,
  addOpenRegistration,
  deleteOpenRegistration,
  getActiveRegistration,
  type OpenRegistration,
} from "@/store"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030]

export default function OpenPendaftaranPage() {
  const [registrations, setRegistrations] = React.useState<OpenRegistration[]>([])
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState("")
  const [year, setYear] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [activeReg, setActiveReg] = React.useState<OpenRegistration | null>(null)

  const refresh = async () => {
    try {
      const [regs, active] = await Promise.all([getOpenRegistrations(), getActiveRegistration()])
      setRegistrations(regs)
      setActiveReg(active)
    } catch {
      setRegistrations([])
      setActiveReg(null)
    }
  }

  React.useEffect(() => {
    refresh()
  }, [])

  const handleSave = async () => {
    if (!month || !year) {
      toaster.create({ title: "Pilih bulan dan tahun terlebih dahulu", type: "error" })
      return
    }
    setLoading(true)
    try {
      await addOpenRegistration(month, parseInt(year))
      setOpen(false)
      setMonth("")
      setYear("")
      await refresh()
      toaster.create({
        title: "Pendaftaran dibuka",
        description: `Angkatan ${month} ${year} sekarang aktif`,
        type: "success",
      })
    } catch {
      toaster.create({ title: "Gagal membuka pendaftaran", type: "error" })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deleteOpenRegistration(id)
    await refresh()
    toaster.create({ title: "Data pendaftaran dihapus", type: "info" })
  }

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Open Pendaftaran
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Kelola periode pendaftaran yang tampil di halaman beranda dan CTA
        </Text>
      </VStack>

      {activeReg && (
        <Box
          bg="blue.50"
          borderWidth="1px"
          borderColor="blue.200"
          borderRadius="xl"
          p="5"
          mb="6"
        >
          <HStack gap="3">
            <Icon color="blue.600" fontSize="xl"><LuCalendarDays /></Icon>
            <Box>
              <Text fontSize="xs" color="blue.600" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                Pendaftaran Aktif Saat Ini
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="gray.900">
                Angkatan {activeReg.month} {activeReg.year}
              </Text>
            </Box>
          </HStack>
        </Box>
      )}

      <HStack justifyContent="space-between" mb="4">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Riwayat Pendaftaran
        </Text>
        <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)} size="sm">
          <DialogTrigger asChild>
            <Button colorPalette="orange" size="sm">
              <Icon><LuPlus /></Icon>
              Tambah Pendaftaran
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buka Pendaftaran Angkatan Baru</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="4">
                <Field label="Pilih Bulan (Angkatan)">
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    >
                      <option value="">Pilih bulan...</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
                <Field label="Pilih Tahun">
                  <NativeSelectRoot>
                    <NativeSelectField
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="">Pilih tahun...</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </NativeSelectField>
                  </NativeSelectRoot>
                </Field>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
              <Button colorPalette="orange" loading={loading} onClick={handleSave}>
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </HStack>

      {registrations.length === 0 ? (
        <Box bg="gray.50" borderRadius="xl" p="12" textAlign="center">
          <VStack gap="3">
            <Icon fontSize="3xl" color="gray.300"><LuCalendarDays /></Icon>
            <Text color="gray.500">Belum ada data pendaftaran</Text>
          </VStack>
        </Box>
      ) : (
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden">
          <Table.Root>
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>No</Table.ColumnHeader>
                <Table.ColumnHeader>Bulan</Table.ColumnHeader>
                <Table.ColumnHeader>Tahun</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Dibuat</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Aksi</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {[...registrations].reverse().map((reg, i) => {
                const isActive = activeReg?.id === reg.id
                return (
                  <Table.Row key={reg.id}>
                    <Table.Cell>{i + 1}</Table.Cell>
                    <Table.Cell fontWeight="semibold" color="gray.800">{reg.month}</Table.Cell>
                    <Table.Cell>{reg.year}</Table.Cell>
                    <Table.Cell>
                      {isActive ? (
                        <Badge colorPalette="green" size="sm">Aktif</Badge>
                      ) : (
                        <Badge colorPalette="gray" size="sm">Nonaktif</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell fontSize="xs" color="gray.500">
                      {new Date(reg.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <Button
                        variant="ghost"
                        size="sm"
                        colorPalette="red"
                        onClick={() => handleDelete(reg.id)}
                      >
                        <Icon><LuTrash2 /></Icon>
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Container>
  )
}
