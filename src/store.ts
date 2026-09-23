import { api, setToken } from "@/api/client";
export { setToken } from "@/api/client";

export interface OfficialAdmin {
  id: string
  name: string
  email: string
  phone: string
  password: string
  createdAt: string
}

export type KelasOption =
  | "INITIAL/BARU BASIC AVSEC"
  | "RECCURENT/PERPANJANGAN BASIC AVSEC"
  | "INITIAL/BARU JUNIOR AVSEC"
  | "RECCURENT/PERPANJANGAN JUNIOR AVSEC"
  | "INITIAL/BARU SENIOR AVSEC"
  | "RECCURENT/PERPANJANGAN SENIOR AVSEC"
  | "INSTRUKTUR KEAMANAN PENERBANGAN"
  | "INSPECTOR KEAMANAN INTERNAL"

export const KELAS_OPTIONS: KelasOption[] = [
  "INITIAL/BARU BASIC AVSEC",
  "RECCURENT/PERPANJANGAN BASIC AVSEC",
  "INITIAL/BARU JUNIOR AVSEC",
  "RECCURENT/PERPANJANGAN JUNIOR AVSEC",
  "INITIAL/BARU SENIOR AVSEC",
  "RECCURENT/PERPANJANGAN SENIOR AVSEC",
  "INSTRUKTUR KEAMANAN PENERBANGAN",
  "INSPECTOR KEAMANAN INTERNAL",
]

export interface Student {
  id: string
  pilihanKelas: KelasOption
  nama: string
  noKtp: string
  tempatLahir: string
  tanggalLahir: string
  alamat: string
  kodePos: string
  email: string
  noHp: string
  tinggiBadan: string
  beratBadan: string
  namaSD: string
  tahunLulusSD: string
  namaSMP: string
  tahunLulusSMP: string
  namaSMA: string
  tahunLulusSMA: string
  perguruanTinggiDiploma: string
  tahunLulusDiploma: string
  perguruanTinggiS1: string
  namaAyah: string
  tempatTanggalLahirAyah: string
  namaIbu: string
  tempatTanggalLahirIbu: string
  registeredAt: string
}

// ---- Auth ----

export interface AuthUser {
  role: "superadmin" | "officialadmin"
  name: string
  email?: string
}

export async function login(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
  try {
    const data = await api.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
    return data;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem("aeroschool_user");
  if (!raw) return null;
  return JSON.parse(raw) as AuthUser;
}

export function setCurrentUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem("aeroschool_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("aeroschool_user");
    setToken(null);
  }
}

// ---- Officials ----

export async function getOfficials(): Promise<OfficialAdmin[]> {
  return api.get<OfficialAdmin[]>("/officials");
}

export async function createOfficial(data: Omit<OfficialAdmin, "id" | "createdAt">): Promise<OfficialAdmin> {
  return api.post<OfficialAdmin>("/officials", data);
}

export async function updateOfficial(id: string, data: Partial<OfficialAdmin>): Promise<OfficialAdmin> {
  return api.put<OfficialAdmin>(`/officials/${id}`, data);
}

export async function deleteOfficial(id: string): Promise<void> {
  await api.delete(`/officials/${id}`);
}

// ---- Students ----

export async function getStudents(): Promise<Student[]> {
  return api.get<Student[]>("/students");
}

export async function getStudent(id: string): Promise<Student> {
  return api.get<Student>(`/students/${id}`);
}

export async function addStudent(student: Omit<Student, "id" | "registeredAt">): Promise<Student> {
  return api.post<Student>("/students", student);
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  return api.put<Student>(`/students/${id}`, data);
}

export async function deleteStudent(id: string): Promise<void> {
  await api.delete(`/students/${id}`);
}

// ---- Open Registration ----

export interface OpenRegistration {
  id: string
  month: string
  year: number
  createdAt: string
}

export async function getOpenRegistrations(): Promise<OpenRegistration[]> {
  return api.get<OpenRegistration[]>("/open-registrations");
}

export async function getActiveRegistration(): Promise<OpenRegistration | null> {
  return api.get<OpenRegistration | null>("/open-registrations/active");
}

export async function addOpenRegistration(month: string, year: number): Promise<OpenRegistration> {
  return api.post<OpenRegistration>("/open-registrations", { month, year });
}

export async function deleteOpenRegistration(id: string): Promise<void> {
  await api.delete(`/open-registrations/${id}`);
}

// ---- Testimonials ----

