"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, signUp } from "@/lib/api/auth"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 유효성 검사
    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.")
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    try {
      if (isLogin) {
        // 로그인
        await signIn(email, password)
        console.log("로그인 성공!")
        router.push("/")
      } else {
        // 회원가입
        const result = await signUp(email, password)
        console.log("회원가입 성공!", result)

        // 이메일 인증이 필요한 경우
        if (result.user && !result.session) {
          alert("회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.")
          setIsLogin(true)
        } else {
          // 이메일 인증이 필요없는 경우 바로 로그인
          alert("회원가입이 완료되었습니다!")
          router.push("/")
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error)

      // 에러 메시지 한글화
      if (error.message.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else if (error.message.includes("Email not confirmed")) {
        setError("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.")
      } else if (error.message.includes("User already registered")) {
        setError("이미 가입된 이메일입니다.")
      } else {
        setError(error.message || "오류가 발생했습니다. 다시 시도해주세요.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Weekly Log
          </CardTitle>
          <CardDescription className="text-center">
            주간 작업일지 관리 시스템
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 탭 전환 */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                setIsLogin(true)
                setError("")
              }}
            >
              로그인
            </Button>
            <Button
              type="button"
              variant={!isLogin ? "default" : "outline"}
              className="flex-1"
              onClick={() => {
                setIsLogin(false)
                setError("")
              }}
            >
              회원가입
            </Button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                이메일
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
                required
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "로그인 중..." : "가입 중..."}
                </>
              ) : (
                isLogin ? "로그인" : "회원가입"
              )}
            </Button>
          </form>

          {/* 안내 문구 */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? (
              <p>
                계정이 없으신가요?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:underline"
                >
                  회원가입
                </button>
              </p>
            ) : (
              <p>
                이미 계정이 있으신가요?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 hover:underline"
                >
                  로그인
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
