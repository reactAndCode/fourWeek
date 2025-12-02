export interface GuestbookEntry {
  id: string
  user_id: string
  category: string | null
  title: string
  content: string
  att_file01_url: string | null
  att_file01_filename: string | null
  att_file02_url: string | null
  att_file02_filename: string | null
  is_public: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface GuestbookFormData {
  category?: string
  title: string
  content: string
  att_file01?: File
  att_file02?: File
  is_public: boolean
}

export type GuestbookCategory = "일반" | "문의" | "건의" | "칭찬"
