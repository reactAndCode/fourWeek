"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftRight } from "lucide-react"

export function ValueCompare() {
  const [inputA, setInputA] = useState("")
  const [inputB, setInputB] = useState("")

  // 옵션
  const [removeDuplicates, setRemoveDuplicates] = useState(true)
  const [sortAscending, setSortAscending] = useState(true)
  const [trimWhitespace, setTrimWhitespace] = useState(true)

  // 결과
  const [common, setCommon] = useState<string[]>([])
  const [onlyA, setOnlyA] = useState<string[]>([])
  const [onlyB, setOnlyB] = useState<string[]>([])
  const [unique, setUnique] = useState<string[]>([])

  const parseValues = (input: string): string[] => {
    if (!input.trim()) return []

    // 줄바꿈, 쉼표, 공백으로 분리
    let values = input
      .split(/[\n,]/)
      .map(v => trimWhitespace ? v.trim() : v)
      .filter(v => v !== "")

    // 중복 제거
    if (removeDuplicates) {
      values = [...new Set(values)]
    }

    // 정렬
    if (sortAscending) {
      values.sort()
    }

    return values
  }

  const compareValues = () => {
    const valuesA = parseValues(inputA)
    const valuesB = parseValues(inputB)

    const setA = new Set(valuesA)
    const setB = new Set(valuesB)

    // 공통 값 (A ∩ B)
    const commonValues = valuesA.filter(v => setB.has(v))
    setCommon(sortAscending ? commonValues.sort() : commonValues)

    // A에만 있는 값 (A - B)
    const onlyInA = valuesA.filter(v => !setB.has(v))
    setOnlyA(sortAscending ? onlyInA.sort() : onlyInA)

    // B에만 있는 값 (B - A)
    const onlyInB = valuesB.filter(v => !setA.has(v))
    setOnlyB(sortAscending ? onlyInB.sort() : onlyInB)

    // 전체 유니크 값 (A ∪ B)
    const allUnique = [...new Set([...valuesA, ...valuesB])]
    setUnique(sortAscending ? allUnique.sort() : allUnique)
  }

  const swapValues = () => {
    const temp = inputA
    setInputA(inputB)
    setInputB(temp)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold mb-2">값 비교 도구</h2>
        <p className="text-sm text-gray-600">
          두 개의 값 목록을 붙여넣고, 공통값과 차이값을 한 번에 확인해보세요.
        </p>
      </div>

      {/* 입력 영역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* A 값 목록 */}
        <div className="space-y-2">
          <Label htmlFor="inputA" className="text-base font-semibold">
            A 값 목록
          </Label>
          <Textarea
            id="inputA"
            placeholder="apple&#10;tomato&#10;banana"
            className="min-h-[250px] font-mono text-sm"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            ※ 한 줄에 하나씩, 또는 쉼표/공백으로 구분해서 넣어도 됩니다.
          </p>
        </div>

        {/* B 값 목록 */}
        <div className="space-y-2">
          <Label htmlFor="inputB" className="text-base font-semibold">
            B 값 목록
          </Label>
          <Textarea
            id="inputB"
            placeholder="banana&#10;orange&#10;melon"
            className="min-h-[250px] font-mono text-sm"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            ※ 공백만 줄은 자동으로 무시됩니다.
          </p>
        </div>
      </div>

      {/* 옵션 */}
      <div className="flex gap-6 items-center">
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
            id="trimWhitespace"
            checked={trimWhitespace}
            onCheckedChange={(checked) => setTrimWhitespace(checked as boolean)}
          />
          <Label htmlFor="trimWhitespace" className="cursor-pointer font-normal">
            앞뒤 공백 제거
          </Label>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button onClick={compareValues} size="lg" className="px-8">
          값 비교하기
        </Button>
        <Button
          onClick={swapValues}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          A ↔ B 교환
        </Button>
      </div>

      {/* 결과 영역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 공통 값 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            공통 값 (A ∩ B)
          </Label>
          <Textarea
            className="min-h-[200px] font-mono text-sm bg-gray-50"
            value={common.join('\n')}
            readOnly
          />
          <p className="text-xs text-gray-600">공통 값: {common.length}개</p>
        </div>

        {/* A에만 있는 값 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            A에만 있는 값 (A - B)
          </Label>
          <Textarea
            className="min-h-[200px] font-mono text-sm bg-gray-50"
            value={onlyA.join('\n')}
            readOnly
          />
          <p className="text-xs text-gray-600">
            A에만 있는 값: {onlyA.length}개 (A 원본 {parseValues(inputA).length}개 / 유니크 {new Set(parseValues(inputA)).size}개)
          </p>
        </div>

        {/* B에만 있는 값 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            B에만 있는 값 (B - A)
          </Label>
          <Textarea
            className="min-h-[200px] font-mono text-sm bg-gray-50"
            value={onlyB.join('\n')}
            readOnly
          />
          <p className="text-xs text-gray-600">
            B에만 있는 값: {onlyB.length}개
          </p>
        </div>

        {/* 전체 유니크 값 */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            전체 유니크 값 (A ∪ B)
          </Label>
          <Textarea
            className="min-h-[200px] font-mono text-sm bg-gray-50"
            value={unique.join('\n')}
            readOnly
          />
          <p className="text-xs text-gray-600">전체 유니크 값: {unique.length}개</p>
        </div>
      </div>
    </div>
  )
}
