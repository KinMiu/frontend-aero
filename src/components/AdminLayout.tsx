import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useNavigate, useLocation } from "react-router-dom"
import { LuLogOut, LuPlane, LuMenu, LuX, LuChevronDown, LuChevronRight } from "react-icons/lu"
import { setCurrentUser, getCurrentUser } from "@/store"
import { useState } from "react"

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  children?: { label: string; path: string; icon: React.ElementType }[]
}

interface AdminLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
}

export default function AdminLayout({ children, navItems }: AdminLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = getCurrentUser()

  // Auto-expand any group whose child is active
  const initialExpanded = navItems
    .filter((item) => item.children?.some((c) => location.pathname === c.path))
    .map((item) => item.label)
  const [expanded, setExpanded] = useState<string[]>(initialExpanded)

  const handleLogout = () => {
    setCurrentUser(null)
    navigate("/login")
  }

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  const SidebarContent = () => (
    <Stack h="full" justify="space-between" overflowY="auto">
      <Stack gap="0">
        {/* Logo */}
        <Box px="6" py="6" borderBottom="1px solid" borderColor="gray.200">
          <HStack gap="3">
            <Box
              w="9"
              h="9"
              bg="blue.500"
              rounded="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon color="white" fontSize="lg"><LuPlane /></Icon>
            </Box>
            <Stack gap="0">
              <Text fontWeight="bold" fontSize="md" color="gray.900">AeroForte</Text>
              <Text fontSize="xs" color="gray.500">
                {user?.role === "superadmin" ? "Super Admin" : "Official Admin"}
              </Text>
            </Stack>
          </HStack>
        </Box>

        {/* Nav items */}
        <Stack gap="1" p="4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const hasChildren = !!item.children
            const isExpanded = expanded.includes(item.label)
            const childActive = hasChildren && item.children!.some((c) => location.pathname === c.path)

            if (hasChildren) {
              return (
                <Stack key={item.label} gap="1">
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    gap="3"
                    px="4"
                    h="10"
                    fontWeight={childActive ? "semibold" : "normal"}
                    bg={childActive ? "blue.50" : "transparent"}
                    color={childActive ? "blue.600" : "gray.600"}
                    _hover={{ bg: "gray.100", color: "gray.900" }}
                    borderRadius="lg"
                    onClick={() => toggleExpand(item.label)}
                  >
                    <Icon fontSize="md"><item.icon /></Icon>
                    <Text fontSize="sm" flex="1" textAlign="left">{item.label}</Text>
                    <Icon fontSize="xs" color="gray.400">
                      {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
                    </Icon>
                  </Button>
                  {isExpanded && (
                    <Stack gap="1" pl="4" mt="1">
                      {item.children!.map((child) => {
                        const childIs = location.pathname === child.path
                        return (
                          <Button
                            key={child.path}
                            variant="ghost"
                            justifyContent="flex-start"
                            gap="3"
                            px="4"
                            h="9"
                            fontWeight={childIs ? "semibold" : "normal"}
                            bg={childIs ? "blue.50" : "transparent"}
                            color={childIs ? "blue.600" : "gray.500"}
                            _hover={{ bg: "gray.100", color: "gray.900" }}
                            borderRadius="lg"
                            onClick={() => {
                              navigate(child.path)
                              setSidebarOpen(false)
                            }}
                          >
                            <Icon fontSize="sm"><child.icon /></Icon>
                            <Text fontSize="sm">{child.label}</Text>
                          </Button>
                        )
                      })}
                    </Stack>
                  )}
                </Stack>
              )
            }

            return (
              <Button
                key={item.path}
                variant="ghost"
                justifyContent="flex-start"
                gap="3"
                px="4"
                h="10"
                fontWeight={isActive ? "semibold" : "normal"}
                bg={isActive ? "blue.50" : "transparent"}
                color={isActive ? "blue.600" : "gray.600"}
                _hover={{ bg: "gray.100", color: "gray.900" }}
                borderRadius="lg"
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
              >
                <Icon fontSize="md"><item.icon /></Icon>
                <Text fontSize="sm">{item.label}</Text>
              </Button>
            )
          })}
        </Stack>
      </Stack>

      {/* User + logout */}
      <Box px="4" py="4" borderTop="1px solid" borderColor="gray.200">
        <Stack gap="3">
          <Box bg="gray.50" rounded="xl" p="3">
            <Stack gap="0">
              <Text fontSize="sm" fontWeight="semibold" color="gray.900">{user?.name}</Text>
              <Text fontSize="xs" color="gray.500" textTransform="capitalize">{user?.role}</Text>
            </Stack>
          </Box>
          <Button
            variant="ghost"
            justifyContent="flex-start"
            gap="3"
            px="4"
            h="10"
            color="red.500"
            _hover={{ bg: "red.50" }}
            borderRadius="lg"
            onClick={handleLogout}
          >
            <Icon fontSize="md"><LuLogOut /></Icon>
            <Text fontSize="sm">Keluar</Text>
          </Button>
        </Stack>
      </Box>
    </Stack>
  )

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar - Desktop */}
      <Box
        display={{ base: "none", md: "flex" }}
        flexDir="column"
        w="64"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        pos="fixed"
        h="100vh"
        top="0"
        left="0"
        zIndex="docked"
      >
        <SidebarContent />
      </Box>

      {/* Sidebar overlay - Mobile */}
      {sidebarOpen && (
        <Box
          pos="fixed"
          inset="0"
          zIndex="overlay"
          bg="blackAlpha.600"
          display={{ md: "none" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Box
        display={{ base: "flex", md: "none" }}
        flexDir="column"
        pos="fixed"
        h="100vh"
        w="72"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        zIndex="modal"
        top="0"
        left="0"
        transform={sidebarOpen ? "translateX(0)" : "translateX(-100%)"}
        transition="transform 0.3s"
      >
        <SidebarContent />
      </Box>

      {/* Main content */}
      <Box flex="1" ml={{ base: "0", md: "64" }} minH="100vh">
        {/* Mobile topbar */}
        <Box
          display={{ base: "flex", md: "none" }}
          alignItems="center"
          h="14"
          px="4"
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          gap="4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icon>
              {sidebarOpen ? <LuX /> : <LuMenu />}
            </Icon>
          </Button>
          <Text fontWeight="bold" fontSize="md" color="gray.900">AeroForte</Text>
        </Box>

        <Box p={{ base: "4", md: "8" }}>
          {children}
        </Box>
      </Box>
    </Flex>
  )
}
