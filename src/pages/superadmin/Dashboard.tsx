import {
  Box,
  Grid,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuUsers, LuUserCheck, LuCalendar, LuTrendingUp } from "react-icons/lu"
import { getStudents, getOfficials, type Student, type OfficialAdmin } from "@/store"
import { useState, useEffect } from "react"

export default function SuperAdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [officials, setOfficials] = useState<OfficialAdmin[]>([])

  useEffect(() => {
    getStudents().then(setStudents)
    getOfficials().then(setOfficials)
  }, [])

  const todayStr = new Date().toDateString()
  const todayCount = students.filter(
    (s) => new Date(s.registeredAt).toDateString() === todayStr
  ).length

  const thisMonth = students.filter((s) => {
    const d = new Date(s.registeredAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const statCards = [
    { label: "Total Pendaftar", value: students.length, icon: LuUsers, color: "blue.500", bg: "blue.50", darkBg: "blue.900" },
    { label: "Official Admin", value: officials.length, icon: LuUserCheck, color: "green.500", bg: "green.50", darkBg: "green.900" },
    { label: "Daftar Hari Ini", value: todayCount, icon: LuCalendar, color: "orange.500", bg: "orange.50", darkBg: "orange.900" },
    { label: "Daftar Bulan Ini", value: thisMonth, icon: LuTrendingUp, color: "purple.500", bg: "purple.50", darkBg: "purple.900" },
  ]

  const recent = [...students].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0, 5)

  return (
    <Stack gap="8">
      <Stack gap="1">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Dashboard</Heading>
        <Text color="gray.500" fontSize="sm">Selamat datang kembali, Super Admin</Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6">
        {statCards.map((card) => (
          <Box
            key={card.label}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            rounded="2xl"
            p="6"
            _hover={{ shadow: "md" }}
            transition="all 0.2s"
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

      {/* Recent registrations */}
      <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
        <Stack gap="5">
          <HStack justify="space-between">
            <Heading fontSize="md" fontWeight="semibold" color="gray.900">Pendaftaran Terbaru</Heading>
            <Text fontSize="xs" color="gray.500">{students.length} total</Text>
          </HStack>

          <Stack gap="3">
            {recent.map((s, i) => (
              <HStack key={s.id} justify="space-between" py="3" borderBottom={i < recent.length - 1 ? "1px solid" : "none"} borderColor="gray.200">
                <HStack gap="3">
                  <Box
                    w="9"
                    h="9"
                    bg="blue.100"
                    
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontWeight="bold" fontSize="xs" color="blue.600" >
                      {s.nama.slice(0, 2).toUpperCase()}
                    </Text>
                  </Box>
                  <Stack gap="0">
                    <Text fontWeight="semibold" fontSize="sm" color="gray.900">{s.nama}</Text>
                    <Text fontSize="xs" color="gray.500">{s.email}</Text>
                  </Stack>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {new Date(s.registeredAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                </Text>
              </HStack>
            ))}
            {recent.length === 0 && (
              <Text color="gray.500" fontSize="sm" textAlign="center" py="4">Belum ada pendaftaran</Text>
            )}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}
