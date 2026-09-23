import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LuPlane, LuLock, LuMail, LuEye, LuEyeOff } from "react-icons/lu"
import { Field } from "@/components/ui/field"
import { login, setCurrentUser, setToken } from "@/store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password wajib diisi.")
      return
    }
    setLoading(true)
    setError("")
    const result = await login(email, password)
    if (result) {
      setToken(result.token)
      setCurrentUser(result.user)
      if (result.user.role === "superadmin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/official/dashboard")
      }
    } else {
      setError("Email atau password salah.")
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Left side - Image/Brand */}
      <Box
        display={{ base: "none", lg: "flex" }}
        flex="1"
        bg="linear-gradient(135deg, #050c1f 0%, #0a1628 50%, #1a3a6b 100%)"
        pos="relative"
        overflow="hidden"
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        gap="8"
        p="12"
      >
        <Box
          pos="absolute"
          bottom="-20"
          right="-20"
          w="500px"
          h="500px"
          rounded="full"
          bg="blue.600"
          opacity="0.1"
          filter="blur(80px)"
        />
        <Box
          pos="absolute"
          inset="0"
          opacity="0.2"
          bgImage="url(/hero-banner.webp)"
          bgSize="cover"
          bgPos="center"
        />
        <Box
          pos="absolute"
          inset="0"
          bg="linear-gradient(to bottom, rgba(5,12,31,0.8), rgba(5,12,31,0.9))"
        />

        <Box pos="relative" textAlign="center">
          <Stack gap="6" align="center">
            <Box
              w="20"
              h="20"
              bg="blue.500"
              rounded="2xl"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="2xl"
            >
              <Icon color="white" fontSize="4xl"><LuPlane /></Icon>
            </Box>
            <Stack gap="2" textAlign="center">
              <Heading fontSize="4xl" fontWeight="black" color="white" letterSpacing="tight">
                AeroForte
              </Heading>
              <Text color="blue.300" fontSize="lg" fontWeight="medium">
                Akademi Penerbangan Profesional
              </Text>
            </Stack>
            <Box h="1px" w="48" bg="whiteAlpha.200" />
            <Text color="whiteAlpha.600" fontSize="sm" maxW="xs" textAlign="center" lineHeight="tall">
              Platform manajemen pendaftaran dan administrasi akademi penerbangan terbaik Indonesia.
            </Text>
          </Stack>
        </Box>
      </Box>

      {/* Right side - Login Form */}
      <Flex flex="1" alignItems="center" justifyContent="center" p="8">
        <Container maxW="sm" w="full">
          <Stack gap="8">
            {/* Mobile logo */}
            <HStack gap="3" display={{ lg: "none" }}>
              <Box
                w="10"
                h="10"
                bg="blue.500"
                rounded="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon color="white" fontSize="lg"><LuPlane /></Icon>
              </Box>
              <Text fontWeight="bold" fontSize="xl" color="gray.900">AeroForte</Text>
            </HStack>

            <Stack gap="2">
              <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
                Masuk ke Dashboard
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Masukkan kredensial Anda untuk mengakses panel admin.
              </Text>
            </Stack>

            <Stack gap="5">
              <Field label="Email">
                <Box pos="relative" w="full">
                  <Box
                    pos="absolute"
                    left="3"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="1"
                    color="gray.500"
                  >
                    <Icon fontSize="sm"><LuMail /></Icon>
                  </Box>
                  <Input
                    type="email"
                    placeholder="Masukkan email"
                    pl="9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </Box>
              </Field>

              <Field label="Password">
                <Box pos="relative" w="full">
                  <Box
                    pos="absolute"
                    left="3"
                    top="50%"
                    transform="translateY(-50%)"
                    zIndex="1"
                    color="gray.500"
                  >
                    <Icon fontSize="sm"><LuLock /></Icon>
                  </Box>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    pl="9"
                    pr="10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Box
                    pos="absolute"
                    right="3"
                    top="50%"
                    transform="translateY(-50%)"
                    cursor="pointer"
                    color="gray.500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon fontSize="sm">{showPassword ? <LuEyeOff /> : <LuEye />}</Icon>
                  </Box>
                </Box>
              </Field>

              {error && (
                <Box bg="red.50" rounded="lg" px="4" py="3" border="1px solid" borderColor="red.200">
                  <Text color="red.600" fontSize="sm">{error}</Text>
                </Box>
              )}

              <Button
                bg="blue.500"
                color="white"
                w="full"
                size="lg"
                _hover={{ bg: "blue.400" }}
                onClick={handleLogin}
                loading={loading}
              >
                Masuk
              </Button>
            </Stack>

            <Box
              bg="blue.50"
              rounded="xl"
              p="4"
              border="1px solid"
              borderColor="blue.100"
            >
              <Stack gap="2">
                <Text fontSize="xs" fontWeight="semibold" color="blue.700" textTransform="uppercase" letterSpacing="wider">
                  Akses Demo
                </Text>
                <Stack gap="1">
                  <Text fontSize="xs" color="gray.600">Super Admin: <Text as="span" color="gray.900" fontWeight="medium">admin@gmail.com / admin123</Text></Text>
                  <Text fontSize="xs" color="gray.600">Official Admin: <Text as="span" color="gray.900" fontWeight="medium">officialadmin@gmail.com / 123456</Text></Text>
                </Stack>
              </Stack>
            </Box>

            <Text fontSize="sm" color="gray.500" textAlign="center">
              <Text as="span" color="blue.600" cursor="pointer" _hover={{ textDecoration: "underline" }} onClick={() => navigate("/")}>
                ← Kembali ke Beranda
              </Text>
            </Text>
          </Stack>
        </Container>
      </Flex>
    </Flex>
  )
}
