import { supabase } from '@/lib/db/supabase'
import { Database } from '@/types/database.types'

export type VisitReviewRow = Database['public']['Tables']['visit_reviews']['Row']
export type VisitReviewInsert = Database['public']['Tables']['visit_reviews']['Insert']
export type VisitReviewUpdate = Database['public']['Tables']['visit_reviews']['Update']

/**
 * 방문 리뷰 목록 조회
 */
export async function getVisitReviews(userId: string) {
    const { data, error } = await supabase
        .from('visit_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('visited_date', { ascending: false })

    if (error) throw error
    return data
}

/**
 * 방문 리뷰 상세 조회
 */
export async function getVisitReview(id: string) {
    const { data, error } = await supabase
        .from('visit_reviews')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

/**
 * 방문 리뷰 생성
 */
export async function createVisitReview(review: VisitReviewInsert) {
    const { data, error } = await supabase
        .from('visit_reviews')
        .insert(review)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * 방문 리뷰 수정
 */
export async function updateVisitReview(id: string, review: VisitReviewUpdate) {
    const { data, error } = await supabase
        .from('visit_reviews')
        .update({
            ...review,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * 방문 리뷰 삭제
 */
export async function deleteVisitReview(id: string) {
    const { error } = await supabase
        .from('visit_reviews')
        .delete()
        .eq('id', id)

    if (error) throw error
}
