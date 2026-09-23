import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  Separator,
} from "@chakra-ui/react"
import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  LuCalendarDays,
  LuChevronRight,
  LuChevronLeft,
  LuArrowLeft,
  LuClock,
  LuUser,
  LuPhone,
  LuInstagram,
  LuFacebook,
  LuYoutube,
  LuMenu,
  LuX,
  LuZap,
  LuMapPin,
  LuMail,
} from "react-icons/lu"
import { FaWhatsapp } from "react-icons/fa"
import { getStoredArticleBySlug, getStoredArticles, type StoredArticle } from "@/data/articles"

function NavBar() {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const navigate = useNavigate()

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: "Beranda", href: "#beranda" },
    { label: "Program", href: "#program" },
    { label: "Biaya", href: "#biaya" },
    { label: "Legalitas", href: "#legalitas" },
    { label: "Artikel", href: "#artikel" },
    { label: "Kontak", href: "#kontak" },
  ]

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="banner"
      bg={scrolled ? "white" : "white"}
      borderBottomWidth="1px"
      borderBottomColor="gray.100"
      shadow="sm"
      transition="all 0.3s ease"
    >
      <Container maxW="7xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <HStack gap="3" cursor="pointer" onClick={() => navigate("/")}>
            <Image src="/logo.png" h="20" w="20" objectFit="contain" alt="Logo" />
          </HStack>

          <HStack gap="6" display={{ base: "none", md: "flex" }}>
            {navLinks.map((link) => (
              <Text
                key={link.label}
                as="a"
                href={`/${link.href}`}
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
                _hover={{ color: "orange.400" }}
                cursor="pointer"
                textDecoration="none"
                transition="color 0.2s"
              >
                {link.label}
              </Text>
            ))}
          </HStack>

          <HStack gap="3">
            <Button
              colorPalette="orange"
              size="sm"
              onClick={() => navigate("/daftar")}
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
              color="gray.800"
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
                  as="a"
                  href={`/${link.href}`}
                  fontSize="sm"
                  fontWeight="medium"
                  color="gray.700"
                  py="2"
                  onClick={() => setMenuOpen(false)}
                  cursor="pointer"
                >
                  {link.label}
                </Text>
              ))}
              <Button colorPalette="orange" size="sm" w="full" onClick={() => navigate("/daftar")}>
                Daftar
              </Button>
            </VStack>
          </Box>
        )}
      </Container>
    </Box>
  )
}

