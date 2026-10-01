import {
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Field } from "@/components/ui/field"
import * as React from "react"
import {
  LuPlus,
  LuTrash2,
  LuImage,
  LuClock,
  LuX,
  LuPencil,
} from "react-icons/lu"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/ImageUpload"
import { toaster } from "@/components/ui/toaster"
import {
  addPoster,
  deletePoster,
  updatePoster,
  getAllPosters,
  getRemainingTime,
  type AdPoster,
} from "@/store"

function toLocalDateTimeInput(date: Date): string {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function PosterIklanPage() {
  const [posters, setPosters] = React.useState<AdPoster[]>([])
  const [addOpen, setAddOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [images, setImages] = React.useState<string[]>([])
  const [title, setTitle] = React.useState("")
  const now = React.useMemo(() => new Date(), [])
  const defaultEnd = React.useMemo(() => {
    const d = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return toLocalDateTimeInput(d)
  }, [now])
  const [startsAt, setStartsAt] = React.useState(toLocalDateTimeInput(now))
  const [endsAt, setEndsAt] = React.useState(defaultEnd)
  const [loading, setLoading] = React.useState(false)

  const refresh = async () => {
    try {
      setPosters(await getAllPosters())
    } catch {
      setPosters([])
    }
  }

  React.useEffect(() => {
    refresh()
    const interval = setInterval(() => refresh(), 60000)
    return () => clearInterval(interval)
  }, [])

  const resetForm = () => {
    setImages([])
    setTitle("")
    setStartsAt(toLocalDateTimeInput(new Date()))
    setEndsAt(toLocalDateTimeInput(new Date(Date.now() + 24 * 60 * 60 * 1000)))
    setEditingId(null)
  }

  const handleAddImage = (dataUrl: string) => {
    setImages((prev) => [...prev, dataUrl])
  }

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const openEdit = (poster: AdPoster) => {
    setEditingId(poster.id)
    setImages([...poster.images])
    setTitle(poster.title)
    setStartsAt(toLocalDateTimeInput(new Date(poster.startsAt)))
    setEndsAt(toLocalDateTimeInput(new Date(poster.endsAt)))
    setEditOpen(true)
  }

  const validate = (): { ok: boolean; start?: Date; end?: Date } => {
    if (images.length === 0) {
      toaster.create({ title: "Minimal 1 gambar poster wajib diupload", type: "error" })
      return { ok: false }
    }
    if (!title.trim()) {
      toaster.create({ title: "Judul poster wajib diisi", type: "error" })
      return { ok: false }
    }
    const start = new Date(startsAt)
    const end = new Date(endsAt)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      toaster.create({ title: "Tanggal mulai/akhir tidak valid", type: "error" })
      return { ok: false }
    }
    if (end.getTime() <= start.getTime()) {
      toaster.create({ title: "Tanggal akhir harus setelah tanggal mulai", type: "error" })
      return { ok: false }
    }
    return { ok: true, start, end }
  }

  const handleAdd = async () => {
    const v = validate()
    if (!v.ok || !v.start || !v.end) return
    setLoading(true)
    try {
      await addPoster(images, title.trim(), v.start.toISOString(), v.end.toISOString())
      resetForm()
      setAddOpen(false)
      await refresh()
      toaster.create({
        title: "Poster iklan ditambahkan",
        description: `${images.length} gambar · ${formatDate(v.start.toISOString())} - ${formatDate(v.end.toISOString())}`,
        type: "success",
      })
    } catch (err) {
      toaster.create({ title: "Gagal menambah poster", description: err instanceof Error ? err.message : undefined, type: "error" })
    }
    setLoading(false)
  }

  const handleEdit = async () => {
    if (!editingId) return
    const v = validate()
    if (!v.ok || !v.start || !v.end) return
    setLoading(true)
    try {
      await updatePoster(editingId, {
        images,
        title: title.trim(),
        startsAt: v.start.toISOString(),
        endsAt: v.end.toISOString(),
      })
      resetForm()
      setEditOpen(false)
      await refresh()
      toaster.create({ title: "Poster berhasil diperbarui", type: "success" })
    } catch (err) {
      toaster.create({ title: "Gagal memperbarui poster", description: err instanceof Error ? err.message : undefined, type: "error" })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePoster(id)
      setDeleteId(null)
      await refresh()
      toaster.create({ title: "Poster dihapus", type: "info" })
    } catch (err) {
      toaster.create({ title: "Gagal menghapus poster", description: err instanceof Error ? err.message : undefined, type: "error" })
    }
  }

  const isExpired = (p: AdPoster) => new Date(p.endsAt).getTime() <= Date.now()
  const isUpcoming = (p: AdPoster) => new Date(p.startsAt).getTime() > Date.now()

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Kelola Poster Iklan
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Upload poster iklan dengan rentang tanggal mulai dan akhir. Poster aktif dan terjadwal dapat diedit. Poster akan tampil di halaman beranda dan otomatis terhapus saat tanggal akhir berlalu.
        </Text>
      </VStack>

      <HStack justifyContent="space-between" mb="4">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Daftar Poster ({posters.length})
        </Text>
        <Button colorPalette="orange" size="sm" onClick={() => { resetForm(); setAddOpen(true) }}>
          <Icon><LuPlus /></Icon>
          Tambah Poster
        </Button>
      </HStack>

      {posters.length === 0 ? (
        <Box bg="gray.50" borderRadius="xl" p="12" textAlign="center">
          <VStack gap="3">
            <Icon fontSize="3xl" color="gray.300"><LuImage /></Icon>
            <Text color="gray.500">Belum ada poster iklan</Text>
          </VStack>
        </Box>
      ) : (
        <VStack gap="3" alignItems="stretch">
          {posters.map((p) => {
            const expired = isExpired(p)
            const upcoming = isUpcoming(p)
            const canEdit = !expired
            return (
              <Box
                key={p.id}
                bg="white"
                borderWidth="1px"
                borderColor="gray.200"
                borderRadius="xl"
                p="5"
                _hover={{ shadow: "md", borderColor: "gray.300" }}
                transition="all 0.2s"
                opacity={expired ? 0.5 : 1}
              >
                <HStack gap="4" alignItems="flex-start">
                  <HStack gap="2" flexShrink="0">
                    {p.images.slice(0, 3).map((img, i) => (
                      <Box
                        key={i}
                        borderRadius="lg"
                        overflow="hidden"
                        w="20"
                        h="20"
                        position="relative"
                      >
                        <img src={img} alt={`${p.title} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {i === 2 && p.images.length > 3 && (
                          <Box
                            position="absolute"
                            inset="0"
                            bg="blackAlpha.700"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text color="white" fontSize="sm" fontWeight="bold">+{p.images.length - 3}</Text>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </HStack>
                  <VStack gap="1" alignItems="flex-start" flex="1">
                    <HStack gap="2">
                      <Text fontWeight="semibold" color="gray.800" fontSize="sm">{p.title}</Text>
                      {expired ? (
                        <Badge colorPalette="red" size="sm">Berakhir</Badge>
                      ) : upcoming ? (
                        <Badge colorPalette="blue" size="sm">Terjadwal</Badge>
                      ) : (
                        <Badge colorPalette="green" size="sm">Aktif</Badge>
                      )}
                    </HStack>
                    <HStack gap="2">
                      <Icon color="gray.400" fontSize="sm"><LuClock /></Icon>
                      <Text fontSize="xs" color="gray.500">{getRemainingTime(p)}</Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.400">
                      Mulai: {formatDate(p.startsAt)} · Berakhir: {formatDate(p.endsAt)}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {p.images.length} gambar
                    </Text>
                  </VStack>
                  <HStack gap="1">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        colorPalette="blue"
                        onClick={() => openEdit(p)}
                      >
                        <Icon><LuPencil /></Icon>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Icon><LuTrash2 /></Icon>
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )
          })}
        </VStack>
      )}

      {/* Add Modal */}
      <DialogRoot open={addOpen} onOpenChange={(e) => { setAddOpen(e.open); if (!e.open) resetForm() }} size="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Poster Iklan</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <Field label="Gambar Poster (bisa lebih dari 1)" required>
                <VStack gap="3" alignItems="flex-start" w="full">
                  {images.length > 0 && (
                    <HStack gap="3" flexWrap="wrap" w="full">
                      {images.map((img, i) => (
                        <Box key={i} position="relative" w="24" h="24" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="gray.200">
                          <Image src={img} alt={`Poster ${i + 1}`} w="full" h="full" objectFit="cover" />
                          <Box
                            position="absolute"
                            top="1"
                            right="1"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            w="5"
                            h="5"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            _hover={{ bg: "red.600" }}
                            onClick={() => handleRemoveImage(i)}
                          >
                            <Icon fontSize="xs"><LuX /></Icon>
                          </Box>
                        </Box>
                      ))}
                    </HStack>
                  )}
                  <ImageUpload
                    value=""
                    onChange={handleAddImage}
                    label="Klik untuk upload gambar"
                    size={120}
                    maxWidth={320}
                  />
                  <Text fontSize="xs" color="gray.400">
                    {images.length} gambar terunggah. Upload lagi untuk menambah.
                  </Text>
                </VStack>
              </Field>
              <Field label="Judul Poster" required>
                <Input
                  placeholder="Contoh: Promo Pendaftaran Awal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <HStack gap="4" w="full">
                <Field label="Tanggal Mulai" required flex="1">
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </Field>
                <Field label="Tanggal Akhir" required flex="1">
                  <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </Field>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                Poster akan tampil otomatis saat tanggal mulai tercapai dan disembunyikan setelah tanggal akhir.
              </Text>
            </Stack>
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
            <DialogTitle>Edit Poster Iklan</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <Field label="Gambar Poster (bisa lebih dari 1)" required>
                <VStack gap="3" alignItems="flex-start" w="full">
                  {images.length > 0 && (
                    <HStack gap="3" flexWrap="wrap" w="full">
                      {images.map((img, i) => (
                        <Box key={i} position="relative" w="24" h="24" borderRadius="lg" overflow="hidden" borderWidth="1px" borderColor="gray.200">
                          <Image src={img} alt={`Poster ${i + 1}`} w="full" h="full" objectFit="cover" />
                          <Box
                            position="absolute"
                            top="1"
                            right="1"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            w="5"
                            h="5"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            cursor="pointer"
                            _hover={{ bg: "red.600" }}
                            onClick={() => handleRemoveImage(i)}
                          >
                            <Icon fontSize="xs"><LuX /></Icon>
                          </Box>
                        </Box>
                      ))}
                    </HStack>
                  )}
                  <ImageUpload
                    value=""
                    onChange={handleAddImage}
                    label="Klik untuk tambah gambar"
                    size={120}
                    maxWidth={320}
                  />
                  <Text fontSize="xs" color="gray.400">
                    {images.length} gambar. Klik tanda X untuk menghapus gambar.
                  </Text>
                </VStack>
              </Field>
              <Field label="Judul Poster" required>
                <Input
                  placeholder="Contoh: Promo Pendaftaran Awal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Field>
              <HStack gap="4" w="full">
                <Field label="Tanggal Mulai" required flex="1">
                  <Input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </Field>
                <Field label="Tanggal Akhir" required flex="1">
                  <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </Field>
              </HStack>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack gap="3" w="full">
              <Button variant="outline" flex="1" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button colorPalette="orange" flex="1" loading={loading} onClick={handleEdit}>Simpan Perubahan</Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirm */}
      <DialogRoot open={!!deleteId} onOpenChange={(e) => !e.open && setDeleteId(null)} size="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Poster Iklan</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text color="gray.500" fontSize="sm">Apakah Anda yakin ingin menghapus poster ini? Tindakan ini tidak dapat dibatalkan.</Text>
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
