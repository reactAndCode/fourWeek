import { NextRequest, NextResponse } from "next/server"
import { uploadMultipleImages } from "@/lib/api/storage"

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "flux-schnell" } = await request.json()

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "이미지 생성을 위한 프롬프트를 입력해주세요." },
        { status: 400 }
      )
    }

    const apiToken = process.env.REPLICATE_API_TOKEN
    if (!apiToken) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN이 설정되지 않았습니다." },
        { status: 500 }
      )
    }

    let response: Response

    if (model === "bytedance") {
      // ByteDance SDXL Lightning 모델
      response = await fetch(
        "https://api.replicate.com/v1/predictions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
            "Prefer": "wait",
          },
          body: JSON.stringify({
            version: "bytedance/sdxl-lightning-4step:6f7a773af6fc3e8de9d5a3c00be77c17308914bf67772726aff83496ba1e3bbe",
            input: {
              seed: 0,
              width: 1024,
              height: 1024,
              prompt: prompt,
              scheduler: "K_EULER",
              num_outputs: 1,
              guidance_scale: 0,
              negative_prompt: "worst quality, low quality",
              num_inference_steps: 4,
            },
          }),
        }
      )
    } else {
      // Flux Schnell 모델 (기본)
      response = await fetch(
        "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
            "Prefer": "wait",
          },
          body: JSON.stringify({
            input: {
              prompt: prompt,
              go_fast: true,
              megapixels: "1",
              num_outputs: 1,
              aspect_ratio: "1:1",
              output_format: "webp",
              output_quality: 80,
              num_inference_steps: 4,
            },
          }),
        }
      )
    }

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `API 요청 실패: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.error) {
      return NextResponse.json(
        { error: `이미지 생성 실패: ${data.error}` },
        { status: 500 }
      )
    }

    // Supabase Storage에 이미지 업로드
    let supabaseUrls: string[] = []
    if (data.output && Array.isArray(data.output) && data.output.length > 0) {
      try {
        supabaseUrls = await uploadMultipleImages(
          data.output,
          "my-real-estate", // 버킷 이름
          "myUp44"          // 폴더 이름
        )
        console.log("Supabase 업로드 성공:", supabaseUrls)
      } catch (uploadError: any) {
        console.error("Supabase 업로드 실패:", uploadError)
        // 업로드 실패해도 Replicate 결과는 반환
      }
    }

    // 응답에 Supabase URL 추가
    return NextResponse.json({
      ...data,
      supabaseUrls: supabaseUrls,
    })
  } catch (error: any) {
    console.error("이미지 생성 에러:", error)
    return NextResponse.json(
      { error: error.message || "이미지 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}