function Footer() {
  const navigate = useNavigate()
  const footerLinks = {
    Perusahaan: ["Tentang", "Cerita Sukses", "Pusat Bantuan"],
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
                <Text fontWeight="bold" fontSize="md" color="white">
                  AERO FORTE INDONESIA
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Lembaga Diklat AVSEC
                </Text>
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
                  <Icon fontSize="md">
                    <s.icon />
                  </Icon>
                </Box>
              ))}
            </HStack>
          </VStack>
          {Object.entries(footerLinks).map(([heading, items]) => (
            <VStack key={heading} alignItems="flex-start" gap="3">
              <Text color="white" fontWeight="semibold" fontSize="sm" mb="1">
                {heading}
              </Text>
              {items.map((item) => (
                <Text key={item} fontSize="sm" _hover={{ color: "white" }} cursor="pointer" transition="color 0.2s">
                  {item}
                </Text>
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

function renderSection(
  section: { type: string; text?: string; items?: string[] },
  idx: number
) {
  if (section.type === "heading") {
    return (
      <Heading
        key={idx}
        as="h3"
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        color="gray.900"
        mt="6"
        mb="3"
        lineHeight="1.3"
      >
        {section.text}
      </Heading>
    )
  }
  if (section.type === "list" && section.items) {
    return (
      <Box as="ol" key={idx} mt="3" mb="4" pl="2" style={{ listStyleType: "decimal" }}>
        {section.items.map((item, i) => (
          <Text
            as="li"
            key={i}
            fontSize="md"
            color="gray.700"
            lineHeight="1.8"
            mb="2"
            ml="6"
          >
            {item}
          </Text>
        ))}
      </Box>
    )
  }
  if (section.type === "quote") {
    return (
      <Box
        key={idx}
        borderLeftWidth="4px"
        borderLeftColor="orange.400"
        pl="6"
        my="6"
      >
        <Text fontSize="lg" color="gray.700" fontStyle="italic" lineHeight="1.8">
          {section.text}
        </Text>
      </Box>
    )
  }
  return (
    <Text key={idx} fontSize="md" color="gray.700" lineHeight="1.8" mb="4">
      {section.text}
    </Text>
  )
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = React.useState<StoredArticle | undefined>(undefined)
  const [otherArticles, setOtherArticles] = React.useState<StoredArticle[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    window.scrollTo(0, 0)
    if (!slug) return
    setLoading(true)
    getStoredArticleBySlug(slug).then((a) => {
      setArticle(a)
      setLoading(false)
    })
  }, [slug])

  React.useEffect(() => {
    getStoredArticles().then((all) => {
      setOtherArticles(all.filter((a) => a.slug !== slug))
    })
  }, [slug])

  if (loading) {
    return (
      <Box bg="white" minH="100vh" pt="20">
        <Container maxW="4xl" py="20" textAlign="center">
          <Text color="gray.500">Memuat artikel...</Text>
        </Container>
      </Box>
    )
  }

  if (!article) {
    return (
      <Box bg="white" minH="100vh" pt="20">
        <Container maxW="3xl" py="20" textAlign="center">
          <VStack gap="6">
            <Heading fontSize="2xl" color="gray.700">
              Artikel tidak ditemukan
            </Heading>
            <Button colorPalette="orange" onClick={() => navigate("/")}>
              Kembali ke Beranda
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  const otherArticlesList = otherArticles

  return (
    <Box bg="white" minH="100vh">
      <NavBar />

      <Box pt="20">
        <Container maxW="4xl" py={{ base: "8", md: "12" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/#artikel")}
            mb="6"
            color="gray.600"
            _hover={{ color: "orange.500" }}
          >
            <Icon mr="1"><LuArrowLeft /></Icon>
            Kembali ke Artikel
          </Button>

          <VStack gap="4" alignItems="flex-start" mb="8">
            <HStack gap="2" flexWrap="wrap">
              <Badge colorPalette="orange" borderRadius="full" px="3" py="1">
                {article.category}
              </Badge>
              <HStack gap="1.5">
                <Icon color="gray.400" fontSize="sm"><LuCalendarDays /></Icon>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">{article.date}</Text>
              </HStack>
            </HStack>
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="bold"
              color="gray.900"
              lineHeight="1.2"
            >
              {article.title}
            </Heading>
          </VStack>

          <Box borderRadius="2xl" overflow="hidden" mb="8" shadow="xl">
            <Image
              src={article.image}
              alt={article.title}
              w="full"
              h={{ base: "240px", md: "420px" }}
              objectFit="cover"
            />
          </Box>

          <Box
            fontSize="md"
            color="gray.700"
            lineHeight="1.8"
            sx={{
              "& p": { mb: "1rem" },
              "& h3": { mt: "1.5rem", mb: "0.75rem" },
            }}
          >
            {article.sections.map((section, idx) => renderSection(section, idx))}
          </Box>

          <Separator my="10" borderColor="gray.200" />

          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
            {article.prev ? (
              <Box
                as={Link}
                to={`/artikel/${article.prev.slug}`}
                p="5"
                bg="gray.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                transition="all 0.2s"
              >
                <HStack gap="1" mb="2">
                  <Icon color="gray.400" fontSize="sm"><LuChevronLeft /></Icon>
                  <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">Sebelumnya</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.800" lineHeight="1.4">
                  {article.prev.title}
                </Text>
              </Box>
            ) : <Box />}
            {article.next ? (
              <Box
                as={Link}
                to={`/artikel/${article.next.slug}`}
                p="5"
                bg="gray.50"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="gray.200"
                _hover={{ bg: "blue.50", borderColor: "blue.200" }}
                transition="all 0.2s"
                textAlign="right"
              >
                <HStack gap="1" mb="2" justifyContent="flex-end">
                  <Text fontSize="xs" color="gray.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">Selanjutnya</Text>
                  <Icon color="gray.400" fontSize="sm"><LuChevronRight /></Icon>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.800" lineHeight="1.4">
                  {article.next.title}
                </Text>
              </Box>
            ) : <Box />}
          </Grid>

          <VStack gap="4" mt="16" mb="8" textAlign="center">
            <Badge colorPalette="orange" size="lg" px="4" borderRadius="full">Artikel Lainnya</Badge>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.900">
              Baca Artikel Lain
            </Heading>
          </VStack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="6">
            {otherArticlesList.map((a) => (
              <Box
                key={a.slug}
                as={Link}
                to={`/artikel/${a.slug}`}
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                shadow="md"
                borderWidth="1px"
                borderColor="gray.100"
                _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
                transition="all 0.3s ease"
              >
                <Box h="40" overflow="hidden" position="relative">
                  <Image src={a.image} alt={a.title} w="full" h="full" objectFit="cover" />
                  <Box
                    position="absolute"
                    inset="0"
                    bgGradient="to-t"
                    gradientFrom="blue.950/40"
                    gradientTo="transparent"
                  />
                </Box>
                <Box p="5">
                  <HStack gap="2" mb="3">
                    <Icon color="blue.500" fontSize="sm"><LuCalendarDays /></Icon>
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">{a.date}</Text>
                  </HStack>
                  <Heading fontSize="md" fontWeight="bold" color="gray.900" lineHeight="tall" _hover={{ color: "blue.600" }} transition="color 0.2s">
                    {a.title}
                  </Heading>
                  <HStack gap="1" mt="3" color="blue.600">
                    <Text fontSize="sm" fontWeight="semibold">Baca Selengkapnya</Text>
                    <Icon fontSize="sm"><LuChevronRight /></Icon>
                  </HStack>
                </Box>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />

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
    </Box>
  )
}
