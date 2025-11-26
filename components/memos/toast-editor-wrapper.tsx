"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ToastEditorProps {
  initialValue?: string
  onChange?: (value: string) => void
  height?: string
}

export function ToastEditor({ initialValue = '', onChange, height = '600px' }: ToastEditorProps) {
  const editorRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [EditorComponent, setEditorComponent] = useState<any>(null)

  useEffect(() => {
    // 클라이언트 사이드에서만 로드
    if (typeof window !== 'undefined') {
      Promise.all([
        import('@toast-ui/react-editor'),
        // @ts-ignore - CSS import
        import('@toast-ui/editor/dist/toastui-editor.css')
      ]).then(([editorModule]) => {
        setEditorComponent(() => editorModule.Editor)
        setIsLoaded(true)
      })
    }
  }, [])

  useEffect(() => {
    if (editorRef.current && isLoaded) {
      const editorInstance = editorRef.current.getInstance()
      editorInstance.setMarkdown(initialValue)
    }
  }, [initialValue, isLoaded])

  const handleChange = () => {
    if (editorRef.current && onChange) {
      const editorInstance = editorRef.current.getInstance()
      const markdown = editorInstance.getMarkdown()
      onChange(markdown)
    }
  }

  if (!isLoaded || !EditorComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <EditorComponent
      ref={editorRef}
      initialValue={initialValue}
      height={height}
      initialEditType="markdown"
      useCommandShortcut={true}
      onChange={handleChange}
      language="ko-KR"
      placeholder="메모를 작성하세요..."
    />
  )
}
