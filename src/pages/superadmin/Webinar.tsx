import {
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Icon,
  Input,
  Stack,
  Text,
  Textarea,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import * as React from "react"
import {
  LuPlus,
  LuTrash2,
  LuVideo,
  LuX,
  LuPencil,
  LuEye,
  LuUsers,
  LuCalendar,
  LuClock,
  LuLink,
  LuCopy,
  LuCheck,
} from "react-icons/lu"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { toaster } from "@/components/ui/toaster"
import {
  createWebinar,
  deleteWebinar,
  getAllWebinars,
  getWebinarRegistrations,
  updateWebinar,
  type Webinar,
  type WebinarField,
  type WebinarRegistration,
} from "@/store"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const defaultFields: WebinarField[] = [
  { label: "Nama Lengkap", type: "text", required: true },
  { label: "Email", type: "email", required: true },
  { label: "Nomor Telepon", type: "tel", required: true },
]

export default function WebinarPage() {
  const [webinars, setWebinars] = React.useState<Webinar[]>([])
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [detailWebinar, setDetailWebinar] = React.useState<Webinar | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // form state
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState(toDateInput(new Date()))
  const [time, setTime] = React.useState("19:00")
  const [description, setDescription] = React.useState("")
  const [waLink, setWaLink] = React.useState("")
  const [fields, setFields] = React.useState<WebinarField[]>([...defaultFields])
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // detail state
  const [registrations, setRegistrations] = React.useState<WebinarRegistration[]>([])
  const [loadingRegs, setLoadingRegs] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/#/webinar/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const refresh = async () => {
    try {
      setWebinars(await getAllWebinars())
    } catch {
      setWebinars([])
    }
  }

  React.useEffect(() => {
    refresh()
  }, [])

  const resetForm = () => {
    setTitle("")
    setDate(toDateInput(new Date()))
    setTime("19:00")
    setDescription("")
    setWaLink("")
    setFields([...defaultFields])
    setEditingId(null)
  }

  const openEdit = (w: Webinar) => {
    setEditingId(w.id)
    setTitle(w.title)
    setDate(toDateInput(new Date(w.date)))
    setTime(w.time)
    setDescription(w.description)
    setWaLink(w.waLink)
    setFields(w.fields.length > 0 ? [...w.fields] : [...defaultFields])
    setEditOpen(true)
  }

  const addField = () => {
    setFields((prev) => [...prev, { label: "", type: "text", required: false }])
  }

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateField = (idx: number, key: keyof WebinarField, value: string | boolean) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)))
  }

  const validate = (): boolean => {
    if (!title.trim()) {
      toaster.create({ title: "Nama webinar wajib diisi", type: "error" })
      return false
    }
    if (!date) {
      toaster.create({ title: "Tanggal webinar wajib diisi", type: "error" })
      return false
    }
    if (!time.trim()) {
      toaster.create({ title: "Jam webinar wajib diisi", type: "error" })
      return false
    }
    const validFields = fields.filter((f) => f.label.trim())
    if (validFields.length === 0) {
      toaster.create({ title: "Minimal 1 field data peserta wajib diisi", type: "error" })
      return false
    }
    return true
  }

  const handleAdd = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await createWebinar({
        title: title.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        description: description.trim(),
        waLink: waLink.trim(),
        fields: fields.filter((f) => f.label.trim()),
      })
      resetForm()
      setAddOpen(false)
      await refresh()
      toaster.create({ title: "Webinar berhasil dibuat", type: "success" })
    } catch (err) {
      toaster.create({ title: "Gagal membuat webinar", description: err instanceof Error ? err.message : undefined, type: "error" })
    }
    setLoading(false)
  }

  const handleEdit = async () => {
    if (!editingId) return
    if (!validate()) return
    setLoading(true)
    try {
      await updateWebinar(editingId, {
        title: title.trim(),
        date: new Date(date).toISOString(),
        time: time.trim(),
        description: description.trim(),
        waLink: waLink.trim(),
        fields: fields.filter((f) => f.label.trim()),
      })
      resetForm()
      setEditOpen(false)
      await refresh()
      toaster.create({ title: "Webinar berhasil diperbarui", type: "success" })
    } catch (err) {
      toaster.create({ title: "Gagal memperbarui webinar", description: err instanceof Error ? err.message : undefined, type: "error" })
    }
    setLoading(false)
  }

  const handleToggleActive = async (w: Webinar) => {
    try {
      await updateWebinar(w.id, { isActive: !w.isActive })
      await refresh()
      toaster.create({
        title: w.isActive ? "Webinar dinonaktifkan" : "Webinar diaktifkan",
        type: w.isActive ? "info" : "success",
      })
    } catch {
      toaster.create({ title: "Gagal mengubah status", type: "error" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWebinar(id)
      setDeleteId(null)
      await refresh()
      toaster.create({ title: "Webinar dihapus", type: "info" })
    } catch (err) {
      toaster.create({ title: "Gagal menghapus webinar", description: err instanceof Error ? err.message : undefined, type: "error" })
    }
  }

  const openDetail = async (w: Webinar) => {
    setDetailWebinar(w)
    setLoadingRegs(true)
    try {
      const regs = await getWebinarRegistrations(w.id)
      setRegistrations(regs)
    } catch {
      setRegistrations([])
    }
    setLoadingRegs(false)
  }

  const fieldEditor = (
    <Box>
      <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb="3">
        Kelola Data Peserta
      </Text>
      <Text fontSize="xs" color="gray.500" mb="3">
        Tentukan data apa saja yang harus diisi peserta saat mendaftar webinar.
      </Text>
      <VStack gap="2" alignItems="stretch">
        {fields.map((field, idx) => (
          <HStack key={idx} gap="2">
            <Input
              placeholder="Label field (cth: Nama Lengkap)"
              value={field.label}
              onChange={(e) => updateField(idx, "label", e.target.value)}
              flex="1"
            />
            <Box as="select"
              value={field.type}
              onChange={(e) => updateField(idx, "type", e.target.value)}
              w="120px"
              flexShrink="0"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="md"
              px="2"
              py="2"
              fontSize="sm"
              style={{ paddingRight: "2rem" }}
            >
              <option value="text">Teks</option>
              <option value="email">Email</option>
              <option value="tel">Telepon</option>
              <option value="number">Angka</option>
              <option value="date">Tanggal</option>
              <option value="textarea">Paragraf</option>
            </Box>
            <HStack gap="1" flexShrink="0">
              <Switch
                checked={field.required}
                onChange={(e) => updateField(idx, "required", e.target.checked)}
              />
              <Text fontSize="xs" color="gray.500" w="20px">*</Text>
            </HStack>
            <Button
              variant="ghost"
              size="sm"
              colorPalette="red"
              onClick={() => removeField(idx)}
              flexShrink="0"
              px="2"
            >
              <Icon><LuX /></Icon>
            </Button>
          </HStack>
        ))}
      </VStack>
      <Button variant="outline" size="sm" mt="3" onClick={addField}>
        <Icon><LuPlus /></Icon>
        Tambah Field
      </Button>
    </Box>
  )

  const formFields = (
    <Stack gap="4">
      <Field label="Nama Webinar" required>
        <Input
          placeholder="Contoh: Webinar Karier AVSEC 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <HStack gap="4" w="full">
        <Field label="Tanggal Webinar" required flex="1">
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Jam Webinar" required flex="1">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Field>
      </HStack>
      <Field label="Deskripsi Webinar">
        <Textarea
          placeholder="Deskripsi singkat tentang webinar..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </Field>
      <Field label="Link Grup WhatsApp Webinar">
        <Input
          placeholder="https://chat.whatsapp.com/..."
          value={waLink}
          onChange={(e) => setWaLink(e.target.value)}
        />
      </Field>
      {fieldEditor}
    </Stack>
  )

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Kelola Webinar
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Buat dan kelola webinar. Peserta mendaftar melalui link pendaftaran yang dapat ditautkan ke poster iklan.
        </Text>
      </VStack>

      <HStack justifyContent="space-between" mb="4">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Daftar Webinar ({webinars.length})
        </Text>
        <Button colorPalette="orange" size="sm" onClick={() => { resetForm(); setAddOpen(true) }}>
          <Icon><LuPlus /></Icon>
          Tambah Webinar
        </Button>
      </HStack>

      {webinars.length === 0 ? (
        <Box bg="gray.50" borderRadius="xl" p="12" textAlign="center">
          <VStack gap="3">
            <Icon fontSize="3xl" color="gray.300"><LuVideo /></Icon>
            <Text color="gray.500">Belum ada webinar</Text>
          </VStack>
        </Box>
      ) : (
        <VStack gap="3" alignItems="stretch">
          {webinars.map((w) => (
            <Box
              key={w.id}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="xl"
              p="5"
              _hover={{ shadow: "md", borderColor: "gray.300" }}
              transition="all 0.2s"
            >
              <HStack gap="4" alignItems="flex-start">
                <Box
                  bg={w.isActive ? "green.50" : "gray.100"}
                  borderRadius="lg"
                  p="3"
                  flexShrink="0"
                >
                  <Icon fontSize="xl" color={w.isActive ? "green.600" : "gray.400"}><LuVideo /></Icon>
                </Box>
                <VStack gap="1" alignItems="flex-start" flex="1">
                  <HStack gap="2">
                    <Text fontWeight="semibold" color="gray.800" fontSize="sm">{w.title}</Text>
                    {w.isActive ? (
                      <Badge colorPalette="green" size="sm">Aktif</Badge>
                    ) : (
                      <Badge colorPalette="gray" size="sm">Nonaktif</Badge>
                    )}
                  </HStack>
                  <HStack gap="3" flexWrap="wrap">
                    <HStack gap="1">
                      <Icon color="gray.400" fontSize="sm"><LuCalendar /></Icon>
                      <Text fontSize="xs" color="gray.500">{formatDate(w.date)}</Text>
                    </HStack>
                    <HStack gap="1">
                      <Icon color="gray.400" fontSize="sm"><LuClock /></Icon>
                      <Text fontSize="xs" color="gray.500">{w.time}</Text>
                    </HStack>
                    {w.waLink && (
                      <HStack gap="1">
                        <Icon color="gray.400" fontSize="sm"><LuLink /></Icon>
                        <Text fontSize="xs" color="gray.500">Link WA tersedia</Text>
                      </HStack>
                    )}
                  </HStack>
                  <Text fontSize="xs" color="gray.400">
                    {w.fields.length} field data peserta
                  </Text>
                </VStack>
                <HStack gap="1">
                  <Button
                    variant="ghost"
                    size="sm"
                    colorPalette={copiedId === w.id ? "green" : "gray"}
                    onClick={() => copyLink(w.id)}
                    title="Salin link pendaftaran"
                  >
                    <Icon>{copiedId === w.id ? <LuCheck /> : <LuCopy />}</Icon>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorPalette="blue"
                    onClick={() => openDetail(w)}
                  >
                    <Icon><LuEye /></Icon>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorPalette="blue"
                    onClick={() => openEdit(w)}
                  >
                    <Icon><LuPencil /></Icon>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    colorPalette="red"
                    onClick={() => setDeleteId(w.id)}
                  >
                    <Icon><LuTrash2 /></Icon>
                  </Button>
                </HStack>
              </HStack>
              <HStack gap="4" mt="3" pt="3" borderTop="1px solid" borderColor="gray.100">
                <HStack gap="2">
                  <Switch
                    checked={w.isActive}
                    onChange={() => handleToggleActive(w)}
                    size="sm"
                  />
                  <Text fontSize="xs" color="gray.500">{w.isActive ? "Aktif" : "Nonaktif"}</Text>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Add Modal */}
      <DialogRoot open={addOpen} onOpenChange={(e) => { setAddOpen(e.open); if (!e.open) resetForm() }} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Webinar</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {formFields}
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setAddOpen(false)}>Batal</Button>
              <Button colorPalette="orange" flex="1" loading={loading} onClick={handleAdd}>Simpan</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Edit Modal */}
      <DialogRoot open={editOpen} onOpenChange={(e) => { setEditOpen(e.open); if (!e.open) resetForm() }} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Webinar</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {formFields}
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button colorPalette="orange" flex="1" loading={loading} onClick={handleEdit}>Simpan Perubahan</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Detail Modal */}
      <DialogRoot open={!!detailWebinar} onOpenChange={(e) => !e.open && setDetailWebinar(null)} size="xl">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Webinar</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {detailWebinar && (
              <VStack gap="4" alignItems="stretch">
                <Box bg="gray.50" borderRadius="lg" p="4">
                  <VStack gap="2" alignItems="flex-start">
                    <Text fontWeight="bold" color="gray.800" fontSize="md">{detailWebinar.title}</Text>
                    <HStack gap="4">
                      <HStack gap="1">
                        <Icon color="gray.400" fontSize="sm"><LuCalendar /></Icon>
                        <Text fontSize="sm" color="gray.600">{formatDate(detailWebinar.date)}</Text>
                      </HStack>
                      <HStack gap="1">
                        <Icon color="gray.400" fontSize="sm"><LuClock /></Icon>
                        <Text fontSize="sm" color="gray.600">{detailWebinar.time}</Text>
                      </HStack>
                    </HStack>
                    {detailWebinar.description && (
                      <Text fontSize="sm" color="gray.600" mt="1">{detailWebinar.description}</Text>
                    )}
                    {detailWebinar.waLink && (
                      <HStack gap="1" mt="1">
                        <Icon color="green.500" fontSize="sm"><LuLink /></Icon>
                        <Text fontSize="sm" color="green.600" fontWeight="medium">Link WA tersedia</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                <HStack gap="2" alignItems="center">
                  <Icon color="blue.500"><LuUsers /></Icon>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                    Peserta Terdaftar ({registrations.length})
                  </Text>
                </HStack>

                {loadingRegs ? (
                  <Text fontSize="sm" color="gray.400">Memuat data peserta...</Text>
                ) : registrations.length === 0 ? (
                  <Box bg="gray.50" borderRadius="lg" p="6" textAlign="center">
                    <Text color="gray.400" fontSize="sm">Belum ada peserta mendaftar</Text>
                  </Box>
                ) : (
                  <Box overflowX="auto" borderWidth="1px" borderColor="gray.200" borderRadius="lg">
                    <SimpleGrid columns={detailWebinar.fields.length + 1} gap="0" minWidth="100%">
                      <Box bg="gray.50" px="3" py="2" borderBottom="1px solid" borderColor="gray.200">
                        <Text fontSize="xs" fontWeight="bold" color="gray.600">No</Text>
                      </Box>
                      {detailWebinar.fields.map((f, i) => (
                        <Box key={i} bg="gray.50" px="3" py="2" borderBottom="1px solid" borderColor="gray.200">
                          <Text fontSize="xs" fontWeight="bold" color="gray.600">{f.label}</Text>
                        </Box>
                      ))}
                      {registrations.map((reg, ri) => (
                        <React.Fragment key={reg.id}>
                          <Box px="3" py="2" borderBottom={ri < registrations.length - 1 ? "1px solid" : "none"} borderColor="gray.100">
                            <Text fontSize="xs" color="gray.700">{ri + 1}</Text>
                          </Box>
                          {detailWebinar.fields.map((f, fi) => (
                            <Box key={fi} px="3" py="2" borderBottom={ri < registrations.length - 1 ? "1px solid" : "none"} borderColor="gray.100">
                              <Text fontSize="xs" color="gray.700">{reg.data?.[f.label] || "-"}</Text>
                            </Box>
                          ))}
                        </React.Fragment>
                      ))}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            )}
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              {detailWebinar && (
                <Button
                  variant="outline"
                  flex="1"
                  colorPalette={copiedId === detailWebinar.id ? "green" : "gray"}
                  onClick={() => copyLink(detailWebinar.id)}
                >
                  <Icon>{copiedId === detailWebinar.id ? <LuCheck /> : <LuCopy />}</Icon>
                  {copiedId === detailWebinar.id ? "Tersalin!" : "Salin Link Pendaftaran"}
                </Button>
              )}
              <Button variant="outline" flex="1" onClick={() => setDetailWebinar(null)}>Tutup</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirm */}
      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Webinar</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text color="gray.500" fontSize="sm">
              Apakah Anda yakin ingin menghapus webinar ini? Semua data pendaftaran juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </Text>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setDeleteId(null)}>Batal</Button>
              <Button bg="red.500" color="white" flex="1" _hover={{ bg: "red.400" }} onClick={() => deleteId && handleDelete(deleteId)}>Hapus</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  )
}
