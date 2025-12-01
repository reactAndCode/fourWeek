/**
 * 텍스트를 청크로 분할하는 유틸리티
 */

export interface ChunkOptions {
  chunkSize?: number
  chunkOverlap?: number
}

/**
 * 텍스트를 고정된 크기의 청크로 분할
 * @param text 분할할 텍스트
 * @param chunkSize 각 청크의 최대 단어 수 (기본값: 500)
 * @param chunkOverlap 청크 간 겹치는 단어 수 (기본값: 50)
 * @returns 분할된 청크 배열
 */
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 500,
  chunkOverlap: number = 50
): string[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // 단어 단위로 분할
  const words = text.split(/\s+/).filter(word => word.length > 0)

  if (words.length <= chunkSize) {
    return [text]
  }

  const chunks: string[] = []
  let startIndex = 0

  while (startIndex < words.length) {
    // 현재 청크의 끝 인덱스 계산
    const endIndex = Math.min(startIndex + chunkSize, words.length)

    // 청크 생성
    const chunk = words.slice(startIndex, endIndex).join(" ")
    chunks.push(chunk.trim())

    // 다음 청크의 시작 위치 (overlap 고려)
    startIndex += chunkSize - chunkOverlap

    // 마지막 청크에 도달한 경우
    if (endIndex === words.length) {
      break
    }
  }

  return chunks
}

/**
 * 문장 단위로 텍스트를 분할
 * @param text 분할할 텍스트
 * @param maxChunkSize 각 청크의 최대 문자 수
 * @returns 분할된 청크 배열
 */
export function splitBySentences(
  text: string,
  maxChunkSize: number = 1000
): string[] {
  if (!text || text.trim().length === 0) {
    return []
  }

  // 문장 단위로 분할 (한글 및 영문 문장 부호 고려)
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]+/g) || [text]

  const chunks: string[] = []
  let currentChunk = ""

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()

    if ((currentChunk + " " + trimmedSentence).length > maxChunkSize && currentChunk) {
      // 현재 청크가 최대 크기를 초과하면 저장하고 새 청크 시작
      chunks.push(currentChunk.trim())
      currentChunk = trimmedSentence
    } else {
      // 현재 청크에 문장 추가
      currentChunk += (currentChunk ? " " : "") + trimmedSentence
    }
  }

  // 마지막 청크 추가
  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}
