import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  Separator,
  List,
  useBreakpointValue,
} from "@chakra-ui/react"
import { DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogRoot } from "@/components/ui/dialog"
import { keyframes } from "@emotion/react"
import { Toaster } from "@/components/ui/toaster"
import * as React from "react"
import { useNavigate, Link } from "react-router-dom"
import { getActiveRegistration, getTestimonials as getStoredTestimonials, type Testimonial, type OpenRegistration } from "@/store"
import { getStoredArticles, type StoredArticle } from "@/data/articles"
import {
  LuShield,
  LuAward,
  LuBookOpen,
  LuPhone,
  LuChevronRight,
  LuStar,
  LuCircleCheck,
  LuClock,
  LuInstagram,
  LuFacebook,
  LuYoutube,
  LuMenu,
  LuX,
  LuPlane,
  LuGraduationCap,
  LuFileCheck,
  LuWrench,
  LuMonitor,
  LuCalendarDays,
  LuArrowRight,
  LuUsers,
  LuBriefcase,
  LuZap,
  LuMapPin,
  LuMail,
} from "react-icons/lu"
import { FaWhatsapp } from "react-icons/fa"

const programs = [
  {
    icon: LuShield,
    title: "Awal/Guard AVSEC",
    description:
      "Program diklat awal bagi yang ingin menekuni bidang Keamanan Penerbangan.",
    color: "blue",
    badge: "Pemula",
    duration: "1 Bulan",
    requirements: [
      "Usia minimal 18 th (KTP)",
      "Minimal lulusan SMA/SMK Sederajat (Ijazah)",
      "Sehat jasmani dan rohani (surat keterangan sehat)",
      "Tidak buta warna (surat keterangan sehat)",
      "Berkelakuan baik (SKCK)",
      "Tinggi badan minimal laki-laki : 165 cm dan wanita : 160 cm (surat keterangan sehat)",
      "Kemampuan penglihatan dan pendengaran baik",
      "Bebas NARKOBA (surat keterangan bebas Narkoba)",
      "Membayar Biaya Pendaftaran Rp. 100.000",
    ],
  },
  {
    icon: LuPlane,
    title: "Skriner AVSEC",
    description:
      "Program diklat lanjutan setelah memiliki lisensi Awal/Guard AVSEC.",
    color: "orange",
    badge: "Lanjutan",
    duration: "1 Bulan",
    requirements: [
      "Usia minimal 19 th (KTP)",
      "Minimal lulusan SMA/SMK Sederajat (Ijazah)",
      "Sehat jasmani dan rohani (surat keterangan sehat)",
      "Tidak buta warna (surat keterangan sehat)",
      "Berkelakuan baik (SKCK)",
      "Tinggi badan minimal laki-laki : 165 cm dan wanita : 160 cm (surat keterangan sehat)",
      "Kemampuan penglihatan dan pendengaran baik",
      "Bebas NARKOBA (surat keterangan bebas Narkoba)",
      "Memiliki Lisensi AWAL/GUARD AVSEC sekurang-kurangnya 1 (satu) tahun",
      "Membayar Biaya Pendaftaran Rp. 100.000",
    ],
  },
  {
    icon: LuGraduationCap,
    title: "SVP/Supervisor AVSEC",
    description:
      "Program diklat tertinggi bagi personel pengamanan penerbangan, harus sudah memiliki lisensi Skriner.",
    color: "teal",
    badge: "Tertinggi",
    duration: "1 Bulan",
    requirements: [
      "Usia minimal 21 th (KTP)",
      "Minimal lulusan SMA/SMK Sederajat (Ijazah)",
      "Sehat jasmani dan rohani (surat keterangan sehat)",
      "Tidak buta warna (surat keterangan sehat)",
      "Berkelakuan baik (SKCK)",
      "Tinggi badan minimal laki-laki : 165 cm dan wanita : 160 cm (surat keterangan sehat)",
      "Kemampuan penglihatan dan pendengaran baik",
      "Bebas NARKOBA (surat keterangan bebas Narkoba)",
      "Memiliki Lisensi Skriner AVSEC sekurang-kurangnya 1 (satu) tahun",
      "Membayar Biaya Pendaftaran Rp. 100.000",
    ],
  },
]

