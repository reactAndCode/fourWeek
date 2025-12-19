"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ValueCompare } from "./value-compare"
import { JsonCompare } from "./json-compare"
import { InsertGenerator } from "./insert-generator"

type TabType = "in-clause" | "value-compare" | "json-compare" | "insert-generator"

export function DataTransform() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState<TabType>("in-clause")

  const [inputValue, setInputValue] = useState("")
  const [outputValue, setOutputValue] = useState("")

  // UI 상태
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

  // 고급 옵션
  const [wrapType, setWrapType] = useState("single") // single, double, none
  const [separator, setSeparator] = useState(", ") // 구분자
  const [template, setTemplate] = useState("parens") // parens, brackets, braces
  const [prefix, setPrefix] = useState("")
  const [suffix, setSuffix] = useState("")
  const [maxPerLine, setMaxPerLine] = useState("0")

  // 체크박스 옵션
  const [removeDuplicates, setRemoveDuplicates] = useState(true)
  const [sortAscending, setSortAscending] = useState(false)
  const [ignoreEmpty, setIgnoreEmpty] = useState(true)

  // 통계
  const [originalCount, setOriginalCount] = useState(0)
  const [finalCount, setFinalCount] = useState(0)

  const generateInClause = () => {
    if (!inputValue.trim()) {
      setOutputValue("")
      setOriginalCount(0)
      setFinalCount(0)
      return
    }

    // 입력값을 줄바꿈으로 분리
    let values = inputValue
      .split('\n')
      .map(v => v.trim())

    const originalLength = values.length
    setOriginalCount(originalLength)

    // 빈 값 무시
    if (ignoreEmpty) {
      values = values.filter(v => v !== "")
    }

    // 중복 제거
    if (removeDuplicates) {
      values = [...new Set(values)]
    }

    // 정렬
    if (sortAscending) {
      values.sort()
    }

    setFinalCount(values.length)

    // 값이 없으면 종료
    if (values.length === 0) {
      setOutputValue("")
      return
    }

    // 각 값을 감싸기
    let wrappedValues = values
    if (wrapType === "single") {
      wrappedValues = values.map(v => `'${v}'`)
    } else if (wrapType === "double") {
      wrappedValues = values.map(v => `"${v}"`)
    }

    // 줄바꿈 처리
    let joinedValues: string
    const maxItems = parseInt(maxPerLine)
    if (maxItems > 0) {
      // 지정된 개수마다 줄바꿈
      const chunks: string[] = []
      for (let i = 0; i < wrappedValues.length; i += maxItems) {
        chunks.push(wrappedValues.slice(i, i + maxItems).join(separator))
      }
      joinedValues = chunks.join(',\n ')
    } else {
      // 모두 한 줄에
      joinedValues = wrappedValues.join(separator)
    }

    // 템플릿 적용
    let result = joinedValues
    if (template === "parens") {
      result = `(${joinedValues})`
    } else if (template === "brackets") {
      result = `[${joinedValues}]`
    } else if (template === "braces") {
      result = `{${joinedValues}}`
    }

    // 접두사/접미사 추가
    if (prefix) {
      result = `${prefix} ${result}`
    }
    if (suffix) {
      result = `${result} ${suffix}`
    }

    setOutputValue(result)
  }

  const copyToClipboard = async () => {
    if (!outputValue) return

    try {
      await navigator.clipboard.writeText(outputValue)
      alert("클립보드에 복사되었습니다!")
    } catch (error) {
      console.error("복사 실패:", error)
      alert("복사에 실패했습니다.")
    }
  }

  const tabs = [
    { id: "in-clause" as TabType, label: "IN절 생성기" },
    { id: "value-compare" as TabType, label: "값 비교 도구" },
    { id: "json-compare" as TabType, label: "JSON 비교" },
    { id: "insert-generator" as TabType, label: "INSERT문 생성" },
  ]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold mb-2">데이터 변환 관리</h2>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "value-compare" ? (
        <ValueCompare />
      ) : activeTab === "json-compare" ? (
        <JsonCompare />
      ) : activeTab === "insert-generator" ? (
        <InsertGenerator />
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            한 줄당 하나씩 값 붙여넣으면 자동으로 IN (...) 형식으로 만들어줍니다.
          </p>

          {/* 입력값 */}
      <div className="space-y-2">
        <Label htmlFor="input" className="text-base font-semibold">
          입력값 (한 줄에 하나씩 / 쉼표, 공백 모두 구분자로 인식)
        </Label>
        <Textarea
          id="input"
          placeholder="404&#10;405&#10;406&#10;407&#10;408&#10;409&#10;410&#10;411"
          className="min-h-[200px] font-mono text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          ※ 공백/줄바꿈 자동 제거됩니다. 데이터 앞 제한 없이 사용 가능합니다.
        </p>
      </div>

      {/* 고급 옵션 */}
      <Card className="p-4">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between hover:opacity-70 transition-opacity"
        >
          <h3 className="font-semibold">고급 옵션</h3>
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-transform duration-200",
              isAdvancedOpen && "rotate-180"
            )}
          />
        </button>

        {isAdvancedOpen && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
          {/* 문자열 감싸기 */}
          <div className="space-y-2">
            <Label>문자열 감싸기</Label>
            <Select value={wrapType} onValueChange={setWrapType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">단일따옴표 (')</SelectItem>
                <SelectItem value="double">쌍따옴표 (")</SelectItem>
                <SelectItem value="none">감싸지 않음</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 구분자 */}
          <div className="space-y-2">
            <Label>구분자</Label>
            <Select value={separator} onValueChange={setSeparator}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=", ">쉼표 + 공백 (, )</SelectItem>
                <SelectItem value=",">쉼표 (,)</SelectItem>
                <SelectItem value=" ">공백 ( )</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 템플릿 */}
          <div className="space-y-2">
            <Label>템플릿</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parens">괄호만 ( ... )</SelectItem>
                <SelectItem value="brackets">대괄호 [ ... ]</SelectItem>
                <SelectItem value="braces">중괄호 {`{ ... }`}</SelectItem>
                <SelectItem value="none">없음</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* 앞에 붙일 문자열 */}
          <div className="space-y-2">
            <Label>앞에 붙일 문자열</Label>
            <Input
              placeholder="(예) AND COL_NM IN"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </div>

          {/* 뒤에 붙일 문자열 */}
          <div className="space-y-2">
            <Label>뒤에 붙일 문자열</Label>
            <Input
              placeholder="(예) /* comment */"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
            />
          </div>

          {/* 한 줄당 최대 개수 */}
          <div className="space-y-2">
            <Label>한 줄당 최대 개수 (줄바꿈)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={maxPerLine}
              onChange={(e) => setMaxPerLine(e.target.value)}
            />
            <p className="text-xs text-gray-500">0이면 강제 줄바꿈 없음</p>
          </div>
        </div>

        {/* 체크박스 옵션 */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="removeDuplicates"
              checked={removeDuplicates}
              onCheckedChange={(checked) => setRemoveDuplicates(checked as boolean)}
            />
            <Label htmlFor="removeDuplicates" className="cursor-pointer font-normal">
              중복 제거
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="sortAscending"
              checked={sortAscending}
              onCheckedChange={(checked) => setSortAscending(checked as boolean)}
            />
            <Label htmlFor="sortAscending" className="cursor-pointer font-normal">
              오름차순 정렬
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ignoreEmpty"
              checked={ignoreEmpty}
              onCheckedChange={(checked) => setIgnoreEmpty(checked as boolean)}
            />
            <Label htmlFor="ignoreEmpty" className="cursor-pointer font-normal">
              빈 값 무시
            </Label>
          </div>
        </div>
          </div>
        )}
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button onClick={generateInClause} size="lg" className="px-8">
          IN절 생성
        </Button>
        <Button
          onClick={copyToClipboard}
          variant="outline"
          size="lg"
          disabled={!outputValue}
        >
          복사하기
        </Button>
      </div>

      {/* 결과 */}
      <div className="space-y-2">
        <Label htmlFor="output" className="text-base font-semibold">
          결과
        </Label>
        <Textarea
          id="output"
          className="min-h-[200px] font-mono text-sm bg-gray-50"
          value={outputValue}
          readOnly
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>원본: {originalCount}개 / 최종: {finalCount}개</span>
        </div>
      </div>
        </div>
      )}
    </div>
  )
}
