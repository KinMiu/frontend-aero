import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Input,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { LuUsers, LuCalendar, LuSearch, LuDownload } from "react-icons/lu"
import { getStudents, type Student } from "@/store"

export default function OfficialReports() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    getStudents().then(setStudents)
  }, [])

  const todayStr = new Date().toDateString()
  const todayCount = students.filter((s) => new Date(s.registeredAt).toDateString() === todayStr).length
  const thisMonth = students.filter((s) => {
    const d = new Date(s.registeredAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const filtered = students.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.noHp.includes(search)
  )

  const sorted = [...filtered].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())

  const handleExport = () => {
    const header = "Nama,Kelas,Email,No HP,Tanggal Daftar\n"
    const rows = students.map((s) =>
      `"${s.nama}","${s.pilihanKelas}","${s.email}","${s.noHp}","${new Date(s.registeredAt).toLocaleDateString("id-ID")}"`
    ).join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "laporan-pendaftaran.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Stack gap="8">
      <HStack justify="space-between" flexWrap="wrap" gap="4">
        <Stack gap="1">
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Laporan Pendaftaran</Heading>
          <Text color="gray.500" fontSize="sm">Data siswa yang melakukan pendaftaran</Text>
        </Stack>
        <Button variant="outline" onClick={handleExport}>
          <Icon><LuDownload /></Icon>
          Export CSV
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="6">
        {[
          { label: "Total Pendaftar", value: students.length, icon: LuUsers, color: "blue.500", bg: "blue.50", darkBg: "blue.900" },
          { label: "Hari Ini", value: todayCount, icon: LuCalendar, color: "orange.500", bg: "orange.50", darkBg: "orange.900" },
          { label: "Bulan Ini", value: thisMonth, icon: LuCalendar, color: "green.500", bg: "green.50", darkBg: "green.900" },
        ].map((card) => (
          <Box
            key={card.label}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            rounded="2xl"
            p="6"
          >
            <HStack justify="space-between" align="start">
              <Stack gap="1">
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{card.label}</Text>
                <Text fontSize="3xl" fontWeight="black" color="gray.900">{card.value}</Text>
              </Stack>
              <Box
                w="12"
                h="12"
                bg={card.bg}
                
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon color={card.color} fontSize="xl"><card.icon /></Icon>
              </Box>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" overflow="hidden">
        <Box p="5" borderBottom="1px solid" borderColor="gray.200">
          <HStack gap="3">
            <Box pos="relative" flex="1" maxW="sm">
              <Box pos="absolute" left="3" top="50%" transform="translateY(-50%)" color="gray.500" zIndex="1">
                <Icon fontSize="sm"><LuSearch /></Icon>
              </Box>
              <Input
                pl="9"
                placeholder="Cari nama, email, atau no HP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="sm"
              />
            </Box>
            <Text fontSize="sm" color="gray.500">{sorted.length} data</Text>
          </HStack>
        </Box>

        <Table.Root>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">#</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Nama</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>Kelas</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Email</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>No HP</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Tanggal Daftar</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sorted.map((s, i) => (
              <Table.Row key={s.id} _hover={{ bg: "bg.subtle" }} transition="background 0.15s">
                <Table.Cell>
                  <Text fontSize="sm" color="gray.500">{i + 1}</Text>
                </Table.Cell>
                <Table.Cell>
                  <HStack gap="3">
                    <Box
                      w="8"
                      h="8"
                      bg="blue.100"
                      
                      rounded="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontWeight="bold" fontSize="xs" color="blue.600" >
                        {s.nama.slice(0, 2).toUpperCase()}
                      </Text>
                    </Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.900">{s.nama}</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell display={{ base: "none", md: "table-cell" }}>
                  <Text fontSize="sm" color="gray.500">{s.pilihanKelas}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.500">{s.email}</Text>
                </Table.Cell>
                <Table.Cell display={{ base: "none", md: "table-cell" }}>
                  <Text fontSize="sm" color="gray.500">{s.noHp}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(s.registeredAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
            {sorted.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={6} textAlign="center" py="12">
                  <Text color="gray.500">Tidak ada data ditemukan</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </Stack>
  )
}
