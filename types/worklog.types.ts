export interface Task {
  id: string
  description: string
  minutes: number
  tags: string[]
  category: 'design' | 'planning' | 'development' | 'analysis'
}

export interface WorkLog {
  id: string
  userId: string
  date: Date
  tasks: Task[]
  status: 'draft' | 'completed' | 'empty'
  totalMinutes: number
  createdAt: Date
  updatedAt: Date
}

export interface WeeklySummary {
  totalMinutes: number
  completedTasks: number
  progressRate: number
}
