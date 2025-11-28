/**
 * Supabase Storage API
 * 이미지 업로드 및 관리
 */

import { createClient } from "@/lib/db/server"

/**
 * 원격 이미지 URL을 다운로드하여 Supabase Storage에 업로드
 * @param imageUrl 원격 이미지 URL (Replicate 등)
 * @param bucket Storage 버킷 이름
 * @param folder 폴더 경로 (예: "myUp44")
 * @returns Supabase Storage의 공개 URL
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  bucket: string = "my-bucket",
  folder: string = "myUp44"
): Promise<string> {
  try {
    // 1. 원격 이미지 다운로드
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`이미지 다운로드 실패: ${response.status}`)
    }

    const imageBlob = await response.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 2. 파일 확장자 추출 (URL에서)
    let extension = "webp"
    const urlExtMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
    if (urlExtMatch) {
      extension = urlExtMatch[1].toLowerCase()
    }

    // 3. 파일명 생성: YYYYMMDDHHMMSS_a.확장자
    const now = new Date()
    const timestamp = formatTimestamp(now)
    const fileName = `${timestamp}_a.${extension}`
    const filePath = `${folder}/${fileName}`

    // 4. Supabase Storage에 업로드
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: imageBlob.type || `image/${extension}`,
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      throw new Error(`Storage 업로드 실패: ${error.message}`)
    }

    // 5. 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return urlData.publicUrl
  } catch (error: any) {
    console.error("이미지 업로드 에러:", error)
    throw error
  }
}

/**
 * 날짜를 YYYYMMDDHHMMSS 형식으로 포맷
 */
function formatTimestamp(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

/**
 * 여러 이미지를 순차적으로 업로드
 * @param imageUrls 이미지 URL 배열
 * @param bucket Storage 버킷 이름
 * @param folder 폴더 경로
 * @returns 업로드된 이미지들의 Supabase URL 배열
 */
export async function uploadMultipleImages(
  imageUrls: string[],
  bucket: string = "my-bucket",
  folder: string = "myUp44"
): Promise<string[]> {
  const uploadedUrls: string[] = []
  const timestamp = formatTimestamp(new Date())

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const imageUrl = imageUrls[i]
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`이미지 다운로드 실패: ${response.status}`)
      }

      const imageBlob = await response.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // 파일 확장자 추출
      let extension = "webp"
      const urlExtMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
      if (urlExtMatch) {
        extension = urlExtMatch[1].toLowerCase()
      }

      // 파일명: YYYYMMDDHHMMSS_a, YYYYMMDDHHMMSS_b, ...
      const suffix = String.fromCharCode(97 + i) // a, b, c, d, ...
      const fileName = `${timestamp}_${suffix}.${extension}`
      const filePath = `${folder}/${fileName}`

      // Supabase Storage에 업로드
      const supabase = await createClient()
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
          contentType: imageBlob.type || `image/${extension}`,
          cacheControl: "3600",
          upsert: false,
        })

      if (error) {
        throw new Error(`Storage 업로드 실패: ${error.message}`)
      }

      // 공개 URL 생성
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      uploadedUrls.push(urlData.publicUrl)
    } catch (error: any) {
      console.error(`이미지 ${i} 업로드 에러:`, error)
      throw error
    }
  }

  return uploadedUrls
}
