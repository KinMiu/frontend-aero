import {
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Input,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { getOfficials, createOfficial, deleteOfficial, type OfficialAdmin } from "@/store"

import { LuPlus, LuTrash2, LuUserCheck } from "react-icons/lu"
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
export default function ManageOfficials() {
  const [officials, setOfficials] = useState<OfficialAdmin[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const refresh = () => getOfficials().then(setOfficials)

  useEffect(() => {
    refresh()
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Semua field wajib diisi.")
      return
    }
    const exists = officials.find((o) => o.email === form.email)
    if (exists) {
      setError("Email sudah digunakan.")
      return
    }
    setLoading(true)
    try {
      await createOfficial(form)
      setForm({ name: "", email: "", phone: "", password: "" })
      setError("")
      setModalOpen(false)
      refresh()
    } catch {
      setError("Gagal menambah official admin.")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deleteOfficial(id)
    refresh()
    setDeleteId(null)
  }

  return (
    <Stack gap="8">
      <HStack justify="space-between" flexWrap="wrap" gap="4">
        <Stack gap="1">
          <Heading fontSize="2xl" fontWeight="bold" color="gray.900">Kelola Official Admin</Heading>
          <Text color="gray.500" fontSize="sm">{officials.length} official admin terdaftar</Text>
        </Stack>
        <Button
          bg="blue.500"
          color="white"
          _hover={{ bg: "blue.400" }}
          onClick={() => setModalOpen(true)}
        >
          <Icon><LuPlus /></Icon>
          Tambah Admin
        </Button>
      </HStack>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        rounded="2xl"
        overflow="hidden"
      >
        <Table.Root>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Nama</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider">Email</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>No HP</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" display={{ base: "none", md: "table-cell" }}>Tanggal Dibuat</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight="semibold" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="center">Aksi</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {officials.map((o) => (
              <Table.Row key={o.id} _hover={{ bg: "bg.subtle" }} transition="background 0.15s">
                <Table.Cell>
                  <HStack gap="3">
                    <Box
                      w="8"
                      h="8"
                      bg="green.100"
                      
                      rounded="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon color="green.600"  fontSize="sm"><LuUserCheck /></Icon>
                    </Box>
                    <Text fontWeight="medium" fontSize="sm" color="gray.900">{o.name}</Text>
                  </HStack>
                </Table.Cell>
                <Table.Cell>
                  <Text fontSize="sm" color="gray.500">{o.email}</Text>
                </Table.Cell>
                <Table.Cell display={{ base: "none", md: "table-cell" }}>
                  <Text fontSize="sm" color="gray.500">{o.phone}</Text>
                </Table.Cell>
                <Table.Cell display={{ base: "none", md: "table-cell" }}>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <Button
                    size="xs"
                    variant="ghost"
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    onClick={() => setDeleteId(o.id)}
                  >
                    <Icon><LuTrash2 /></Icon>
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
            {officials.length === 0 && (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center" py="12">
                  <Text color="gray.500">Belum ada official admin</Text>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Add Modal */}
      <DialogRoot open={modalOpen} onOpenChange={(e) => { setModalOpen(e.open); setError("") }} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Official Admin</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              {error && (
                <Box bg="red.50"  rounded="lg" px="4" py="3" border="1px solid" borderColor="red.200">
                  <Text color="red.600"  fontSize="sm">{error}</Text>
                </Box>
              )}
              <Field label="Nama Lengkap" required>
                <Input placeholder="Nama lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Nomor HP" required>
                <Input placeholder="Nomor HP" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Password" required>
                <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setModalOpen(false)}>Batal</Button>
              <Button bg="blue.500" color="white" flex="1" _hover={{ bg: "blue.400" }} onClick={handleAdd}>Simpan</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirm Modal */}
      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Official Admin</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text color="gray.500" fontSize="sm">Apakah Anda yakin ingin menghapus official admin ini? Tindakan ini tidak dapat dibatalkan.</Text>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button bg="red.500" color="white" flex="1" _hover={{ bg: "red.400" }} onClick={() => deleteId && handleDelete(deleteId)}>Hapus</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Stack>
  )
}