export interface Testimonial {
  id: string
  name: string
  role: string
  text: string
  avatar: string
  photoUrl?: string
  rating: number
  createdAt: string
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return api.get<Testimonial[]>("/testimonials");
}

export async function addTestimonial(t: Omit<Testimonial, "id" | "createdAt">): Promise<Testimonial> {
  return api.post<Testimonial>("/testimonials", t);
}

export async function addPublicTestimonial(token: string, t: Omit<Testimonial, "id" | "createdAt">): Promise<Testimonial> {
  return api.post<Testimonial>(`/testimonials/public/${token}`, t);
}

export async function updateTestimonial(id: string, updates: Partial<Omit<Testimonial, "id" | "createdAt">>): Promise<Testimonial> {
  return api.put<Testimonial>(`/testimonials/${id}`, updates);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await api.delete(`/testimonials/${id}`);
}

// ---- Testimonial Share Links ----

export interface TestimonialLink {
  id: string
  token: string
  activatedAt: string
  expiresAt: string
  isActive: boolean
}

export async function getTestimonialLinks(): Promise<TestimonialLink[]> {
  return api.get<TestimonialLink[]>("/testimonial-links");
}

export async function getActiveTestimonialLink(): Promise<TestimonialLink | null> {
  return api.get<TestimonialLink | null>("/testimonial-links/active");
}

export async function createTestimonialLink(): Promise<TestimonialLink> {
  return api.post<TestimonialLink>("/testimonial-links");
}

export async function deactivateTestimonialLink(id: string): Promise<void> {
  await api.put(`/testimonial-links/${id}/deactivate`);
}

export async function getTestimonialLinkByToken(token: string): Promise<{ link: TestimonialLink; valid: boolean } | null> {
  try {
    return await api.get<{ link: TestimonialLink; valid: boolean }>(`/testimonial-links/token/${token}`);
  } catch {
    return null;
  }
}

export function isTestimonialLinkValid(link: TestimonialLink): boolean {
  return link.isActive && new Date(link.expiresAt) > new Date();
}

// ---- Document Share Links ----

export interface DocumentLink {
  id: string
  token: string
  studentId: string
  studentName: string
  activatedAt: string
  expiresAt: string
  isActive: boolean
}

export async function getDocumentLinks(): Promise<DocumentLink[]> {
  return api.get<DocumentLink[]>("/document-links");
}

export async function getDocumentLinkByStudentId(studentId: string): Promise<DocumentLink | null> {
  return api.get<DocumentLink | null>(`/document-links/student/${studentId}`);
}

export async function createDocumentLink(studentId: string, studentName: string): Promise<DocumentLink> {
  return api.post<DocumentLink>("/document-links", { studentId });
}

export async function deactivateDocumentLink(id: string): Promise<void> {
  await api.put(`/document-links/${id}/deactivate`);
}

export async function getDocumentLinkByToken(token: string): Promise<{ link: DocumentLink; valid: boolean } | null> {
  try {
    return await api.get<{ link: DocumentLink; valid: boolean }>(`/document-links/token/${token}`);
  } catch {
    return null;
  }
}

export function isDocumentLinkValid(link: DocumentLink): boolean {
  return link.isActive && new Date(link.expiresAt) > new Date();
}

// ---- Uploaded Documents ----

export interface UploadedDocument {
  id: string
  studentId: string
  fileName: string
  fileType: string
  filePath: string
  uploadedAt: string
}

export async function getUploadedDocuments(): Promise<UploadedDocument[]> {
  return api.get<UploadedDocument[]>("/documents");
}

export async function getDocumentsByStudentId(studentId: string): Promise<UploadedDocument[]> {
  return api.get<UploadedDocument[]>(`/documents?studentId=${studentId}`);
}

export async function addUploadedDocument(file: File, studentId: string): Promise<UploadedDocument> {
  return api.upload("/documents", file, { studentId });
}

export async function getPublicDocumentData(token: string): Promise<{ student: Student; docs: UploadedDocument[] } | null> {
  try {
    return await api.get<{ student: Student; docs: UploadedDocument[] }>(`/documents/public/${token}`);
  } catch {
    return null;
  }
}

export async function uploadPublicDocument(token: string, file: File): Promise<UploadedDocument> {
  return api.upload(`/documents/public/${token}`, file);
}

export async function deletePublicDocument(token: string, docId: string): Promise<void> {
  await api.delete(`/documents/public/${token}/${docId}`);
}

export async function deleteUploadedDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

export type { KelasOption }
