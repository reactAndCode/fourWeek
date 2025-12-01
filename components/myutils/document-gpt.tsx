"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, Send, Trash2, FileUp } from "lucide-react"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface DocumentSummary {
  summary: string
  keyPoints: string[]
  wordCount: number
}

type ModelMode = "chat" | "vector" | "supa_vectorDB"

export function DocumentGPT() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [documentText, setDocumentText] = useState<string>("")
  const [summary, setSummary] = useState<DocumentSummary | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [modelMode, setModelMode] = useState<ModelMode>("chat")
  const [documentId, setDocumentId] = useState<string>("")
  const [manualDocId, setManualDocId] = useState<string>("")
  const [useExistingDoc, setUseExistingDoc] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지 목록이 업데이트될 때마다 스크롤을 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // 파일 타입 검증
      const allowedTypes = ["text/plain", "application/pdf"]
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("TXT 또는 PDF 파일만 업로드 가능합니다.")
        return
      }

      // 파일 크기 제한 (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("파일 크기는 10MB 이하여야 합니다.")
        return
      }

      setFile(selectedFile)
    }
  }

  // 파일 업로드 및 처리
  const handleUpload = async () => {
    if (!file) {
      alert("파일을 먼저 선택해주세요.")
      return
    }

    setIsUploading(true)
    setIsProcessing(true)

    try {
      // FormData로 파일 전송
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/document-gpt/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "파일 업로드에 실패했습니다.")
      }

      const data = await response.json()
      console.log("Upload response:", data)
      setDocumentText(data.text)

      // Vector 모드인 경우 임베딩 생성 (vector 또는 supa_vectorDB)
      if (modelMode === "vector" || modelMode === "supa_vectorDB") {
        const embedResponse = await fetch("/api/document-gpt/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.text }),
        })

        if (!embedResponse.ok) {
          const errorData = await embedResponse.json()
          throw new Error(errorData.error || "임베딩 생성에 실패했습니다.")
        }

        const embedData = await embedResponse.json()
        setDocumentId(embedData.documentId)
        console.log("✅ 임베딩 생성 완료:", embedData)
        console.log("📋 Document ID (재사용 가능):", embedData.documentId)

        // 사용자에게 Document ID 알림
        alert(`✅ 임베딩 생성 완료!\n\n📋 Document ID: ${embedData.documentId}\n\n이 ID를 저장하면 다음에 재사용할 수 있습니다.`)
      }

      // 문서 요약 요청
      const summaryResponse = await fetch("/api/document-gpt/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text }),
      })

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json()
        console.error("Summarize error:", errorData)
        // 요약 실패해도 채팅은 가능하도록 처리
        alert(`문서 요약에 실패했습니다: ${errorData.error || '알 수 없는 오류'}. 채팅 기능은 계속 사용 가능합니다.`)
        setMessages([
          {
            role: "system",
            content: `문서가 업로드되었습니다. (${data.wordCount}자)\n요약 기능은 실패했지만 질문하기 기능은 사용 가능합니다.`,
            timestamp: new Date(),
          },
        ])
      } else {
        const summaryData = await summaryResponse.json()
        console.log("Summary response:", summaryData)
        setSummary(summaryData)

        // 시스템 메시지 추가
        setMessages([
          {
            role: "system",
            content: `문서가 성공적으로 업로드되었습니다. (${data.wordCount}자)\n\n${summaryData.summary}`,
            timestamp: new Date(),
          },
        ])
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      alert(error.message || "파일 처리 중 오류가 발생했습니다.")
    } finally {
      setIsUploading(false)
      setIsProcessing(false)
    }
  }

  // 채팅 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      alert("메시지를 입력해주세요.")
      return
    }

    if (!documentText) {
      alert("먼저 문서를 업로드해주세요.")
      return
    }

    if ((modelMode === "vector" || modelMode === "supa_vectorDB") && !documentId) {
      alert("벡터 임베딩이 준비되지 않았습니다.")
      return
    }

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsSending(true)

    try {
      let response

      if (modelMode === "vector" || modelMode === "supa_vectorDB") {
        // Vector 모드 또는 Supabase Vector 모드: 임베딩 기반 검색
        response = await fetch("/api/document-gpt/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            question: inputMessage,
            chatHistory: messages.filter((m) => m.role !== "system"),
          }),
        })
      } else {
        // Chat 모드: 기존 방식
        response = await fetch("/api/document-gpt/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentText,
            question: inputMessage,
            chatHistory: messages.filter((m) => m.role !== "system"),
          }),
        })
      }

      if (!response.ok) {
        throw new Error("답변을 받는데 실패했습니다.")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      alert(error.message || "채팅 중 오류가 발생했습니다.")
    } finally {
      setIsSending(false)
    }
  }

  // 기존 Document ID로 채팅 시작
  const handleUseExistingDoc = () => {
    if (!manualDocId.trim()) {
      alert("Document ID를 입력해주세요.")
      return
    }

    setDocumentId(manualDocId)
    setDocumentText("existing_document") // 더미 값으로 채팅 UI 활성화
    setUseExistingDoc(true)
    setMessages([
      {
        role: "system",
        content: `기존 문서 (ID: ${manualDocId})를 불러왔습니다.\n질문을 입력하세요.`,
        timestamp: new Date(),
      },
    ])
  }

  // 초기화
  const handleReset = () => {
    if (confirm("모든 데이터를 초기화하시겠습니까?")) {
      setFile(null)
      setDocumentText("")
      setSummary(null)
      setMessages([])
      setInputMessage("")
      setDocumentId("")
      setManualDocId("")
      setUseExistingDoc(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Document GPT</h2>
          <p className="text-sm text-gray-500 mt-1">
            문서를 업로드하고 AI와 대화하세요 (TXT, PDF 지원)
          </p>
        </div>
        {documentText && (
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            초기화
          </Button>
        )}
      </div>

      {/* 모델 선택 */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="font-semibold text-gray-700">모델 방식:</label>
        <div className="flex gap-2">
          <button
            onClick={() => setModelMode("chat")}
            disabled={!!documentText}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              modelMode === "chat"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            } ${documentText ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Chat (기본)
          </button>
          <button
            onClick={() => setModelMode("vector")}
            disabled={!!documentText}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              modelMode === "vector"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            } ${documentText ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            벡터 임베딩 (메모리)
          </button>
          <button
            onClick={() => setModelMode("supa_vectorDB")}
            disabled={!!documentText}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              modelMode === "supa_vectorDB"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            } ${documentText ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            Supabase Vector
          </button>
        </div>
        <span className="text-sm text-gray-500">
          {modelMode === "chat"
            ? "전체 문서를 컨텍스트로 사용"
            : modelMode === "vector"
            ? "임베딩 벡터 기반 유사도 검색 (메모리)"
            : "Supabase pgvector 기반 유사도 검색"}
        </span>
      </div>

      {/* 기존 문서 불러오기 (벡터 모드일 때만 표시) */}
      {!documentText && (modelMode === "vector" || modelMode === "supa_vectorDB") && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-green-900 mb-2">
                💾 이미 임베딩된 문서가 있나요?
              </label>
              <input
                type="text"
                value={manualDocId}
                onChange={(e) => setManualDocId(e.target.value)}
                placeholder="Document ID 입력 (예: doc_1234567890_abc123)"
                className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-green-600 mt-1">
                임베딩 생성 시 콘솔에 출력된 Document ID를 입력하면 재사용할 수 있습니다
              </p>
            </div>
            <Button
              onClick={handleUseExistingDoc}
              disabled={!manualDocId.trim()}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              불러오기
            </Button>
          </div>
        </div>
      )}

      {/* 파일 업로드 영역 */}
      {!documentText && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full">
              <FileUp className="h-8 w-8 text-blue-600" />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-1">
                새 문서 업로드
              </h3>
              <p className="text-sm text-gray-500">
                TXT 파일을 선택하세요 (PDF는 메타데이터만 읽기 가능, 최대 10MB)
              </p>
            </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,application/pdf,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              파일 선택
            </Button>

            {file && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <FileText className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">{file.name}</span>
              </div>
            )}
          </div>

          {file && !documentText && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  업로드 및 분석
                </>
              )}
            </Button>
          )}
          </div>
        </div>
      )}

      {/* 문서 요약 결과 */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            문서 요약
          </h3>
          <p className="text-gray-700 mb-4 leading-relaxed">{summary.summary}</p>

          {summary.keyPoints && summary.keyPoints.length > 0 && (
            <>
              <h4 className="font-semibold text-blue-800 mb-2">주요 내용</h4>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5">•</span>
                    <span className="text-gray-700 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-blue-200">
            <span className="text-xs text-blue-600">
              총 {summary.wordCount.toLocaleString()}자
            </span>
          </div>
        </div>
      )}

      {/* Document ID 표시 (벡터 모드일 때) */}
      {documentText && documentId && (modelMode === "vector" || modelMode === "supa_vectorDB") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-900">📋 Document ID</span>
              <p className="text-sm text-blue-700 font-mono mt-1">{documentId}</p>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(documentId)
                alert("Document ID가 클립보드에 복사되었습니다!")
              }}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              복사
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            💡 이 ID를 저장하면 다음에 임베딩 없이 바로 채팅할 수 있습니다
          </p>
        </div>
      )}

      {/* 채팅 인터페이스 */}
      {documentText && (
        <div className="space-y-4">
          {/* 메시지 입력 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isSending && handleSendMessage()}
              placeholder="문서에 대해 질문하세요..."
              disabled={isSending}
              className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !inputMessage.trim()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 px-6"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              전송
            </Button>
          </div>

          {/* 메시지 기록 */}
          <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                메시지가 없습니다. 문서에 대해 질문해보세요!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : message.role === "assistant"
                          ? "bg-white border border-gray-200 text-gray-800"
                          : "bg-green-50 border border-green-200 text-green-900"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-blue-200"
                            : message.role === "assistant"
                            ? "text-gray-400"
                            : "text-green-600"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      {!documentText && (
        <div className="text-center text-gray-400 text-sm py-8">
          문서를 업로드하면 AI가 자동으로 요약하고, 질문에 답변합니다.
        </div>
      )}
    </div>
  )
}
