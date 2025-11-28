/**
 * Replicate API - Image Generation
 * Flux Schnell model from Black Forest Labs
 * Calls Next.js API route for server-side handling
 */

interface ReplicateInput {
  prompt: string
  go_fast?: boolean
  megapixels?: string
  num_outputs?: number
  aspect_ratio?: string
  output_format?: string
  output_quality?: number
  num_inference_steps?: number
}

export interface ReplicateResponse {
  id: string
  model: string
  version: string
  input: ReplicateInput
  logs: string
  output: string[] | null
  error: string | null
  status: string
  created_at: string
  started_at: string | null
  completed_at: string | null
  urls: {
    get: string
    cancel: string
  }
  supabaseUrls?: string[] // Supabase Storage에 업로드된 이미지 URL들
}

/**
 * Generate image using Replicate API
 * Calls our Next.js API route for server-side handling
 * @param prompt - Text prompt for image generation
 * @param model - Model to use: "flux-schnell" (default) or "bytedance"
 */
export async function generateImage(
  prompt: string,
  model: "flux-schnell" | "bytedance" = "flux-schnell"
): Promise<ReplicateResponse> {
  if (!prompt.trim()) {
    throw new Error("이미지 생성을 위한 프롬프트를 입력해주세요.")
  }

  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, model }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "이미지 생성에 실패했습니다.")
    }

    const data: ReplicateResponse = await response.json()
    return data
  } catch (error: any) {
    console.error("이미지 생성 에러:", error)
    throw error
  }
}
