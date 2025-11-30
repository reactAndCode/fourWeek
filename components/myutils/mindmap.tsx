"use client"

import { useCallback, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  type Connection,
  type Edge,
  type Node,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Download, Upload } from "lucide-react"

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    data: { label: "중심 주제" },
    position: { x: 250, y: 150 },
    style: {
      background: "#3b82f6",
      color: "#fff",
      border: "2px solid #2563eb",
      borderRadius: "8px",
      padding: "10px",
      fontSize: "14px",
      fontWeight: "bold",
    },
  },
]

const initialEdges: Edge[] = []

export function Mindmap() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeName, setNodeName] = useState("")
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // 새 노드 추가
  const addNode = () => {
    if (!nodeName.trim()) {
      alert("노드 이름을 입력해주세요.")
      return
    }

    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: "default",
      data: { label: nodeName },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 300,
      },
      style: {
        background: "#e0f2fe",
        color: "#0c4a6e",
        border: "2px solid #0ea5e9",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "13px",
      },
    }

    setNodes((nds) => [...nds, newNode])
    setNodeName("")
  }

  // 선택된 노드 삭제
  const deleteSelectedNode = () => {
    if (!selectedNode) {
      alert("삭제할 노드를 먼저 선택해주세요.")
      return
    }

    if (selectedNode.id === "1") {
      alert("중심 주제는 삭제할 수 없습니다.")
      return
    }

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
    setEdges((eds) =>
      eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      )
    )
    setSelectedNode(null)
  }

  // 마인드맵 저장 (JSON)
  const saveMindmap = () => {
    const mindmapData = {
      nodes,
      edges,
    }
    const dataStr = JSON.stringify(mindmapData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `mindmap-${new Date().getTime()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 마인드맵 불러오기 (JSON)
  const loadMindmap = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)
          if (data.nodes && data.edges) {
            setNodes(data.nodes)
            setEdges(data.edges)
          } else {
            alert("올바른 마인드맵 파일이 아닙니다.")
          }
        } catch (error) {
          alert("파일을 읽는 중 오류가 발생했습니다.")
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // 노드 선택 이벤트
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">마인드맵</h2>
        <div className="flex gap-2">
          <Button
            onClick={saveMindmap}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            저장
          </Button>
          <Button
            onClick={loadMindmap}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            불러오기
          </Button>
        </div>
      </div>

      {/* 노드 추가 컨트롤 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nodeName}
          onChange={(e) => setNodeName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addNode()}
          placeholder="새 노드 이름 입력..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={addNode} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          노드 추가
        </Button>
        <Button
          onClick={deleteSelectedNode}
          variant="outline"
          size="sm"
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={!selectedNode}
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </Button>
      </div>

      {/* 선택된 노드 정보 */}
      {selectedNode && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <span className="font-medium text-blue-900">선택된 노드:</span>{" "}
          <span className="text-blue-700">{selectedNode.data.label}</span>
        </div>
      )}

      {/* React Flow 캔버스 */}
      <div style={{ width: "100%", height: "500px" }} className="border border-gray-300 rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.id === "1") return "#2563eb"
              return "#0ea5e9"
            }}
            nodeColor={(n) => {
              if (n.id === "1") return "#3b82f6"
              return "#e0f2fe"
            }}
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* 사용 방법 안내 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <h3 className="font-semibold text-gray-800 mb-2">사용 방법</h3>
        <ul className="space-y-1 list-disc list-inside">
          <li>노드를 드래그하여 위치를 변경할 수 있습니다</li>
          <li>노드의 연결점을 드래그하여 다른 노드와 연결할 수 있습니다</li>
          <li>노드를 클릭하여 선택 후 삭제 버튼으로 제거할 수 있습니다</li>
          <li>마우스 휠로 확대/축소, 우클릭 드래그로 캔버스를 이동할 수 있습니다</li>
          <li>저장 버튼으로 JSON 파일로 내보내고, 불러오기로 다시 가져올 수 있습니다</li>
        </ul>
      </div>
    </div>
  )
}
