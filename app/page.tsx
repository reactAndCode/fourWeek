import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, StickyNote, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">홈</h1>
        <p className="text-gray-600 mt-2">이번 주 업무 현황을 한눈에 확인하고 관리하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 근무 시간</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">38시간 30분</div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 주 누적
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료한 업무</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12개</div>
            <p className="text-xs text-muted-foreground mt-1">
              이번 주 완료
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground mt-1">
              목표 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>주간일지</CardTitle>
            <CardDescription>이번 주 작업 내역을 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                일일 작업 내역을 기록하고 주간 통계를 확인할 수 있습니다.
              </p>
              <a
                href="/weeklog"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                주간일지 보기 →
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>메모관리</CardTitle>
            <CardDescription>중요한 메모를 저장하고 관리하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                업무 관련 메모를 작성하고 태그로 분류할 수 있습니다.
              </p>
              <a
                href="/memos"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                메모관리 보기 →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
