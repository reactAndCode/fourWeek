"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { translateKoreanToEnglish, translateEnglishToKorean } from "@/lib/api/translator"
import { generateImage, type ReplicateResponse } from "@/lib/api/image-generator"

type ImageStyle = "schnell" | "cartoon" | "midjourney" | "sketch" | "bytedance"

const stylePrompts: Record<ImageStyle, string> = {
  schnell: "", // 기본 스타일 (프롬프트 추가 없음)
  cartoon: ", cartoon style, animated, colorful, cel-shaded",
  midjourney: ", cinematic, highly detailed, professional photography, 8k, masterpiece",
  sketch: ", pencil sketch, hand-drawn, black and white, artistic sketch",
  bytedance: "", // ByteDance SDXL Lightning (별도 모델 사용)
}

const styleLabels: Record<ImageStyle, string> = {
  schnell: "Flux Schnell (기본)",
  cartoon: "만화 스타일",
  midjourney: "미드저니 스타일",
  sketch: "스케치 스타일",
  bytedance: "바이트댄스 (SDXL)",
}

export function Translator() {
  const [koreanText, setKoreanText] = useState("")
  const [englishText, setEnglishText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageResult, setImageResult] = useState<ReplicateResponse | null>(null)
  const [imageStyle, setImageStyle] = useState<ImageStyle>("schnell")

  const handleKoreanToEnglish = async () => {
    if (!koreanText.trim()) {
      alert("번역할 한글 텍스트를 입력해주세요.")
      return
    }

    setIsTranslating(true)
    try {
      const translated = await translateKoreanToEnglish(koreanText)
      setEnglishText(translated)
    } catch (error: any) {
      alert(error.message || "번역에 실패했습니다.")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleEnglishToKorean = async () => {
    if (!englishText.trim()) {
      alert("번역할 영문 텍스트를 입력해주세요.")
      return
    }

    setIsTranslating(true)
    try {
      const translated = await translateEnglishToKorean(englishText)
      setKoreanText(translated)
    } catch (error: any) {
      alert(error.message || "번역에 실패했습니다.")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleImageGenerate = async () => {
    if (!englishText.trim()) {
      alert("이미지 생성을 위한 영문 텍스트를 입력해주세요.")
      return
    }

    setIsGenerating(true)
    setImageResult(null)
    try {
      // 선택된 스타일을 프롬프트에 추가
      const styledPrompt = englishText + stylePrompts[imageStyle]
      // 바이트댄스 모델 선택 여부 전달
      const model = imageStyle === "bytedance" ? "bytedance" : "flux-schnell"
      const result = await generateImage(styledPrompt, model)
      setImageResult(result)
    } catch (error: any) {
      alert(error.message || "이미지 생성에 실패했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <h5 className="text-xl font-bold">번역</h5>
      <span>
         MyMemory Translation API (https://mymemory.translated.net/)를 사용합니다.
      </span>
      
      {/* 한글 입력 박스 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          한글
        </label>
        <textarea
          value={koreanText}
          onChange={(e) => setKoreanText(e.target.value)}
          placeholder="한글 텍스트를 입력하세요..."
          className="w-full h-28 p-4 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 번역 버튼 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleKoreanToEnglish}
          disabled={isTranslating || !koreanText.trim()}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              번역 중...
            </>
          ) : (
            <>
              한영 번역
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <Button
          onClick={handleEnglishToKorean}
          disabled={isTranslating || !englishText.trim()}
          variant="outline"
          className="gap-2"
        >
          {isTranslating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              번역 중...
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" />
              영한 번역
            </>
          )}
        </Button>

        {/* 스타일 선택 */}
        <select
          value={imageStyle}
          onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {(Object.keys(styleLabels) as ImageStyle[]).map((style) => (
            <option key={style} value={style}>
              {styleLabels[style]}
            </option>
          ))}
        </select>

        <Button
          onClick={handleImageGenerate}
          disabled={isGenerating || !englishText.trim()}
          variant="outline"
          className="gap-2 bg-purple-500 hover:bg-purple-600 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              이미지생성
            </>
          )}
        </Button>
      </div>

      {/* 영문 입력 박스 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          English
        </label>
        <textarea
          value={englishText}
          onChange={(e) => setEnglishText(e.target.value)}
          placeholder="Enter English text..."
          className="w-full h-28 p-4 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* 이미지 생성 결과 박스 */}
      {imageResult && (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* JSON 결과 박스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API 응답 JSON
              </label>
              <div className="w-full h-96 p-4 text-xs border border-gray-300 rounded-lg overflow-auto bg-gray-50 font-mono">
                <pre>{JSON.stringify(imageResult, null, 2)}</pre>
              </div>
            </div>

            {/* 생성된 이미지 박스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생성된 이미지
              </label>
              <div className="w-full h-96 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                {imageResult.supabaseUrls && imageResult.supabaseUrls.length > 0 ? (
                  <img
                    src={imageResult.supabaseUrls[0]}
                    alt="Generated (Supabase)"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : imageResult.output && imageResult.output.length > 0 ? (
                  <img
                    src={imageResult.output[0]}
                    alt="Generated (Replicate)"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <p className="text-gray-400">이미지가 생성되지 않았습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* Supabase URL 정보 */}
          {imageResult.supabaseUrls && imageResult.supabaseUrls.length > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                ✅ Supabase Storage 업로드 완료
              </h3>
              <div className="space-y-2">
                {imageResult.supabaseUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-green-700">
                      {String.fromCharCode(97 + index)}:
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate flex-1"
                    >
                      {url}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
