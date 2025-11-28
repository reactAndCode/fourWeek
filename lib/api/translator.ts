/**
 * 번역 API 함수
 * MyMemory Translation API 사용 (무료, 하루 500 요청 제한)
 */

interface TranslationResponse {
  responseData: {
    translatedText: string
    match: number
  }
  quotaFinished: boolean
  responseStatus: number
}

/**
 * 한글 → 영어 번역
 */
export async function translateKoreanToEnglish(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error("번역할 텍스트를 입력해주세요.")
  }

  try {
    const encodedText = encodeURIComponent(text)
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ko|en`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: TranslationResponse = await response.json()

    if (data.quotaFinished) {
      throw new Error("일일 번역 할당량이 초과되었습니다. 내일 다시 시도해주세요.")
    }

    if (data.responseStatus !== 200) {
      throw new Error("번역에 실패했습니다.")
    }

    return data.responseData.translatedText
  } catch (error) {
    console.error("번역 에러:", error)
    throw error
  }
}

/**
 * 영어 → 한글 번역
 */
export async function translateEnglishToKorean(text: string): Promise<string> {
  if (!text.trim()) {
    throw new Error("번역할 텍스트를 입력해주세요.")
  }

  try {
    const encodedText = encodeURIComponent(text)
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|ko`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: TranslationResponse = await response.json()

    if (data.quotaFinished) {
      throw new Error("일일 번역 할당량이 초과되었습니다. 내일 다시 시도해주세요.")
    }

    if (data.responseStatus !== 200) {
      throw new Error("번역에 실패했습니다.")
    }

    return data.responseData.translatedText
  } catch (error) {
    console.error("번역 에러:", error)
    throw error
  }
}
