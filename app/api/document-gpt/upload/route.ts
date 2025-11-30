import { NextRequest, NextResponse } from "next/server"
import { PDFDocument } from "pdf-lib"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "파일이 제공되지 않았습니다." },
        { status: 400 }
      )
    }

    // 파일 타입 확인
    const allowedTypes = ["text/plain", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "TXT 또는 PDF 파일만 지원합니다." },
        { status: 400 }
      )
    }

    let text = ""
    let wordCount = 0

    // TXT 파일 처리
    if (file.type === "text/plain") {
      text = await file.text()
      wordCount = text.length
    }
    // PDF 파일 처리
    else if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)

        const pages = pdfDoc.getPages()
        const textParts: string[] = []

        // PDF에서 텍스트 추출은 제한적이므로 간단한 정보만 제공
        textParts.push(`PDF 문서 정보:`)
        textParts.push(`- 총 페이지 수: ${pages.length}`)
        textParts.push(`- 제목: ${pdfDoc.getTitle() || '제목 없음'}`)
        textParts.push(`- 작성자: ${pdfDoc.getAuthor() || '작성자 정보 없음'}`)
        textParts.push(`\n참고: PDF에서 텍스트를 완전히 추출하려면 OCR이 필요합니다.`)
        textParts.push(`현재는 TXT 파일만 전체 텍스트 분석이 가능합니다.`)

        text = textParts.join("\n")
        wordCount = text.length
      } catch (error) {
        console.error("PDF parsing error:", error)
        return NextResponse.json(
          { error: "PDF 파일을 읽는데 실패했습니다. TXT 파일을 사용해주세요." },
          { status: 500 }
        )
      }
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "파일에서 텍스트를 추출할 수 없습니다." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      text,
      wordCount,
      fileName: file.name,
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "파일 업로드 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
