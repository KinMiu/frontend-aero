import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
  Input,
  Textarea,
  Badge,
} from "@chakra-ui/react"
import { ImageUpload } from "@/components/ImageUpload"
import * as React from "react"
import {
  LuPlus,
  LuTrash2,
  LuPencil,
  LuFileText,
  LuChevronUp,
  LuChevronDown,
  LuX,
  LuGripVertical,
} from "react-icons/lu"
import {
  getStoredArticles,
  addStoredArticle,
  updateStoredArticle,
  deleteStoredArticle,
  type StoredArticle,
  type ArticleSection,
} from "@/data/articles"
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { toaster } from "@/components/ui/toaster"

export default function ArtikelPage() {
  const [articles, setArticles] = React.useState<StoredArticle[]>([])
  const [editOpen, setEditOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<StoredArticle | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [form, setForm] = React.useState({
    title: "",
    date: "",
    category: "Uncategorized",
    image: "",
    excerpt: "",
  })
  const [sections, setSections] = React.useState<ArticleSection[]>([])

  const refresh = async () => {
    try {
      const list = await getStoredArticles()
      setArticles(list)
    } catch {
      setArticles([])
    }
  }

  React.useEffect(() => {
    refresh()
  }, [])

  const formatDate = () => {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    const d = new Date()
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ title: "", date: formatDate(), category: "Uncategorized", image: "/image.png", excerpt: "" })
    setSections([{ type: "paragraph", text: "" }])
    setEditOpen(true)
  }

  const openEdit = (article: StoredArticle) => {
    setEditing(article)
    setForm({
      title: article.title,
      date: article.date,
      category: article.category,
      image: article.image,
      excerpt: article.excerpt,
    })
    setSections(article.sections.length > 0 ? article.sections : [{ type: "paragraph", text: "" }])
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!form.title) {
      toaster.create({ title: "Judul wajib diisi", type: "error" })
      return
    }
    if (!form.date) {
      toaster.create({ title: "Tanggal wajib diisi", type: "error" })
      return
    }
    const cleanedSections = sections.filter((s) => {
      if (s.type === "list") return s.items && s.items.length > 0
      return s.text && s.text.trim().length > 0
    })

    setLoading(true)
    try {
      if (editing) {
        await updateStoredArticle(editing.id, {
          ...form,
          sections: cleanedSections,
        })
        toaster.create({ title: "Artikel diperbarui", type: "success" })
      } else {
        await addStoredArticle({
          ...form,
          sections: cleanedSections,
        })
        toaster.create({ title: "Artikel ditambahkan", type: "success" })
      }
      setEditOpen(false)
      await refresh()
    } catch {
      toaster.create({ title: "Gagal menyimpan artikel", type: "error" })
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await deleteStoredArticle(id)
    await refresh()
    toaster.create({ title: "Artikel dihapus", type: "info" })
  }

  const updateSection = (idx: number, updates: Partial<ArticleSection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)))
  }

  const addSection = () => {
    setSections((prev) => [...prev, { type: "paragraph", text: "" }])
  }

  const removeSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }

  const moveSection = (idx: number, dir: "up" | "down") => {
    setSections((prev) => {
      const next = [...prev]
      const target = dir === "up" ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const addListItem = (secIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, items: [...(s.items || []), ""] }
          : s
      )
    )
  }

  const updateListItem = (secIdx: number, itemIdx: number, value: string) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, items: (s.items || []).map((item, j) => (j === itemIdx ? value : item)) }
          : s
      )
    )
  }

  const removeListItem = (secIdx: number, itemIdx: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === secIdx
          ? { ...s, items: (s.items || []).filter((_, j) => j !== itemIdx) }
          : s
      )
    )
  }

  return (
    <Container maxW="5xl" py="8">
      <VStack gap="2" alignItems="flex-start" mb="6">
        <Heading fontSize="2xl" fontWeight="bold" color="gray.900">
          Kelola Artikel
        </Heading>
        <Text fontSize="sm" color="gray.500">
          Tambah, edit, dan hapus artikel yang tampil di halaman beranda
        </Text>
      </VStack>

      <HStack justifyContent="space-between" mb="4">
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Daftar Artikel ({articles.length})
        </Text>
        <Button colorPalette="orange" size="sm" onClick={openAdd}>
          <Icon><LuPlus /></Icon>
          Tambah Artikel
        </Button>
      </HStack>

      {articles.length === 0 ? (
        <Box bg="gray.50" borderRadius="xl" p="12" textAlign="center">
          <VStack gap="3">
            <Icon fontSize="3xl" color="gray.300"><LuFileText /></Icon>
            <Text color="gray.500">Belum ada artikel</Text>
          </VStack>
        </Box>
      ) : (
        <VStack gap="3" alignItems="stretch">
          {articles.map((article, i) => (
            <Box
              key={article.id}
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              borderRadius="xl"
              p="5"
              _hover={{ shadow: "md", borderColor: "gray.300" }}
              transition="all 0.2s"
            >
              <HStack gap="4" alignItems="flex-start">
                {article.image && (
                  <Box
                    borderRadius="lg"
                    overflow="hidden"
                    flexShrink="0"
                    w="16"
                    h="16"
                  >
                    <img src={article.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Box>
                )}
                <VStack gap="1" alignItems="flex-start" flex="1">
                  <HStack gap="2">
                    <Badge colorPalette="orange" size="sm">{article.category}</Badge>
                    <Text fontSize="xs" color="gray.500">{article.date}</Text>
                  </HStack>
                  <Text fontWeight="semibold" color="gray.800" fontSize="sm" noOfLines={2}>
                    {article.title}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>{article.excerpt}</Text>
                  <Text fontSize="xs" color="gray.400">{article.sections.length} bagian konten</Text>
                </VStack>
                <HStack gap="1" flexShrink="0">
                  <Button variant="ghost" size="sm" colorPalette="blue" onClick={() => openEdit(article)}>
                    <Icon><LuPencil /></Icon>
                  </Button>
                  <Button variant="ghost" size="sm" colorPalette="red" onClick={() => handleDelete(article.id)}>
                    <Icon><LuTrash2 /></Icon>
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Add/Edit dialog */}
      <DialogRoot open={editOpen} onOpenChange={(e) => setEditOpen(e.open)} size="xl">
        <DialogContent maxW="4xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Artikel" : "Tambah Artikel"}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Stack gap="4">
              <Field label="Judul Artikel">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Judul artikel"
                />
              </Field>

              <Stack gap="4" direction={{ base: "column", md: "row" }}>
                <Field label="Tanggal">
                  <Input
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    placeholder="Contoh: 19 Juni 2025"
                  />
                </Field>
                <Field label="Kategori">
                  <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Uncategorized"
                  />
                </Field>
              </Stack>

              <Field label="Gambar Artikel">
                <ImageUpload
                  value={form.image}
                  onChange={(dataUrl) => setForm({ ...form, image: dataUrl })}
                  label="Klik untuk upload gambar artikel"
                  size={140}
                  maxWidth={400}
                />
              </Field>

              <Field label="Ringkasan (Excerpt)">
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Ringkasan singkat artikel..."
                  rows={2}
                />
              </Field>

              <Separator />

              <HStack justifyContent="space-between">
                <Text fontSize="md" fontWeight="semibold" color="gray.700">
                  Konten Artikel
                </Text>
                <Button size="xs" variant="outline" onClick={addSection}>
                  <Icon><LuPlus /></Icon>
                  Tambah Bagian
                </Button>
              </HStack>

              <VStack gap="3" alignItems="stretch">
                {sections.map((section, idx) => (
                  <Box
                    key={idx}
                    bg="gray.50"
                    borderRadius="lg"
                    p="4"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <HStack gap="2" mb="3">
                      <Icon color="gray.400" fontSize="sm"><LuGripVertical /></Icon>
                      <Text fontSize="xs" fontWeight="bold" color="gray.500">
                        Bagian {idx + 1}
                      </Text>
                      <Box flex="1" />
                      <HStack gap="0.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => moveSection(idx, "up")}
                          disabled={idx === 0}
                        >
                          <Icon><LuChevronUp /></Icon>
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => moveSection(idx, "down")}
                          disabled={idx === sections.length - 1}
                        >
                          <Icon><LuChevronDown /></Icon>
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => removeSection(idx)}
                        >
                          <Icon><LuX /></Icon>
                        </Button>
                      </HStack>
                    </HStack>

                    <HStack gap="2" mb="3">
                      <Text fontSize="xs" color="gray.500" w="60px">Tipe:</Text>
                      <Box as="select"
                        value={section.type}
                        onChange={(e) => {
                          const newType = e.target.value as ArticleSection["type"]
                          if (newType === "list") {
                            updateSection(idx, { type: newType, items: section.items || [""] })
                          } else {
                            updateSection(idx, { type: newType, items: undefined })
                          }
                        }}
                        bg="white"
                        borderWidth="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        px="3"
                        py="1.5"
                        fontSize="sm"
                      >
                        <option value="paragraph">Paragraf</option>
                        <option value="heading">Heading</option>
                        <option value="list">List</option>
                        <option value="quote">Quote</option>
                      </Box>
                    </HStack>

                    {section.type === "list" ? (
                      <VStack gap="2" alignItems="stretch">
                        {(section.items || []).map((item, itemIdx) => (
                          <HStack key={itemIdx} gap="2">
                            <Text fontSize="xs" color="gray.400" w="24px">{itemIdx + 1}.</Text>
                            <Input
                              value={item}
                              onChange={(e) => updateListItem(idx, itemIdx, e.target.value)}
                              placeholder="Item list..."
                              bg="white"
                              size="sm"
                            />
                            <Button
                              size="xs"
                              variant="ghost"
                              colorPalette="red"
                              onClick={() => removeListItem(idx, itemIdx)}
                              flexShrink="0"
                            >
                              <Icon><LuX /></Icon>
                            </Button>
                          </HStack>
                        ))}
                        <Button size="xs" variant="outline" onClick={() => addListItem(idx)} alignSelf="flex-start">
                          <Icon><LuPlus /></Icon>
                          Tambah Item
                        </Button>
                      </VStack>
                    ) : (
                      <Textarea
                        value={section.text || ""}
                        onChange={(e) => updateSection(idx, { text: e.target.value })}
                        placeholder={
                          section.type === "heading" ? "Teks heading..." :
                          section.type === "quote" ? "Teks quote..." :
                          "Tulis paragraf..."
                        }
                        rows={section.type === "heading" ? 1 : 4}
                        bg="white"
                      />
                    )}
                  </Box>
                ))}
              </VStack>
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

function Separator() {
  return <Box h="1px" bg="gray.200" my="2" />
}
