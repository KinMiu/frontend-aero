import {
  Box,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuUsers, LuCalendar, LuTrendingUp, LuStar, LuEye, LuGlobe, LuMousePointerClick } from "react-icons/lu"
import { getStudents, getCurrentUser, getVisitStats, type Student, type VisitStats } from "@/store"
import { useState, useEffect } from "react"

export default function OfficialDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [visits, setVisits] = useState<VisitStats | null>(null)
  const user = getCurrentUser()

  useEffect(() => {
    getStudents().then(setStudents).catch(() => {})
    getVisitStats().then(setVisits).catch(() => {})
  }, [])

  const todayStr = new Date().toDateString()
  const todayCount = students.filter((s) => new Date(s.registeredAt).toDateString() === todayStr).length
  const thisMonth = students.filter((s) => {
    const d = new Date(s.registeredAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const statCards = [
    { label: "Total Pendaftar", value: students.length, icon: LuUsers, color: "blue.500", bg: "blue.50" },
    { label: "Hari Ini", value: todayCount, icon: LuCalendar, color: "orange.500", bg: "orange.50" },
    { label: "Bulan Ini", value: thisMonth, icon: LuTrendingUp, color: "green.500", bg: "green.50" },
    { label: "Konversi", value: "98%", icon: LuStar, color: "purple.500", bg: "purple.50" },
  ]

  const visitCards = [
    { label: "Total Pengunjung", value: visits?.total ?? "—", icon: LuEye, color: "cyan.500", bg: "cyan.50" },
    { label: "Hari Ini", value: visits?.today ?? "—", icon: LuGlobe, color: "teal.500", bg: "teal.50" },
    { label: "Minggu Ini", value: visits?.thisWeek ?? "—", icon: LuMousePointerClick, color: "blue.500", bg: "blue.50" },
    { label: "Pengunjung Unik", value: visits?.uniqueVisitors ?? "—", icon: LuUsers, color: "orange.500", bg: "orange.50" },
  ]

  const recent = [...students]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5)

  const maxVisit = visits ? Math.max(...visits.last7Days.map((d) => d.count), 1) : 1

  return (
    <Stack gap="8">
      <Box
        bg="linear-gradient(135deg, #0a1628, #1a3a6b)"
        rounded="2xl"
        p="8"
        pos="relative"
        overflow="hidden"
      >
        <Box pos="absolute" right="-20" top="-20" w="200px" h="200px" rounded="full" bg="blue.500" opacity="0.1" />
        <Stack gap="2">
          <Text color="blue.300" fontSize="sm" fontWeight="medium">Selamat datang,</Text>
          <Heading fontSize="2xl" fontWeight="bold" color="white">{user?.name}</Heading>
          <Text color="whiteAlpha.600" fontSize="sm">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Text>
        </Stack>
      </Box>

      {/* Visitor Stats Section */}
      <Box
        bg="linear-gradient(135deg, #0a1628, #1a3a6b)"
        rounded="2xl"
        p="8"
        pos="relative"
        overflow="hidden"
      >
        <Box pos="absolute" right="-20" top="-20" w="200px" h="200px" rounded="full" bg="cyan.500" opacity="0.1" />
        <Stack gap="6" pos="relative">
          <HStack justify="space-between" align="center">
            <Stack gap="1">
              <HStack gap="2">
                <Icon color="cyan.400" fontSize="lg"><LuEye /></Icon>
                <Text color="white" fontSize="lg" fontWeight="bold">Statistik Pengunjung Website</Text>
              </HStack>
              <Text color="whiteAlpha.600" fontSize="sm">Melacak setiap kunjungan ke halaman utama</Text>
            </Stack>
          </HStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
            {visitCards.map((card) => (
              <Box key={card.label} bg="whiteAlpha.100" rounded="xl" p="4" backdropFilter="blur(10px)">
                <HStack justify="space-between" align="start" mb="2">
                  <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium">{card.label}</Text>
                  <Box w="8" h="8" bg="whiteAlpha.200" rounded="lg" display="flex" alignItems="center" justifyContent="center">
                    <Icon color="white" fontSize="sm"><card.icon /></Icon>
                  </Box>
                </HStack>
                <Text fontSize="2xl" fontWeight="black" color="white">{card.value}</Text>
              </Box>
            ))}
          </SimpleGrid>

          {visits && (
            <Box bg="whiteAlpha.50" rounded="xl" p="5">
              <Text color="whiteAlpha.800" fontSize="sm" fontWeight="medium" mb="4">Kunjungan 7 Hari Terakhir</Text>
              <HStack gap="2" align="flex-end" h="32">
                {visits.last7Days.map((d) => (
                  <Box key={d.date} flex="1" display="flex" flexDirection="column" alignItems="center" gap="2">
                    <Box
                      bg="cyan.400"
                      rounded="md"
                      w="full"
                      h={`${Math.max((d.count / maxVisit) * 100, 4)}%`}
                      minH="4px"
                      transition="all 0.3s"
                      _hover={{ bg: "cyan.300" }}
                      title={`${d.count} kunjungan`}
                    />
                    <Text fontSize="2xs" color="whiteAlpha.600" textTransform="uppercase">{d.day}</Text>
                  </Box>
                ))}
              </HStack>
            </Box>
          )}
        </Stack>
      </Box>

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

      <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" p="6">
        <Stack gap="5">
          <Heading fontSize="md" fontWeight="semibold" color="gray.900">5 Pendaftar Terbaru</Heading>
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
                    <Text fontSize="xs" color="gray.500">{s.noHp}</Text>
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