const marquee = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`

const pricingTiers = [
  {
    name: "INITIAL / BARU",
    subtitle: "Biaya Pendidikan Terjangkau",
    features: [
      "Lama Pendidikan dan Pelatihan: 1 bulan",
      "Free biaya OJT",
      "Proses lisensi cepat",
      "Peralatan Praktek lengkap",
    ],
    color: "blue",
    highlight: false,
  },
  {
    name: "RECCURENT / PERPANJANGAN",
    subtitle: "Biaya Pendidikan",
    features: [
      "Lama Pendidikan dan Pelatihan: 3 hari",
      "Proses lisensi cepat",
      "Peralatan Praktek lengkap",
      "Bisa Offline / Online (Zoom / Gmeet)",
    ],
    color: "orange",
    highlight: true,
  },
  {
    name: "REFRESHER",
    subtitle: "Rp. 500 Ribu",
    features: [
      "Lama Pendidikan dan Pelatihan: 1 hari",
      "Proses lisensi cepat",
      "Peralatan Praktek lengkap",
      "Bisa Offline / Online (Zoom / Gmeet)",
    ],
    color: "teal",
    highlight: false,
  },
]

const advantages = [
  { icon: LuClock, title: "Durasi DIKLAT Singkat", desc: "Program pelatihan yang efisien tanpa mengorbankan kualitas materi" },
  { icon: LuAward, title: "Biaya Terjangkau", desc: "Pendidikan berkualitas dengan harga yang dapat dijangkau" },
  { icon: LuFileCheck, title: "Proses Lisensi Cepat", desc: "Pengurusan lisensi yang cepat dan tanpa ribet" },
  { icon: LuWrench, title: "Fasilitas Lengkap", desc: "Peralatan praktik lengkap untuk pembelajaran optimal" },
]

const testimonials = [
  {
    name: "Agus H.",
    role: "Alumni — Bekerja di Bandara Soekarno-Hatta",
    text: "Sekolah AVSEC di sini jelas dari segi harga dan lama pendidikan dibanding sama tempat lain sudah mahal terus lama ehh ujungnya sama aja dapet lisensi doang",
    avatar: "AH",
  },
  {
    name: "Dhofar I.",
    role: "Alumni — Personel AVSEC Bandara Juanda",
    text: "Hasil obrolan dengan temen2 di tempat kerja yang sebelumnya dari berbagai lemdik, terus terang lemdik ini yg paling masuk akal",
    avatar: "DI",
  },
  {
    name: "Denny S.",
    role: "Alumni — Personel AVSEC Bandara Ngurah Rai",
    text: "Mantab disediakan kopi gratis bebas refill biar belajarnya semangat",
    avatar: "DS",
  },
]

const legalitas = [
  {
    title: "IZIN AVSEC KEMENHUB",
    number: "No. I/LD-AVSEC.070/DKP/V/2018",
    image: "/image copy.png",
  },
  {
    title: "IZIN DG KEMENHUB",
    number: "No. I/LD-DG.037/DKP/XII/2018",
    image: "/image copy 2.png",
  },
]

const heroImage = "/hero.jpeg"
const heroBg = "/image.png"
const whyUsImage = "/image.png"
const ctaBg = "https://images.pexels.com/photos/11047510/pexels-photo-11047510.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
const articleImage = "/image copy 3.jpg"

const stats = [
  { icon: LuUsers, value: "500+", label: "Alumni Tersalurkan" },
  { icon: LuBriefcase, value: "15+", label: "Mitra Bandara" },
  { icon: LuAward, value: "100%", label: "Lisensi Resmi" },
  { icon: LuClock, value: "1", label: "Bulan Cukup" },
]

const marqueeItems = [
  "Resmi KEMENHUB",
  "500+ Alumni",
  "Lisensi AVSEC",
  "Fasilitas Lengkap",
  "Proses Cepat",
  "Biaya Terjangkau",
  "Instruktur Berpengalaman",
  "OJT Gratis",
]

const programSteps = [
  { step: "01", title: "Pilih Program", desc: "Tentukan jenjang AVSEC yang sesuai dengan tujuan karier Anda" },
  { step: "02", title: "Daftar Online", desc: "Isi formulir pendaftaran secara online dalam hitungan menit" },
  { step: "03", title: "Mulai Diklat", desc: "Ikuti pelatihan dengan instruktur berpengalaman dan fasilitas lengkap" },
  { step: "04", title: "Dapatkan Lisensi", desc: "Lulus dan dapatkan lisensi resmi KEMENHUB sebagai personel AVSEC" },
]

function NavBar({ onDaftar }: { onDaftar: () => void }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: "Beranda", target: "beranda" },
    { label: "Program", target: "program" },
    { label: "Biaya", target: "biaya" },
    { label: "Legalitas", target: "legalitas" },
    { label: "Artikel", target: "artikel" },
    { label: "Kontak", target: "kontak" },
  ]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="banner"
      bg={scrolled ? "white" : "transparent"}
      borderBottomWidth={scrolled ? "1px" : "0px"}
      borderBottomColor="gray.100"
      shadow={scrolled ? "sm" : "none"}
      transition="all 0.3s ease"
    >
      <Container maxW="7xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <HStack gap="3">
            <Image src="/logo.png" h="20" w="20" objectFit="contain" alt="Logo" />
          </HStack>

          <HStack gap="6" display={{ base: "none", md: "flex" }}>
            {navLinks.map((link) => (
              <Text
                key={link.label}
                fontSize="sm"
                fontWeight="medium"
                color={scrolled ? "gray.700" : "white"}
                _hover={{ color: "orange.400" }}
                cursor="pointer"
                textDecoration="none"
                transition="color 0.2s"
                onClick={() => scrollToSection(link.target)}
              >
                {link.label}
              </Text>
            ))}
          </HStack>

          <HStack gap="3">
            <Button
              colorPalette="orange"
              size="sm"
              onClick={onDaftar}
              display={{ base: "none", md: "flex" }}
              _hover={{ transform: "scale(1.05)" }}
              transition="all 0.2s"
            >
              Daftar Sekarang
            </Button>
            <Button
              variant="ghost"
              size="sm"
              display={{ base: "flex", md: "none" }}
              onClick={() => setMenuOpen(!menuOpen)}
              px="2"
              color={scrolled ? "gray.800" : "white"}
            >
              <Icon>{menuOpen ? <LuX /> : <LuMenu />}</Icon>
            </Button>
          </HStack>
        </Flex>

        {menuOpen && (
          <Box pb="4" display={{ md: "none" }} bg="white" borderRadius="xl" shadow="lg" mx="2" mb="2" p="4">
            <VStack gap="2" alignItems="flex-start">
              {navLinks.map((link) => (
                <Text
                  key={link.label}
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.700"
                  py="2"
                  onClick={() => {
                    setMenuOpen(false)
                    scrollToSection(link.target)
                  }}
                  cursor="pointer"
                >
                  {link.label}
                </Text>
              ))}
              <Button colorPalette="orange" size="sm" w="full" onClick={onDaftar}>
                Daftar
              </Button>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  )
}

function StatsBar() {
  return (
    <Box bg="white" py="10" position="relative" zIndex="2">
      <Container maxW="7xl">
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="6">
          {stats.map((stat) => (
            <VStack key={stat.label} gap="2" textAlign="center" py="4">
              <Box
                bg="blue.50"
                borderRadius="2xl"
                p="3"
                w="14"
                h="14"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon fontSize="2xl" color="blue.600"><stat.icon /></Icon>
              </Box>
              <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="gray.900" lineHeight="1">
                {stat.value}
              </Text>
              <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
                {stat.label}
              </Text>
            </VStack>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

// --- Marquee strip ---

function HeroSection({ onDaftar }: { onDaftar: () => void }) {
  const [reg, setReg] = React.useState<OpenRegistration | null>(null)

  React.useEffect(() => {
    getActiveRegistration().then(setReg)
  }, [])

  const angkatanLabel = reg ? `Angkatan ${reg.month} ${reg.year}` : "Angkatan Juli 2026"
  return (
    <Box
      id="beranda"
      pt={{ base: "20", md: "16" }}
      pb="0"
      position="relative"
      overflow="hidden"
      minH={{ base: "auto", md: "92vh" }}
      display="flex"
      alignItems="center"
      bg="blue.950"
    >
      <Box
        position="absolute"
        inset="0"
        backgroundImage="url('/hero-banner.webp')"
        backgroundSize="cover"
        backgroundPosition="center top"
        opacity="0.35"
      />

      <Box
        position="absolute"
        inset="0"
        bgGradient="to-r"
        gradientFrom="blue.950"
        gradientTo="transparent"
      />
      <Box
        position="absolute"
        top="0"
        right="0"
        w="60%"
        h="full"
        bgGradient="to-l"
        gradientFrom="orange.500/10"
        gradientTo="transparent"
      />

      <Container maxW="7xl" position="relative" zIndex="1" py={{ base: "16", md: "20" }}>
        <Grid templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }} gap="12" alignItems="center">
          <VStack alignItems="flex-start" gap="6">
            <HStack gap="2">
              <Badge colorPalette="orange" size="lg" px="4" py="2" borderRadius="full" textTransform="none">
                <Icon mr="1.5"><LuZap /></Icon>
                Buka Pendaftaran {angkatanLabel}
              </Badge>
            </HStack>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              fontWeight="black"
              color="white"
              lineHeight="1.05"
              letterSpacing="tight"
            >
              WUJUDKAN KARIER
              <Text as="span" display="block" color="orange.400">AVIATION SECURITY</Text>
              <Text as="span" fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="blue.200" display="block" mt="2">
                BERSAMA AERO FORTE INDONESIA
              </Text>
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="blue.100" maxW="lg" lineHeight="1.7">
              Lembaga Pendidikan dan Pelatihan Personel Keamanan Penerbangan (AVSEC)
              resmi terlisensi KEMENHUB. Program singkat, biaya terjangkau, lisensi cepat.
            </Text>
            <HStack gap="4" flexWrap="wrap" mt="2">
              <Button
                colorPalette="orange"
                size="xl"
                px="8"
                onClick={onDaftar}
                shadow="xl"
                _hover={{ transform: "translateY(-2px)", shadow: "2xl" }}
                transition="all 0.3s"
              >
                Daftar Sekarang
                <Icon><LuChevronRight /></Icon>
              </Button>
              <Button
                variant="outline"
                size="xl"
                px="8"
                color="white"
                borderColor="whiteAlpha.400"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => document.getElementById("program")?.scrollIntoView({ behavior: "smooth" })}
              >
                Lihat Program
              </Button>
            </HStack>
            <HStack gap="6" mt="4" flexWrap="wrap">
              {["Resmi KEMENHUB", "Lisensi Cepat", "Fasilitas Lengkap"].map((item) => (
                <HStack key={item} gap="2">
                  <Icon color="green.400" fontSize="md"><LuCircleCheck /></Icon>
                  <Text fontSize="sm" color="blue.100" fontWeight="medium">{item}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>

          <Box display={{ base: "none", lg: "block" }} position="relative">
            <Box
              position="absolute"
              top="-20"
              right="-20"
              w="72"
              h="72"
              bg="orange.400/20"
              borderRadius="full"
              filter="blur(80px)"
            />
            <Box position="relative">
              <Image
                src={heroImage}
                alt="Personel AVSEC"
                borderRadius="3xl"
                objectFit="cover"
                w="full"
                h="520px"
                shadow="2xl"
                borderWidth="2px"
                borderColor="whiteAlpha.200"
              />
              <Box
                position="absolute"
                bottom="-5"
                left="-5"
                bg="white"
                borderRadius="2xl"
                p="5"
                shadow="2xl"
                maxW="xs"
              >
                <HStack gap="3">
                  <Box bg="green.100" borderRadius="xl" p="2.5">
                    <Icon color="green.600" fontSize="xl"><LuCircleCheck /></Icon>
                  </Box>
                  <VStack gap="0" alignItems="flex-start">
                    <Text fontWeight="bold" fontSize="sm" color="gray.800">Resmi KEMENHUB</Text>
                    <Text fontSize="xs" color="gray.500">Izin No. I/LD-AVSEC.070/DKP/V/2018</Text>
                  </VStack>
                </HStack>
              </Box>
              <Box
                position="absolute"
                top="-5"
                right="-5"
                bg="orange.500"
                borderRadius="2xl"
                p="4"
                shadow="2xl"
              >
                <VStack gap="0" alignItems="center">
                  <Text fontWeight="black" fontSize="2xl" color="white" lineHeight="1">500+</Text>
                  <Text fontSize="xs" color="orange.100" fontWeight="medium">Alumni</Text>
                </VStack>
              </Box>
            </Box>
          </Box>
        </Grid>
        
      </Container>
      
      
    </Box>
    
  )
  
}


function HowItWorksSection() {
  return (
    
    <Box bg="white" py={{ base: "16", md: "24" }}>
      
      <Container maxW="7xl">
        <VStack gap="4" mb="14" textAlign="center">
          <Badge colorPalette="blue" size="lg" px="4" borderRadius="full">Alur Pendaftaran</Badge>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
            4 Langkah Menuju Lisensi AVSEC
          </Heading>
          <Text color="gray.600" maxW="2xl" fontSize="lg">
            Proses pendaftaran yang simpel dan transparan — dari daftar sampai lisensi
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap="6" position="relative">
          {programSteps.map((ps, i) => (
            <Box key={ps.step} position="relative">
              <Box
                bg="gray.50"
                borderRadius="2xl"
                p="6"
                h="full"
                borderWidth="1px"
                borderColor="gray.100"
                _hover={{ bg: "blue.50", borderColor: "blue.200", transform: "translateY(-4px)" }}
                transition="all 0.3s"
              >
                <Text fontSize="5xl" fontWeight="black" color="blue.100" lineHeight="1" mb="3">{ps.step}</Text>
                <Heading fontSize="md" fontWeight="bold" color="gray.900" mb="2">{ps.title}</Heading>
                <Text fontSize="sm" color="gray.600" lineHeight="tall">{ps.desc}</Text>
              </Box>
              {i < programSteps.length - 1 && (
                <Box
                  position="absolute"
                  top="50%"
                  right="-20px"
                  display={{ base: "none", md: "block" }}
                  zIndex="1"
                >
                  <Icon color="blue.300" fontSize="xl"><LuChevronRight /></Icon>
                </Box>
              )}
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

function ProgramSection({ onSyarat, onDaftar }: { onSyarat: (idx: number) => void; onDaftar: () => void }) {
  return (
    <Box id="program" py={{ base: "16", md: "24" }} bg="gray.50">
      <Container maxW="7xl">
        <VStack gap="4" mb="12" textAlign="center">
          <Badge colorPalette="blue" size="lg" px="4" borderRadius="full">Program</Badge>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
            Program Pendidikan dan Pelatihan
          </Heading>
          <Text color="gray.600" maxW="2xl" fontSize="lg">
            Program Pendidikan dan Pelatihan yang kami selenggarakan di lembaga kami antara lain:
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="8">
          {programs.map((prog, idx) => (
            <Box
              key={prog.title}
              bg="white"
              borderRadius="2xl"
              overflow="hidden"
              shadow="md"
              borderWidth="1px"
              borderColor="gray.100"
              _hover={{ shadow: "2xl", transform: "translateY(-8px)" }}
              transition="all 0.3s ease"
              display="flex"
              flexDirection="column"
            >
              <Box
                h="2"
                bgGradient="to-r"
                gradientFrom={`${prog.color}.500`}
                gradientTo={`${prog.color}.600`}
              />
              <Box p="8" flex="1">
                <HStack justifyContent="space-between" mb="5">
                  <Box
                    bg={`${prog.color}.50`}
                    borderRadius="2xl"
                    p="3.5"
                  >
                    <Icon fontSize="2xl" color={`${prog.color}.600`}>
                      <prog.icon />
                    </Icon>
                  </Box>
                  <Badge colorPalette={prog.color} borderRadius="full" px="3" py="1">
                    {prog.badge}
                  </Badge>
                </HStack>
                <Heading fontSize="xl" fontWeight="bold" color="gray.900" mb="2">
                  {prog.title}
                </Heading>
                <Text color="gray.600" fontSize="sm" lineHeight="tall" mb="4">
                  {prog.description}
                </Text>
                <HStack gap="2" mb="6">
                  <Icon color={`${prog.color}.500`} fontSize="sm"><LuClock /></Icon>
                  <Text fontSize="sm" color="gray.700" fontWeight="semibold">Durasi: {prog.duration}</Text>
                </HStack>
                <VStack gap="3" w="full">
                  <Button colorPalette={prog.color} variant="outline" w="full" onClick={() => onSyarat(idx)}>
                    Syarat Pendaftaran
                    <Icon><LuChevronRight /></Icon>
                  </Button>
                  <Button colorPalette={prog.color} w="full" onClick={onDaftar}>
                    Daftar Sekarang
                  </Button>
                </VStack>
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

function TestimoniSection() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([])

  React.useEffect(() => {
    getStoredTestimonials().then(setTestimonials)
  }, [])

  return (
    <Box id="testimoni" py={{ base: "16", md: "24" }} bg="blue.950" position="relative" overflow="hidden">
      <Box
        position="absolute"
        top="-40"
        left="-40"
        w="80"
        h="80"
        bg="orange.400/10"
        borderRadius="full"
        filter="blur(100px)"
      />
      <Container maxW="7xl" position="relative" zIndex="1">
        <VStack gap="4" mb="12" textAlign="center">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Ulasan Alumni</Badge>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="white">
            Testimoni
          </Heading>
          <Text color="blue.200" maxW="2xl" fontSize="lg">
            Kumpulan testimoni dari para alumni yang kini berkarier di berbagai bandara
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="6">
          {testimonials.map((t) => (
            <Box
              key={t.name}
              bg="white/5"
              backdropFilter="blur(12px)"
              borderRadius="2xl"
              p="8"
              borderWidth="1px"
              borderColor="white/10"
              _hover={{ bg: "white/10", transform: "translateY(-4px)" }}
              transition="all 0.3s"
            >
              <HStack gap="1" mb="5">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} color="orange.400" fontSize="md" fill="currentColor"><LuStar /></Icon>
                ))}
              </HStack>
              <Text color="blue.50" fontSize="sm" lineHeight="1.8" mb="6" fontStyle="italic">
                &quot;{t.text}&quot;
              </Text>
              <HStack gap="3">
                <Box
                  borderRadius="full"
                  w="12"
                  h="12"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink="0"
                  overflow="hidden"
                >
                  {t.photoUrl ? (
                    <Image src={t.photoUrl} alt={t.name} w="12" h="12" objectFit="cover" borderRadius="full" />
                  ) : (
                    <Box
                      bgGradient="to-r"
                      gradientFrom="orange.400"
                      gradientTo="orange.600"
                      borderRadius="full"
                      w="12"
                      h="12"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontWeight="bold" fontSize="md" color="white">{t.avatar}</Text>
                    </Box>
                  )}
                </Box>
                <VStack gap="0" alignItems="flex-start">
                  <Text fontWeight="bold" color="white" fontSize="sm">{t.name}</Text>
                  <Text color="blue.300" fontSize="xs">{t.role}</Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

function LegalitasSection() {
  const [zoomIdx, setZoomIdx] = React.useState<number | null>(null)
  const zoomItem = zoomIdx !== null ? legalitas[zoomIdx] : null

  return (
    <Box id="legalitas" py={{ base: "16", md: "24" }} bg="white">
      <Container maxW="7xl">
        <VStack gap="4" mb="12" textAlign="center">
          <Badge colorPalette="blue" size="lg" px="4" borderRadius="full">Legalitas</Badge>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
            Legalitas Resmi
          </Heading>
          <Text color="gray.600" maxW="2xl" fontSize="lg">
            Legalitas kami resmi dari Kementerian Perhubungan Republik Indonesia sebagai berikut:
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="8" maxW="4xl" mx="auto">
          {legalitas.map((legal, idx) => (
            <Box
              key={legal.title}
              bg="blue.50"
              borderRadius="2xl"
              overflow="hidden"
              borderWidth="1px"
              borderColor="blue.100"
              textAlign="center"
              cursor="pointer"
              onClick={() => setZoomIdx(idx)}
              _hover={{ shadow: "2xl", transform: "translateY(-6px)" }}
              transition="all 0.3s ease"
            >
              <Image
                src={legal.image}
                alt={legal.title}
                w="full"
                h="64"
                objectFit="cover"
              />
              <Box p="6">
                <Heading fontSize="lg" fontWeight="bold" color="blue.800" mb="2">
                  {legal.title}
                </Heading>
                <Text fontSize="md" color="gray.700" fontWeight="semibold">
                  {legal.number}
                </Text>
                <Text fontSize="xs" color="blue.600" fontWeight="semibold" mt="2">
                  Klik untuk melihat gambar
                </Text>
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>

      <DialogRoot open={zoomIdx !== null} onOpenChange={(e) => { if (!e.open) setZoomIdx(null) }} size="xl">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <VStack gap="1" alignItems="flex-start">
                <Text fontSize="lg" fontWeight="bold" color="gray.900">
                  {zoomItem?.title}
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                  {zoomItem?.number}
                </Text>
              </VStack>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {zoomItem && (
              <Image
                src={zoomItem.image}
                alt={zoomItem.title}
                w="full"
                objectFit="contain"
                borderRadius="lg"
              />
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setZoomIdx(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  )
}

function PricingSection({ onDaftar }: { onDaftar: () => void }) {
  return (
    <Box id="biaya" py={{ base: "16", md: "24" }} bg="gray.50">
      <Container maxW="7xl">
        <VStack gap="4" mb="12" textAlign="center">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Biaya Pendidikan</Badge>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
            Biaya Pendidikan dan Pelatihan
          </Heading>
          <Text color="gray.600" maxW="2xl" fontSize="lg">
            Biaya berlaku untuk diklat Awal/Guard, Skriner, dan SVP/Supervisor
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="8" maxW="6xl" mx="auto">
          {pricingTiers.map((tier) => (
            <Box
              key={tier.name}
              bg="white"
              borderRadius="2xl"
              overflow="hidden"
              shadow={tier.highlight ? "2xl" : "md"}
              borderWidth="2px"
              borderColor={tier.highlight ? `${tier.color}.500` : "gray.100"}
              _hover={{ shadow: "2xl", transform: "translateY(-8px)" }}
              transition="all 0.3s ease"
              display="flex"
              flexDirection="column"
              position="relative"
            >
              {tier.highlight && (
                <Box
                  bgGradient="to-r"
                  gradientFrom={`${tier.color}.500`}
                  gradientTo={`${tier.color}.600`}
                  py="2"
                  textAlign="center"
                >
                  <Text fontSize="xs" fontWeight="bold" color="white" letterSpacing="wide">
                    PALING DIMINATI
                  </Text>
                </Box>
              )}
              <Box p="8" flex="1" display="flex" flexDirection="column">
                <Heading fontSize="lg" fontWeight="bold" color="gray.900" mb="1">
                  {tier.name}
                </Heading>
                <Text fontSize="sm" color={`${tier.color}.600`} fontWeight="semibold" mb="6">
                  {tier.subtitle}
                </Text>
                <List.Root gap="3" mb="8" flex="1">
                  {tier.features.map((feature, i) => (
                    <List.Item key={i}>
                      <HStack gap="2" alignItems="flex-start">
                        <Icon color={`${tier.color}.500`} fontSize="sm" mt="1"><LuCircleCheck /></Icon>
                        <Text fontSize="sm" color="gray.700" lineHeight="tall">{feature}</Text>
                      </HStack>
                    </List.Item>
                  ))}
                </List.Root>
                <Button colorPalette={tier.color} w="full" onClick={onDaftar} _hover={{ transform: "scale(1.02)" }} transition="all 0.2s">
                  Daftar
                </Button>
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

function WhyUsSection() {
  return (
    <Box id="mengapa" py={{ base: "16", md: "24" }} bg="white">
      <Container maxW="7xl">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="16" alignItems="center">
          <Box>
            <Badge colorPalette="blue" size="lg" px="4" borderRadius="full" mb="4">
              Kenapa Memilih Kami
            </Badge>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900" mb="4" lineHeight="1.15">
              KENAPA HARUS PILIH{" "}
              <Text as="span" color="blue.600">AEROFORTE?</Text>
            </Heading>
            <Text color="gray.600" fontSize="md" mb="8" lineHeight="1.8">
              AERO FORTE INDONESIA adalah lembaga Pendidikan dan Pelatihan Personel Keamanan Penerbangan
              (Aviation Security) resmi dengan nomor ijin dari KEMENHUB: I/LD-AVSEC.070/DKP/V/2018.
            </Text>
            <Text color="gray.700" fontWeight="semibold" mb="4">
              Keunggulan kami antara lain:
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap="4">
              {advantages.map((adv, i) => (
                <Box
                  key={adv.title}
                  p="5"
                  bg="gray.50"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="gray.100"
                  _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                  transition="all 0.2s"
                >
                  <HStack gap="3" mb="2">
                    <Box bg="blue.600" borderRadius="lg" p="2.5" w="10" h="10" display="flex" alignItems="center" justifyContent="center" flexShrink="0">
                      <Icon fontSize="lg" color="white"><adv.icon /></Icon>
                    </Box>
                    <Text fontWeight="bold" fontSize="sm" color="gray.800">{i + 1}. {adv.title}</Text>
                  </HStack>
                  <Text fontSize="xs" color="gray.600" lineHeight="tall">{adv.desc}</Text>
                </Box>
              ))}
            </Grid>
            <Button
              colorPalette="orange"
              size="lg"
              mt="8"
              onClick={() => document.getElementById("kontak")?.scrollIntoView({ behavior: "smooth" })}
              _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
              transition="all 0.3s"
            >
              Hubungi Kami
              <Icon><LuChevronRight /></Icon>
            </Button>
          </Box>

          <Box position="relative">
            <Box
              position="absolute"
              top="-20"
              left="-20"
              w="64"
              h="64"
              bg="blue.200/30"
              borderRadius="full"
              filter="blur(60px)"
            />
            <Image
              src={whyUsImage}
              alt="Pelatihan AVSEC"
              borderRadius="3xl"
              objectFit="cover"
              w="full"
              h="520px"
              shadow="2xl"
              position="relative"
              zIndex="1"
            />
            <Box
              position="absolute"
              bottom="-5"
              right="-5"
              bg="white"
              borderRadius="2xl"
              p="5"
              shadow="2xl"
              zIndex="2"
              display={{ base: "none", lg: "block" }}
            >
              <HStack gap="3">
                <Box bg="orange.100" borderRadius="xl" p="2.5">
                  <Icon color="orange.600" fontSize="xl"><LuAward /></Icon>
                </Box>
                <VStack gap="0" alignItems="flex-start">
                  <Text fontWeight="bold" fontSize="sm" color="gray.800">Terlisensi</Text>
                  <Text fontSize="xs" color="gray.500">Sejak 2018</Text>
                </VStack>
              </HStack>
            </Box>
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}

function ArticleSection() {
  const [articleList, setArticleList] = React.useState<StoredArticle[]>([])

  React.useEffect(() => {
    getStoredArticles().then(setArticleList)
  }, [])

  return (
    <Box id="artikel" py={{ base: "16", md: "24" }} bg="gray.50">
      <Container maxW="7xl">
        <VStack gap="4" mb="12" textAlign="center">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Selalu Diperbarui</Badge>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900">
            Artikel Terbaru
          </Heading>
          <Text color="gray.600" maxW="2xl" fontSize="lg">
            Jelajahi artikel dan berita terbaru kami di sini tentunya tentang Dunia Penerbangan dan
            Keamanan Penerbangan (Aviation Security)
          </Text>
        </VStack>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="6">
          {articleList.map((article) => (
            <Box
              key={article.slug}
              as={Link}
              to={`/artikel/${article.slug}`}
              bg="white"
              borderRadius="2xl"
              overflow="hidden"
              shadow="md"
              borderWidth="1px"
              borderColor="gray.100"
              _hover={{ shadow: "2xl", transform: "translateY(-6px)" }}
              transition="all 0.3s ease"
              cursor="pointer"
              textDecoration="none"
            >
              <Box h="48" overflow="hidden" position="relative">
                <Image src={article.image} alt={article.title} w="full" h="full" objectFit="cover" />
                <Box
                  position="absolute"
                  inset="0"
                  bgGradient="to-t"
                  gradientFrom="blue.950/40"
                  gradientTo="transparent"
                />
              </Box>
              <Box p="6">
                <HStack gap="2" mb="3">
                  <Icon color="blue.500" fontSize="sm"><LuCalendarDays /></Icon>
                  <Text fontSize="xs" color="gray.500" fontWeight="medium">{article.date}</Text>
                </HStack>
                <Heading fontSize="md" fontWeight="bold" color="gray.900" lineHeight="tall" _hover={{ color: "blue.600" }} transition="color 0.2s">
                  {article.title}
                </Heading>
                <HStack gap="1" mt="4" color="blue.600">
                  <Text fontSize="sm" fontWeight="semibold">Baca Selengkapnya</Text>
                  <Icon fontSize="sm"><LuArrowRight /></Icon>
                </HStack>
              </Box>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

function CTASection({ onDaftar }: { onDaftar: () => void }) {
  const [reg, setReg] = React.useState<OpenRegistration | null>(null)

  React.useEffect(() => {
    getActiveRegistration().then(setReg)
  }, [])

  const angkatanLabel = reg ? `ANGKATAN ${reg.month.toUpperCase()} ${reg.year}` : "ANGKATAN JULI 2026"
  return (
    <Box py={{ base: "16", md: "24" }} position="relative" overflow="hidden">
      <Box
        position="absolute"
        inset="0"
        backgroundImage={`url('${ctaBg}')`}
        backgroundSize="cover"
        backgroundPosition="center"
      />
      <Box
        position="absolute"
        inset="0"
        bg="blue.950/85"
        backdropFilter="blur(4px)"
      />
      <Container maxW="4xl" position="relative" zIndex="1" textAlign="center">
        <VStack gap="6">
          <Badge colorPalette="orange" size="lg" px="4" borderRadius="full" textTransform="none">
            <Icon mr="1.5"><LuZap /></Icon>
            Kuota Terbatas
          </Badge>
          <Heading fontSize={{ base: "3xl", md: "5xl" }} fontWeight="black" color="white" lineHeight="1.1">
            BUKA PENDAFTARAN<br />ANGKATAN BARU
          </Heading>
          <Text color="blue.100" fontSize="xl" fontWeight="semibold" maxW="2xl" lineHeight="tall">
            {angkatanLabel} — SEGERA DAFTARKAN DIRI ANDA SEBELUM KUOTA HABIS
          </Text>
          <HStack gap="4" flexWrap="wrap" justifyContent="center" mt="2">
            <Button
              bg="orange.500"
              color="white"
              size="xl"
              px="10"
              fontWeight="bold"
              onClick={onDaftar}
              _hover={{ bg: "orange.600", transform: "translateY(-2px)", shadow: "2xl" }}
              transition="all 0.3s"
              shadow="xl"
            >
              Daftar Sekarang
              <Icon><LuChevronRight /></Icon>
            </Button>
            <Button
              variant="outline"
              size="xl"
              px="10"
              color="white"
              borderColor="whiteAlpha.400"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => document.getElementById("program")?.scrollIntoView({ behavior: "smooth" })}
            >
              Syarat Pendaftaran
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}

function ContactSection() {
  return (
    <Box id="kontak" py={{ base: "16", md: "24" }} bg="white">
      <Container maxW="7xl">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="12">
          <VStack alignItems="flex-start" gap="6">
            <Badge colorPalette="blue" size="lg" px="4" borderRadius="full">Hubungi Kami</Badge>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold" color="gray.900" lineHeight="1.15">
              Ada Pertanyaan? <br />
              <Text as="span" color="blue.600">Kami Siap Membantu</Text>
            </Heading>
            <Text color="gray.600" fontSize="lg" lineHeight="1.8">
              Tim kami siap membantu Anda menemukan program diklat yang paling sesuai.
              Hubungi kami via telepon, email, atau media sosial.
            </Text>
            <VStack gap="4" alignItems="flex-start" w="full">
              {[
                { icon: LuPhone, label: "Telepon / WhatsApp", value: "+62 852-6754-2226" },
                { icon: LuMail, label: "Email", value: "info@aeroforte.id" },
                { icon: LuMapPin, label: "Lokasi", value: "Indonesia" },
              ].map((item) => (
                <HStack key={item.label} gap="4" p="5" bg="blue.50" borderRadius="xl" w="full" _hover={{ bg: "blue.100" }} transition="all 0.2s">
                  <Box bg="blue.600" borderRadius="xl" p="3" flexShrink="0">
                    <Icon fontSize="lg" color="white"><item.icon /></Icon>
                  </Box>
                  <VStack gap="0" alignItems="flex-start">
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="wide">{item.label}</Text>
                    <Text fontWeight="semibold" color="gray.800">{item.value}</Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
            <HStack gap="3" mt="2">
              {[
                { icon: LuFacebook, href: "#" },
                { icon: LuInstagram, href: "https://instagram.com/aeroforte.id" },
                { icon: LuYoutube, href: "#" },
              ].map((s, i) => (
                <Box
                  key={i}
                  as="a"
                  href={s.href}
                  target="_blank"
                  bg="blue.100"
                  borderRadius="full"
                  p="3"
                  color="blue.700"
                  _hover={{ bg: "blue.600", color: "white", transform: "scale(1.1)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Icon fontSize="lg"><s.icon /></Icon>
                </Box>
              ))}
            </HStack>
          </VStack>

          <Box bg="blue.950" borderRadius="3xl" p="8" shadow="2xl" position="relative" overflow="hidden">
            <Box
              position="absolute"
              top="-20"
              right="-20"
              w="48"
              h="48"
              bg="orange.400/10"
              borderRadius="full"
              filter="blur(60px)"
            />
            <VStack gap="5" position="relative" zIndex="1">
              <Heading fontSize="2xl" fontWeight="bold" color="white" textAlign="center" w="full">
                Kirim Pesan
              </Heading>
              <Box w="full">
                <Text fontSize="sm" color="blue.200" mb="2" fontWeight="medium">Nama Lengkap</Text>
                <Input bg="white/10" borderColor="white/20" color="white" _placeholder={{ color: "blue.300" }} placeholder="Masukkan nama lengkap" />
              </Box>
              <Box w="full">
                <Text fontSize="sm" color="blue.200" mb="2" fontWeight="medium">Email</Text>
                <Input bg="white/10" borderColor="white/20" color="white" _placeholder={{ color: "blue.300" }} placeholder="Masukkan email" type="email" />
              </Box>
              <Box w="full">
                <Text fontSize="sm" color="blue.200" mb="2" fontWeight="medium">Pesan</Text>
                <Input bg="white/10" borderColor="white/20" color="white" _placeholder={{ color: "blue.300" }} placeholder="Tulis pesanmu..." />
              </Box>
              <Button colorPalette="orange" w="full" size="lg" _hover={{ transform: "scale(1.02)" }} transition="all 0.2s">
                Kirim Pesan
              </Button>
            </VStack>
          </Box>
        </Grid>
      </Container>
    </Box>
  )
}

function Footer() {
  const navigate = useNavigate()
  const footerLinks = {
    "Perusahaan": ["Tentang", "Cerita Sukses", "Pusat Bantuan"],
    "Tautan Cepat": ["Galeri", "Kebijakan Privasi", "Syarat & Ketentuan"],
  }

  return (
    <Box bg="gray.900" color="gray.400" py="12">
      <Container maxW="7xl">
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap="8" mb="8">
          <VStack alignItems="flex-start" gap="4">
            <HStack
              gap="3"
              cursor="pointer"
              onClick={() => navigate("/login")}
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              <Image src="/logo.png" h="10" w="10" objectFit="contain" alt="Logo" />
              <VStack gap="0" alignItems="flex-start">
                <Text fontWeight="bold" fontSize="md" color="white">AERO FORTE INDONESIA</Text>
                <Text fontSize="xs" color="gray.500">Lembaga Diklat AVSEC</Text>
              </VStack>
            </HStack>
            <Text fontSize="sm" maxW="xs" lineHeight="tall">
              Lembaga diklat AVSEC terbaik di Indonesia
            </Text>
            <HStack gap="3" mt="2">
              {[
                { icon: LuFacebook, href: "#" },
                { icon: LuInstagram, href: "https://instagram.com/aeroforte.id" },
                { icon: LuYoutube, href: "#" },
              ].map((s, i) => (
                <Box
                  key={i}
                  as="a"
                  href={s.href}
                  target="_blank"
                  bg="gray.800"
                  borderRadius="full"
                  p="2.5"
                  color="gray.400"
                  _hover={{ bg: "blue.600", color: "white", transform: "scale(1.1)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <Icon fontSize="md"><s.icon /></Icon>
                </Box>
              ))}
            </HStack>
          </VStack>
          {Object.entries(footerLinks).map(([heading, items]) => (
            <VStack key={heading} alignItems="flex-start" gap="3">
              <Text color="white" fontWeight="semibold" fontSize="sm" mb="1">{heading}</Text>
              {items.map((item) => (
                <Text key={item} fontSize="sm" _hover={{ color: "white" }} cursor="pointer" transition="color 0.2s">{item}</Text>
              ))}
            </VStack>
          ))}
        </Grid>
        <Separator borderColor="gray.700" />
        <Text textAlign="center" fontSize="xs" mt="6">
          Copyright © 2024 AERO FORTE INDONESIA
        </Text>
      </Container>
    </Box>
  )
}

function SyaratModal({
  open,
  onClose,
  programIdx,
  onDaftar,
}: {
  open: boolean
  onClose: () => void
  programIdx: number | null
  onDaftar: () => void
}) {
  const program = programIdx !== null ? programs[programIdx] : null

  return (
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) onClose() }} size="md">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <VStack gap="2" alignItems="flex-start">
              <HStack gap="3">
                {program && (
                  <Box bg={`${program.color}.50`} borderRadius="lg" p="2">
                    <Icon fontSize="xl" color={`${program.color}.600`}>
                      <program.icon />
                    </Icon>
                  </Box>
                )}
                <Text fontSize="lg" fontWeight="bold" color="gray.900">
                  Syarat Pendaftaran
                </Text>
              </HStack>
              {program && (
                <Text fontSize="sm" color={`${program.color}.600`} fontWeight="semibold">
                  {program.title}
                </Text>
              )}
            </VStack>
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <List.Root gap="3">
            {program?.requirements.map((req, i) => (
              <List.Item key={i}>
                <HStack gap="3" alignItems="flex-start">
                  <Box
                    bg={`${program.color}.100`}
                    borderRadius="full"
                    minW="6"
                    h="6"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink="0"
                    mt="0.5"
                  >
                    <Text fontSize="xs" fontWeight="bold" color={`${program?.color}.700`}>{i + 1}</Text>
                  </Box>
                  <Text fontSize="sm" color="gray.700" lineHeight="tall">{req}</Text>
                </HStack>
              </List.Item>
            ))}
          </List.Root>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Tutup
          </Button>
          <Button
            colorPalette="orange"
            onClick={() => { onClose(); onDaftar() }}
            size="lg"
          >
            Daftar Sekarang
            <Icon><LuChevronRight /></Icon>
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [syaratOpen, setSyaratOpen] = React.useState(false)
  const [syaratIdx, setSyaratIdx] = React.useState<number | null>(null)

  const openSyarat = (idx: number) => {
    setSyaratIdx(idx)
    setSyaratOpen(true)
  }

  const goDaftar = () => navigate("/daftar")

  return (
    <Box bg="white" minH="100vh">
      <NavBar onDaftar={goDaftar} />
      <HeroSection onDaftar={goDaftar} />
      <StatsBar />
      <HowItWorksSection />
      <ProgramSection onSyarat={openSyarat} onDaftar={goDaftar} />
      <TestimoniSection />
      <LegalitasSection />
      <PricingSection onDaftar={goDaftar} />
      <WhyUsSection />
      <ArticleSection />
      <CTASection onDaftar={goDaftar} />
      <ContactSection />
      <Footer />
      <SyaratModal
        open={syaratOpen}
        onClose={() => setSyaratOpen(false)}
        programIdx={syaratIdx}
        onDaftar={goDaftar}
      />

      <Box
        position="fixed"
        bottom="6"
        right="6"
        zIndex="banner"
        as="a"
        href="https://wa.me/6285267542226?text=Halo%20Aero%20Forte%20Indonesia%2C%20saya%20ingin%20bertanya%20tentang%20pendaftaran"
        target="_blank"
        rel="noopener noreferrer"
        bg="green.500"
        color="white"
        borderRadius="full"
        w="14"
        h="14"
        display="flex"
        alignItems="center"
        justifyContent="center"
        shadow="xl"
        _hover={{ bg: "green.600", transform: "scale(1.08)" }}
        transition="all 0.2s ease"
        aria-label="Hubungi kami via WhatsApp"
      >
        <Icon fontSize="2xl"><FaWhatsapp /></Icon>
      </Box>

      <Toaster />
    </Box>
  )
}
