"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function InsertGenerator() {
  const [tableName, setTableName] = useState("")
  const [columns, setColumns] = useState("")
  const [excelData, setExcelData] = useState("")
  const [result, setResult] = useState("")

  // 옵션
  const [includeColumns, setIncludeColumns] = useState(true)
  const [noQuotesForNumbers, setNoQuotesForNumbers] = useState(true)
  const [nullForEmpty, setNullForEmpty] = useState(true)
  const [trimWhitespace, setTrimWhitespace] = useState(true)
  const [addSemicolon, setAddSemicolon] = useState(true)

  // 드롭다운
  const [insertMode, setInsertMode] = useState("per-row") // per-row, bulk
  const [rowSeparator, setRowSeparator] = useState("newline") // newline, custom

  // 통계
  const [rowCount, setRowCount] = useState(0)
  const [columnCount, setColumnCount] = useState(0)

  const isNumeric = (value: string): boolean => {
    if (value === "") return false
    return !isNaN(Number(value))
  }

  const formatValue = (value: string): string => {
    // 앞뒤 공백 제거
    const trimmed = trimWhitespace ? value.trim() : value

    // 빈 값은 NULL 처리
    if (trimmed === "" && nullForEmpty) {
      return "NULL"
    }

    // 숫자는 따옴표 없이
    if (noQuotesForNumbers && isNumeric(trimmed)) {
      return trimmed
    }

    // 문자열은 작은따옴표로 감싸기 (작은따옴표 이스케이프)
    const escaped = trimmed.replace(/'/g, "''")
    return `'${escaped}'`
  }

  const generateInsert = () => {
    if (!tableName.trim()) {
      alert("테이블명을 입력해주세요.")
      return
    }

    if (!columns.trim()) {
      alert("컬럼 목록을 입력해주세요.")
      return
    }

    if (!excelData.trim()) {
      alert("Excel 데이터를 입력해주세요.")
      return
    }

    // 컬럼 파싱 (줄바꿈 또는 쉼표로 분리)
    const columnList = columns
      .split(/[\n,]/)
      .map(c => c.trim())
      .filter(c => c !== "")

    if (columnList.length === 0) {
      alert("유효한 컬럼이 없습니다.")
      return
    }

    setColumnCount(columnList.length)

    // 데이터 파싱 (줄바꿈으로 행 분리)
    const rows = excelData
      .split('\n')
      .map(r => r.trim())
      .filter(r => r !== "")

    if (rows.length === 0) {
      alert("유효한 데이터가 없습니다.")
      return
    }

    setRowCount(rows.length)

    // INSERT 문 생성
    const insertStatements: string[] = []

    for (const row of rows) {
      // 탭 또는 쉼표로 값 분리
      const values = row.split(/[\t,]/).map(v => formatValue(v))

      // 컬럼 수와 값 수가 다른 경우 경고
      if (values.length !== columnList.length) {
        console.warn(`행의 값 개수(${values.length})가 컬럼 개수(${columnList.length})와 다릅니다: ${row}`)
      }

      // INSERT 문 생성
      let statement = `INSERT INTO ${tableName}`

      if (includeColumns) {
        statement += ` (${columnList.join(", ")})`
      }

      statement += ` VALUES (${values.join(", ")})`

      if (addSemicolon) {
        statement += ";"
      }

      insertStatements.push(statement)
    }

    setResult(insertStatements.join("\n"))
  }

  const copyResult = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result)
      alert("클립보드에 복사되었습니다!")
    } catch (error) {
      console.error("복사 실패:", error)
      alert("복사에 실패했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <p className="text-sm text-gray-600">
          엑셀에서 복사한 데이터를 붙여넣고, SQL INSERT 문으로 한 번에 생성하세요.
        </p>
      </div>

      {/* 설정 영역 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 테이블명 */}
        <div className="space-y-2">
          <Label htmlFor="tableName" className="text-sm font-semibold">
            테이블명
          </Label>
          <Input
            id="tableName"
            placeholder="tb_user"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </div>

        {/* INSERT 모드 */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">INSERT 모드</Label>
          <Select value={insertMode} onValueChange={setInsertMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per-row">행마다 INSERT 한 줄씩</SelectItem>
              <SelectItem value="bulk">한 번에 여러 행 (bulk)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 행 구분 */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">행 구분</Label>
          <Select value={rowSeparator} onValueChange={setRowSeparator}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newline">줄바꿈 기준 (엑셀에서 그대로 복붙)</SelectItem>
              <SelectItem value="custom">커스텀 구분자</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 컬럼 목록 */}
        <div className="space-y-2">
          <Label htmlFor="columns" className="text-base font-semibold">
            컬럼 목록
          </Label>
          <Textarea
            id="columns"
            placeholder="id&#10;userName&#10;age"
            className="min-h-[300px] font-mono text-sm"
            value={columns}
            onChange={(e) => setColumns(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            줄바꿈 또는 쉼표로 컬럼명 입력 가능. (id,name,age 또는 줄나눔)
          </p>
        </div>

        {/* Excel 데이터 */}
        <div className="space-y-2">
          <Label htmlFor="excelData" className="text-base font-semibold">
            Excel 데이터 붙여넣기
          </Label>
          <Textarea
            id="excelData"
            placeholder="1,홍길동,29&#10;2,김길순,19"
            className="min-h-[300px] font-mono text-sm"
            value={excelData}
            onChange={(e) => setExcelData(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            각 행은 줄바꿈으로, 각 값은 탭(엑셀 복사 기본) 또는 쉼표로 구분됩니다.
          </p>
        </div>
      </div>

      {/* 옵션 */}
      <div className="flex gap-6 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            id="includeColumns"
            checked={includeColumns}
            onCheckedChange={(checked) => setIncludeColumns(checked as boolean)}
          />
          <Label htmlFor="includeColumns" className="cursor-pointer font-normal">
            INSERT 문에 컬럼명 포함
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="noQuotesForNumbers"
            checked={noQuotesForNumbers}
            onCheckedChange={(checked) => setNoQuotesForNumbers(checked as boolean)}
          />
          <Label htmlFor="noQuotesForNumbers" className="cursor-pointer font-normal">
            숫자는 따옴표 없이 사용
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="nullForEmpty"
            checked={nullForEmpty}
            onCheckedChange={(checked) => setNullForEmpty(checked as boolean)}
          />
          <Label htmlFor="nullForEmpty" className="cursor-pointer font-normal">
            빈 값은 NULL 처리
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="trimWhitespace"
            checked={trimWhitespace}
            onCheckedChange={(checked) => setTrimWhitespace(checked as boolean)}
          />
          <Label htmlFor="trimWhitespace" className="cursor-pointer font-normal">
            셀 앞뒤 공백 제거
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="addSemicolon"
            checked={addSemicolon}
            onCheckedChange={(checked) => setAddSemicolon(checked as boolean)}
          />
          <Label htmlFor="addSemicolon" className="cursor-pointer font-normal">
            문장 끝에 세미콜론(;) 추가
          </Label>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button onClick={generateInsert} size="lg" className="px-8">
          INSERT문 생성
        </Button>
        <Button
          onClick={copyResult}
          variant="outline"
          size="lg"
          disabled={!result}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          복사하기
        </Button>
      </div>

      {/* 결과 */}
      <div className="space-y-2">
        <Label htmlFor="result" className="text-base font-semibold">
          결과 INSERT 문
        </Label>
        <Textarea
          id="result"
          className="min-h-[300px] font-mono text-sm bg-gray-50"
          value={result}
          readOnly
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>생성된 행 수: {rowCount}행 / 컬럼 수: {columnCount}개</span>
        </div>
      </div>
    </div>
  )
}
