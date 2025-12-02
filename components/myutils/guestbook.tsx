"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db/supabase"
import { useAuth } from "@/hooks/useAuth"
import { GuestbookEntry, GuestbookCategory } from "@/types/guestbook.types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  User,
} from "lucide-react"

const categories: GuestbookCategory[] = ["일반", "문의", "건의", "칭찬"]

export function Guestbook() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isWriting, setIsWriting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // 폼 데이터
  const [category, setCategory] = useState<string>("일반")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(true)

  // 방명록 목록 불러오기
  const fetchEntries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("my_guestbook")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error("방명록 불러오기 실패:", error)
      alert("방명록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  // 새 글 작성 / 수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }

    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.")
      return
    }

    try {
      if (editingId) {
        // 수정
        const { error } = await supabase
          .from("my_guestbook")
          .update({
            category,
            title: title.trim(),
            content: content.trim(),
            is_public: isPublic,
          })
          .eq("id", editingId)

        if (error) throw error
        alert("게시글이 수정되었습니다.")
      } else {
        // 새 글 작성
        const { error } = await supabase.from("my_guestbook").insert({
          user_id: user.id,
          category,
          title: title.trim(),
          content: content.trim(),
          is_public: isPublic,
        })

        if (error) throw error
        alert("게시글이 작성되었습니다.")
      }

      // 폼 초기화
      resetForm()
      fetchEntries()
    } catch (error: any) {
      console.error("게시글 작성/수정 실패:", error)
      alert(`오류: ${error.message}`)
    }
  }

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const { error } = await supabase.from("my_guestbook").delete().eq("id", id)

      if (error) throw error
      alert("게시글이 삭제되었습니다.")
      fetchEntries()
    } catch (error: any) {
      console.error("게시글 삭제 실패:", error)
      alert(`삭제 실패: ${error.message}`)
    }
  }

  // 수정 모드로 전환
  const handleEdit = (entry: GuestbookEntry) => {
    setEditingId(entry.id)
    setCategory(entry.category || "일반")
    setTitle(entry.title)
    setContent(entry.content)
    setIsPublic(entry.is_public)
    setIsWriting(true)
  }

  // 폼 초기화
  const resetForm = () => {
    setEditingId(null)
    setCategory("일반")
    setTitle("")
    setContent("")
    setIsPublic(true)
    setIsWriting(false)
  }

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">방명록</h2>
          <p className="text-sm text-gray-500 mt-1">
            총 {entries.length}개의 게시글
          </p>
        </div>
        <Button
          onClick={() => setIsWriting(!isWriting)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isWriting ? "취소" : "글쓰기"}
        </Button>
      </div>

      {/* 글쓰기 폼 */}
      {isWriting && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "게시글 수정" : "새 게시글 작성"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-medium mb-2">카테고리</label>
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      category === cat
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium mb-2">제목</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={200}
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium mb-2">내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={8}
                maxLength={5000}
                required
              />
            </div>

            {/* 공개 여부 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="isPublic" className="text-sm">
                {isPublic ? (
                  <span className="flex items-center gap-1">
                    <Unlock className="h-4 w-4" /> 공개
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="h-4 w-4" /> 비공개
                  </span>
                )}
              </label>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={resetForm}>
                취소
              </Button>
              <Button type="submit">
                {editingId ? "수정하기" : "작성하기"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            아직 작성된 게시글이 없습니다.
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 카테고리 */}
                  {entry.category && (
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full mb-2">
                      {entry.category}
                    </span>
                  )}

                  {/* 제목 */}
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    {entry.title}
                    {!entry.is_public && (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                  </h3>

                  {/* 내용 */}
                  <p className="text-gray-700 whitespace-pre-wrap mb-4">
                    {entry.content}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(entry.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {entry.view_count}
                    </span>
                  </div>
                </div>

                {/* 작성자 본인인 경우 수정/삭제 버튼 */}
                {user?.id === entry.user_id && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
