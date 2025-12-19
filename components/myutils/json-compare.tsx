"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeftRight, Copy, AlignLeft } from "lucide-react"

interface DiffItem {
  path: string
  type: "value" | "added" | "removed"
  oldValue?: any
  newValue?: any
}

export function JsonCompare() {
  const [jsonA, setJsonA] = useState("")
  const [jsonB, setJsonB] = useState("")

  // 옵션
  const [sortKeys, setSortKeys] = useState(true)
  const [ignoreArrayOrder, setIgnoreArrayOrder] = useState(false)
  const [trimStrings, setTrimStrings] = useState(true)

  // 결과
  const [isEqual, setIsEqual] = useState<boolean | null>(null)
  const [diffs, setDiffs] = useState<DiffItem[]>([])
  const [diffCount, setDiffCount] = useState(0)

  const normalizeValue = (value: any): any => {
    if (typeof value === "string" && trimStrings) {
      return value.trim()
    }
    if (Array.isArray(value)) {
      const normalized = value.map(normalizeValue)
      return ignoreArrayOrder ? normalized.sort() : normalized
    }
    if (value !== null && typeof value === "object") {
      const normalized: any = {}
      const keys = sortKeys ? Object.keys(value).sort() : Object.keys(value)
      for (const key of keys) {
        normalized[key] = normalizeValue(value[key])
      }
      return normalized
    }
    return value
  }

  const compareObjects = (
    obj1: any,
    obj2: any,
    path: string = "$",
    differences: DiffItem[] = []
  ): DiffItem[] => {
    const type1 = Array.isArray(obj1) ? "array" : typeof obj1
    const type2 = Array.isArray(obj2) ? "array" : typeof obj2

    // 타입이 다른 경우
    if (type1 !== type2) {
      differences.push({
        path,
        type: "value",
        oldValue: obj1,
        newValue: obj2,
      })
      return differences
    }

    // 기본 타입 비교
    if (type1 !== "object" || obj1 === null || obj2 === null) {
      if (obj1 !== obj2) {
        differences.push({
          path,
          type: "value",
          oldValue: obj1,
          newValue: obj2,
        })
      }
      return differences
    }

    // 배열 비교
    if (Array.isArray(obj1)) {
      const maxLength = Math.max(obj1.length, obj2.length)
      for (let i = 0; i < maxLength; i++) {
        if (i >= obj1.length) {
          differences.push({
            path: `${path}[${i}]`,
            type: "added",
            newValue: obj2[i],
          })
        } else if (i >= obj2.length) {
          differences.push({
            path: `${path}[${i}]`,
            type: "removed",
            oldValue: obj1[i],
          })
        } else {
          compareObjects(obj1[i], obj2[i], `${path}[${i}]`, differences)
        }
      }
      return differences
    }

    // 객체 비교
    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)
    const allKeys = new Set([...keys1, ...keys2])

    for (const key of allKeys) {
      const newPath = `${path}.${key}`

      if (!(key in obj1)) {
        differences.push({
          path: newPath,
          type: "added",
          newValue: obj2[key],
        })
      } else if (!(key in obj2)) {
        differences.push({
          path: newPath,
          type: "removed",
          oldValue: obj1[key],
        })
      } else {
        compareObjects(obj1[key], obj2[key], newPath, differences)
      }
    }

    return differences
  }

  const formatValue = (value: any): string => {
    if (value === undefined) return "(없음)"
    if (value === null) return "null"
    if (typeof value === "string") return `"${value}"`
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  const compareJson = () => {
    try {
      const parsedA = JSON.parse(jsonA)
      const parsedB = JSON.parse(jsonB)

      const normalizedA = normalizeValue(parsedA)
      const normalizedB = normalizeValue(parsedB)

      const differences = compareObjects(normalizedA, normalizedB)
      setDiffs(differences)
      setDiffCount(differences.length)
      setIsEqual(differences.length === 0)
    } catch (error) {
      alert("JSON 파싱 오류: " + (error as Error).message)
      setIsEqual(null)
      setDiffs([])
      setDiffCount(0)
    }
  }

  const formatJson = (input: string): string => {
    try {
      const parsed = JSON.parse(input)
      const normalized = normalizeValue(parsed)
      return JSON.stringify(normalized, null, 2)
    } catch (error) {
      return input
    }
  }

  const formatBoth = () => {
    setJsonA(formatJson(jsonA))
    setJsonB(formatJson(jsonB))
  }

  const swapJson = () => {
    const temp = jsonA
    setJsonA(jsonB)
    setJsonB(temp)
  }

  const copyDiff = async () => {
    const diffText = diffs
      .map((diff) => {
        if (diff.type === "value") {
          return `[${diff.path}] ${formatValue(diff.oldValue)} → ${formatValue(diff.newValue)} (value)`
        } else if (diff.type === "removed") {
          return `[${diff.path}] ${formatValue(diff.oldValue)} → (없음) (removed)`
        } else {
          return `[${diff.path}] (없음) → ${formatValue(diff.newValue)} (added)`
        }
      })
      .join("\n")

    try {
      await navigator.clipboard.writeText(diffText)
      alert("Diff가 클립보드에 복사되었습니다!")
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
          JSON 두 개를 붙여넣고 차이점을 비교합니다. (브라우저에서만 처리)
        </p>
      </div>

      {/* 입력 영역 */}
      <div className="grid grid-cols-2 gap-4">
        {/* JSON A */}
        <div className="space-y-2">
          <Label htmlFor="jsonA" className="text-base font-semibold">
            JSON A
          </Label>
          <Textarea
            id="jsonA"
            placeholder='{\n  "a": 1,\n  "b": {\n    "c": 2\n  }\n}'
            className="min-h-[300px] font-mono text-sm"
            value={jsonA}
            onChange={(e) => setJsonA(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            ※ JSON 문자열 그대로 붙여넣기
          </p>
        </div>

        {/* JSON B */}
        <div className="space-y-2">
          <Label htmlFor="jsonB" className="text-base font-semibold">
            JSON B
          </Label>
          <Textarea
            id="jsonB"
            placeholder='{\n  "a": 2,\n  "b": {\n    "d": 3\n  }\n}'
            className="min-h-[300px] font-mono text-sm"
            value={jsonB}
            onChange={(e) => setJsonB(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            ※ JSON 문자열 그대로 붙여넣기
          </p>
        </div>
      </div>

      {/* 옵션 */}
      <div className="flex gap-6 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            id="sortKeys"
            checked={sortKeys}
            onCheckedChange={(checked) => setSortKeys(checked as boolean)}
          />
          <Label htmlFor="sortKeys" className="cursor-pointer font-normal">
            키 정렬(알파벳 비교)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="ignoreArrayOrder"
            checked={ignoreArrayOrder}
            onCheckedChange={(checked) => setIgnoreArrayOrder(checked as boolean)}
          />
          <Label htmlFor="ignoreArrayOrder" className="cursor-pointer font-normal">
            배열 순서 무시(값 set 비교)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="trimStrings"
            checked={trimStrings}
            onCheckedChange={(checked) => setTrimStrings(checked as boolean)}
          />
          <Label htmlFor="trimStrings" className="cursor-pointer font-normal">
            문자열 앞뒤 공백 trim
          </Label>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <Button onClick={compareJson} size="lg" className="px-8">
          JSON 비교
        </Button>
        <Button
          onClick={formatBoth}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <AlignLeft className="h-4 w-4" />
          A/B 포맷(정렬+들여쓰기)
        </Button>
        <Button
          onClick={swapJson}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          A ↔ B 교환
        </Button>
        <Button
          onClick={copyDiff}
          variant="outline"
          size="lg"
          disabled={diffs.length === 0}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Diff 복사
        </Button>
      </div>

      {/* 결과 요약 */}
      {isEqual !== null && (
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">결과 요약</h3>
          <div className="flex items-center gap-2 mb-2">
            {isEqual ? (
              <span className="text-green-600 font-medium flex items-center gap-2">
                <span className="text-2xl">✓</span> 동일합니다 (Normalized 기준)
              </span>
            ) : (
              <span className="text-red-600 font-medium flex items-center gap-2">
                <span className="text-2xl">✗</span> 다릅니다 (Normalized 기준)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            차이 {diffCount}개. 옵션: 키정렬={sortKeys ? "ON" : "OFF"},
            배열순서무시={ignoreArrayOrder ? "ON" : "OFF"},
            문자열trim={trimStrings ? "ON" : "OFF"}
          </p>
        </div>
      )}

      {/* Diff 결과 */}
      {diffs.length > 0 && (
        <div className="space-y-2">
          <Label className="text-base font-semibold">
            Diff (경로 기준)
          </Label>
          <Textarea
            className="min-h-[300px] font-mono text-sm bg-gray-50"
            value={diffs
              .map((diff) => {
                if (diff.type === "value") {
                  return `[${diff.path}] ${formatValue(diff.oldValue)} → ${formatValue(diff.newValue)} (value)`
                } else if (diff.type === "removed") {
                  return `[${diff.path}] ${formatValue(diff.oldValue)} → (없음) (removed)`
                } else {
                  return `[${diff.path}] (없음) → ${formatValue(diff.newValue)} (added)`
                }
              })
              .join("\n")}
            readOnly
          />
        </div>
      )}
    </div>
  )
}
