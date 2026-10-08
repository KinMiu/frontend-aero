import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Stack,
  Table,
  Text,
  VStack,
  Badge,
  Input,
  Textarea,
} from "@chakra-ui/react"
import * as React from "react"
import { LuPlus, LuTrash2, LuPencil, LuShare2, LuLink, LuClock, LuCopy, LuCircleX, LuStar, LuImage, LuVideo } from "react-icons/lu"
import { ImageUpload } from "@/components/ImageUpload"
import { MediaUpload, type MediaItem } from "@/components/MediaUpload"
import {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getActiveTestimonialLink,
  createTestimonialLink,
  deactivateTestimonialLink,
  type Testimonial,
  type TestimonialLink,
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
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = React.useState<Testimonial[]>([])
  const [activeLink, setActiveLink] = React.useState<TestimonialLink | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [linkInfoOpen, setLinkInfoOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Testimonial | null>(null)
  const [form, setForm] = React.useState({ name: "", role: "", text: "", avatar: "", photoUrl: "", media: [] as MediaItem[], rating: 5 })
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [now, setNow] = React.useState(new Date())

  const refresh = async () => {
    try {
      const [ts, link] = await Promise.all([getTestimonials(), getActiveTestimonialLink()])
      setTestimonials(ts)
      setActiveLink(link)
    } catch {
      setTestimonials([])
      setActiveLink(null)
    }
  }

  React.useEffect(() => {
    refresh()
  }, [])

  // Live countdown for active link
  React.useEffect(() => {
    if (!linkInfoOpen || !activeLink) return
    const interval = setInterval(() => {
      setNow(new Date())
      const stillValid = activeLink.isActive && new Date(activeLink.expiresAt) > new Date()
      if (!stillValid) {
        getActiveTestimonialLink().then(setActiveLink)
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [linkInfoOpen, activeLink])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: "", role: "", text: "", avatar: "", photoUrl: "", media: [], rating: 5 })
    setEditOpen(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditing(t)
    setForm({ name: t.name, role: t.role, text: t.text, avatar: t.avatar, photoUrl: t.photoUrl || "", media: t.media || [], rating: t.rating })
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.text) {
      toaster.create({ title: "Nama dan testimoni wajib diisi", type: "error" })
      return
    }
    setLoading(true)
    const avatar = form.avatar || form.name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()
    try {
      if (editing) {
        await updateTestimonial(editing.id, { ...form, avatar })
        toaster.create({ title: "Testimoni diperbarui", type: "success" })
      } else {
        await addTestimonial({ ...form, avatar })
        toaster.create({ title: "Testimoni ditambahkan", type: "success" })
      }
      setEditOpen(false)
      await refresh()
    } catch {
      toaster.create({ title: "Gagal menyimpan testimoni", type: "error" })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deleteTestimonial(id)
    await refresh()
    toaster.create({ title: "Testimoni dihapus", type: "info" })
  }

  const handleShareLink = async () => {
    try {
      const link = await createTestimonialLink()
      setActiveLink(link)
      setShareOpen(false)
      setLinkInfoOpen(true)
      await refresh()
      toaster.create({ title: "Link testimoni diaktifkan", type: "success" })
    } catch {
      toaster.create({ title: "Gagal mengaktifkan link", type: "error" })
    }
  }

  const handleDeactivate = async () => {
    if (!activeLink) return
    await deactivateTestimonialLink(activeLink.id)
    setActiveLink(null)
    setLinkInfoOpen(false)
    await refresh()
    toaster.create({ title: "Link dinonaktifkan", type: "info" })
  }

  const shareUrl = activeLink
    ? `${window.location.origin}${window.location.pathname}#/testimoni-public/${activeLink.token}`
    : ""

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTimeRemaining = () => {
    if (!activeLink) return ""
    const diff = new Date(activeLink.expiresAt).getTime() - now.getTime()
    if (diff <= 0) return "Link telah berakhir"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${hours}j ${minutes}m ${seconds}d`
  }

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Kelola Testimoni
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Tambah, edit, hapus testimoni, dan bagikan link publik untuk input testimoni
        </Text>
      </VStack>

      {/* Share link section */}
      <Box
        bg={activeLink ? "green.50" : "gray.50"}
        borderWidth="1px"
        borderColor={activeLink ? "green.200" : "gray.200"}
        borderRadius="xl"
        p="5"
        mb="6"
      >
        <HStack justifyContent="space-between" flexWrap="wrap" gap="4">
          <HStack gap="3">
            <Box
              bg={activeLink ? "green.500" : "blue.500"}
              borderRadius="lg"
              p="2.5"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon color="white" fontSize="lg">
                {activeLink ? <LuLink /> : <LuShare2 />}
              </Icon>
            </Box>
            <VStack gap="0" alignItems="flex-start">
              <Text fontSize="sm" fontWeight="bold" color="gray.900">
                {activeLink ? "Link Testimoni Aktif" : "Bagikan Link Testimoni Publik"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {activeLink
                  ? "Link dapat diakses selama 24 jam sejak diaktifkan"
                  : "Buat link yang dapat diakses publik untuk menambah testimoni (aktif 24 jam)"}
              </Text>
            </VStack>
          </HStack>
          {activeLink ? (
            <Button colorPalette="green" size="sm" onClick={() => { setNow(new Date()); setLinkInfoOpen(true) }}>
              <Icon><LuLink /></Icon>
              Link Aktif
            </Button>
          ) : (
            <DialogRoot open={shareOpen} onOpenChange={(e) => setShareOpen(e.open)} size="sm">
              <DialogTrigger asChild>
                <Button colorPalette="orange" size="sm">
                  <Icon><LuShare2 /></Icon>
                  Share Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aktifkan Link Testimoni Publik</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <VStack gap="3" textAlign="center">
                    <Icon fontSize="3xl" color="orange.400"><LuClock /></Icon>
                    <Text fontSize="sm" color="gray.600">
                      Link akan aktif selama <Text as="span" fontWeight="bold" color="gray.900">24 jam</Text> sejak diaktifkan.
                      Selama aktif, siapa pun yang memiliki link dapat menginput testimoni melalui form publik.
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Anda dapat menonaktifkan link kapan saja sebelum waktu habis.
                    </Text>
                  </VStack>
                </DialogBody>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setShareOpen(false)}>Batal</Button>
                  <Button colorPalette="orange" onClick={handleShareLink}>
                    Aktifkan Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          )}
        </HStack>
      </Box>

      {/* Active link detail modal */}
      <DialogRoot open={linkInfoOpen} onOpenChange={(e) => setLinkInfoOpen(e.open)} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Testimoni Aktif</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap="5">
              <Box
                bg="green.50"
                borderWidth="1px"
                borderColor="green.200"
                borderRadius="xl"
                p="4"
                w="full"
                textAlign="center"
              >
                <HStack gap="2" justifyContent="center" mb="1">
                  <Icon color="green.500"><LuClock /></Icon>
                  <Text fontSize="xs" color="green.600" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                    Sisa Waktu
                  </Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="gray.900" fontFamily="monospace">
                  {getTimeRemaining()}
                </Text>
              </Box>

              <Field label="Link Publik Testimoni">
                <HStack gap="2" w="full">
                  <Input value={shareUrl} readOnly bg="gray.50" fontSize="xs" />
                  <Button size="sm" colorPalette="blue" onClick={handleCopy} flexShrink="0">
                    <Icon><LuCopy /></Icon>
                    {copied ? "Tersalin!" : "Salin"}
                  </Button>
                </HStack>
              </Field>

              <Text fontSize="xs" color="gray.500">
                Diaktifkan pada: {activeLink && new Date(activeLink.activatedAt).toLocaleString("id-ID")}
                <br />
                Berakhir pada: {activeLink && new Date(activeLink.expiresAt).toLocaleString("id-ID")}
              </Text>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkInfoOpen(false)}>Tutup</Button>
            <Button colorPalette="red" onClick={handleDeactivate}>
              <Icon><LuCircleX /></Icon>
              Nonaktifkan Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Testimonials table */}
      <HStack justifyContent="space-between" mb="4">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Daftar Testimoni ({testimonials.length})
        </Text>
        <Button colorPalette="orange" size="sm" onClick={openAdd}>
          <Icon><LuPlus /></Icon>
          Tambah Testimoni
        </Button>
      </HStack>

      {testimonials.length === 0 ? (
        <Box bg="gray.50" borderRadius="xl" p="12" textAlign="center">
          <Text color="gray.500">Belum ada testimoni</Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden">
          <Table.Root>
            <Table.Header bg="gray.50">
              <Table.Row>
                <Table.ColumnHeader>No</Table.ColumnHeader>
                <Table.ColumnHeader>Nama</Table.ColumnHeader>
                <Table.ColumnHeader>Role</Table.ColumnHeader>
                <Table.ColumnHeader>Testimoni</Table.ColumnHeader>
                <Table.ColumnHeader>Media</Table.ColumnHeader>
                <Table.ColumnHeader>Rating</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Aksi</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {testimonials.map((t, i) => (
                <Table.Row key={t.id}>
                  <Table.Cell>{i + 1}</Table.Cell>
                  <Table.Cell fontWeight="semibold" color="gray.800">
                    <HStack gap="2">
                      <Box
                        borderRadius="full"
                        w="7"
                        h="7"
                        flexShrink="0"
                        overflow="hidden"
                      >
                        {t.photoUrl ? (
                          <img src={t.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Box
                            bg="blue.500"
                            borderRadius="full"
                            w="7"
                            h="7"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text fontSize="xs" fontWeight="bold" color="white">{t.avatar}</Text>
                          </Box>
                        )}
                      </Box>
                      {t.name}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell fontSize="xs" color="gray.600">{t.role}</Table.Cell>
                  <Table.Cell fontSize="xs" color="gray.600" maxW="xs">
                    <Text noOfLines={2}>{t.text}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    {t.media && t.media.length > 0 ? (
                      <HStack gap="1">
                        {t.media.slice(0, 3).map((m, mi) => (
                          <Box
                            key={mi}
                            w="8"
                            h="8"
                            borderRadius="md"
                            overflow="hidden"
                            position="relative"
                            flexShrink="0"
                          >
                            {m.type === "video" ? (
                              <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center" bg="purple.50">
                                <Icon color="purple.500" fontSize="xs"><LuVideo /></Icon>
                              </Box>
                            ) : (
                              <img src={m.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </Box>
                        ))}
                        {t.media.length > 3 && (
                          <Text fontSize="xs" color="gray.500" fontWeight="semibold">+{t.media.length - 3}</Text>
                        )}
                      </HStack>
                    ) : (
                      <Text fontSize="xs" color="gray.300">—</Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <HStack gap="0.5">
                      {[...Array(t.rating)].map((_, idx) => (
                        <Icon key={idx} color="orange.400" fontSize="xs" fill="currentColor"><LuStar /></Icon>
                      ))}
                    </HStack>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap="1" justifyContent="flex-end">
                      <Button variant="ghost" size="sm" colorPalette="blue" onClick={() => openEdit(t)}>
                        <Icon><LuPencil /></Icon>
                      </Button>
                      <Button variant="ghost" size="sm" colorPalette="red" onClick={() => handleDelete(t.id)}>
                        <Icon><LuTrash2 /></Icon>
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {/* Add/Edit modal */}
      <DialogRoot open={editOpen} onOpenChange={(e) => setEditOpen(e.open)} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Testimoni" : "Tambah Testimoni"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <Field label="Nama Lengkap">
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </Field>
              <Field label="Role / Posisi">
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Contoh: Alumni — Personel AVSEC Bandara Soekarno-Hatta"
                />
              </Field>
              <Field label="Testimoni">
                <Textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="Tulis testimoni..."
                  rows={4}
                />
              </Field>
              <Field label="Foto Profile (opsional)">
                <ImageUpload
                  value={form.photoUrl}
                  onChange={(dataUrl) => setForm({ ...form, photoUrl: dataUrl })}
                  label="Upload foto"
                  shape="circle"
                  size={100}
                />
              </Field>
              <Field label="Konten Media (Foto / Video)" helperText="Foto dikonversi ke WebP, video ke WebM. Bisa upload lebih dari satu.">
                <MediaUpload
                  items={form.media}
                  onChange={(items) => setForm({ ...form, media: items })}
                  label="Upload foto atau video"
                />
                {form.media.length > 0 && (
                  <Text fontSize="xs" color="gray.500" mt="2">
                    {form.media.filter((m) => m.type === "image").length} foto · {form.media.filter((m) => m.type === "video").length} video
                  </Text>
                )}
              </Field>
              <Field label="Avatar (Inisial, contoh: AH)">
                <Input
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="AH"
                  maxW="20"
                />
                <Text fontSize="xs" color="gray.400">Digunakan jika foto profile tidak diupload</Text>
              </Field>
              <Field label="Rating (1-5)">
                <HStack gap="1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Box
                      key={n}
                      as="button"
                      cursor="pointer"
                      onClick={() => setForm({ ...form, rating: n })}
                      p="1"
                    >
                      <Icon
                        color={n <= form.rating ? "orange.400" : "gray.300"}
                        fontSize="xl"
                        fill={n <= form.rating ? "currentColor" : "none"}
                      >
                        <LuStar />
                      </Icon>
                    </Box>
                  ))}
                </HStack>
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button colorPalette="orange" loading={loading} onClick={handleSave}>
              {editing ? "Perbarui" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  )
}
