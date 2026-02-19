"use client"

import { useEffect, useState } from "react"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import type { Libraries } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, MapPin, Star, MessageSquare, Plus, Loader2, Trash2 } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import {
    getVisitReviews,
    createVisitReview,
    deleteVisitReview,
    VisitReviewRow
} from "@/lib/api/visit-review"

// Review 인터페이스를 VisitReviewRow와 일치시킴
type Review = VisitReviewRow

const mapContainerStyle = {
    width: "100%",
    height: "100%",
}

const seoulCenter = {
    lat: 37.5665, // 서울특별시청
    lng: 126.9780,
}

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
}

const mapLibraries: Libraries = ["places"]

export function VisitReview() {
    const { user } = useAuth()
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
    const [mapCenter, setMapCenter] = useState(seoulCenter)

    // 모달 및 폼 상태
    const [showAddModal, setShowAddModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newReview, setNewReview] = useState<Partial<Review>>({
        place_name: "",
        address: "",
        lat: seoulCenter.lat,
        lng: seoulCenter.lng,
        rating: 5,
        content: "",
        visited_date: new Date().toISOString().split('T')[0]
    })

    const [searchQuery, setSearchQuery] = useState("")

    // 모달 열 때 현재 지도 중심값을 좌표 초기값으로 설정
    useEffect(() => {
        if (showAddModal) {
            setNewReview(prev => ({
                ...prev,
                lat: mapCenter.lat,
                lng: mapCenter.lng
            }))
        }
    }, [showAddModal, mapCenter])

    // 데이터 로드
    useEffect(() => {
        if (user) {
            loadReviews()
        }
    }, [user])

    const loadReviews = async () => {
        if (!user) return
        setIsLoading(true)
        try {
            const data = await getVisitReviews(user.id)
            setReviews(data)
        } catch (error) {
            console.error('리뷰 로드 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddReview = async () => {
        if (!user) return
        if (!newReview.place_name) {
            alert("장소 이름을 입력해주세요.")
            return
        }

        setIsSubmitting(true)
        try {
            const review = await createVisitReview({
                user_id: user.id,
                place_name: newReview.place_name || "",
                address: newReview.address || "",
                lat: newReview.lat ?? mapCenter.lat,
                lng: newReview.lng ?? mapCenter.lng,
                rating: newReview.rating || 5,
                content: newReview.content || "",
                visited_date: newReview.visited_date || new Date().toISOString().split('T')[0],
            })

            setReviews([review, ...reviews])
            setShowAddModal(false)
            setNewReview({
                place_name: "",
                address: "",
                lat: mapCenter.lat,
                lng: mapCenter.lng,
                rating: 5,
                content: "",
                visited_date: new Date().toISOString().split('T')[0]
            })
        } catch (error) {
            console.error('리뷰 저장 실패:', error)
            alert('저장에 실패했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('정말 삭제하시겠습니까?')) return

        try {
            await deleteVisitReview(id)
            const updatedReviews = reviews.filter(r => r.id !== id)
            setReviews(updatedReviews)
            if (selectedReview?.id === id) setSelectedReview(null)
        } catch (error) {
            console.error('리뷰 삭제 실패:', error)
            alert('삭제에 실패했습니다.')
        }
    }

    const handleGeocode = (address: string) => {
        if (!address || !window.google) return

        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
                const location = results[0].geometry.location
                const lat = location.lat()
                const lng = location.lng()

                setNewReview(prev => ({
                    ...prev,
                    lat,
                    lng
                }))
                setMapCenter({ lat, lng })
            } else {
                alert("상세 주소를 찾으 수 없습니다. 직접 좌표를 입력하거나 지도를 이동해보세요.")
            }
        })
    }

    // 검색 필터링
    const filteredReviews = reviews.filter(review =>
        review.place_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (review.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )

    return (
        <div className="flex gap-4 h-[700px]">
            {/* 좌측: 리뷰 목록 섹션 */}
            <div className="w-80 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        내 방문 리뷰
                    </h2>
                    <Button size="sm" onClick={() => setShowAddModal(true)} className="rounded-full h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="장소 또는 리뷰 검색"
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <div className="text-sm">로딩 중...</div>
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center text-gray-400 py-20 text-sm">
                            {searchQuery ? "검색 결과가 없습니다." : "방문한 장소에 대한 리뷰를 남겨보세요."}
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div
                                key={review.id}
                                onClick={() => {
                                    setSelectedReview(review)
                                    if (review.lat && review.lng) {
                                        setMapCenter({ lat: review.lat, lng: review.lng })
                                    }
                                }}
                                className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${selectedReview?.id === review.id
                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                    : "bg-white border-gray-100 hover:border-gray-200"
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-900 truncate flex-1">{review.place_name}</h3>
                                    <div className="flex items-center gap-0.5 ml-2">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-semibold">{review.rating}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span className="truncate">{review.address}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{review.content}</p>
                                <div className="flex justify-between items-center">
                                    <div className="text-[10px] text-gray-400">{review.visited_date}</div>
                                    <button
                                        onClick={(e) => handleDelete(review.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 우측: 지도 섹션 */}
            <div className="flex-1 flex flex-col gap-4 relative">
                <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 relative">
                    <LoadScript
                        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
                        libraries={mapLibraries}
                    >
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={mapCenter}
                            zoom={13}
                            options={mapOptions}
                            onLoad={(map) => setMapInstance(map)}
                        >
                            {filteredReviews.map((review) => (
                                review.lat && review.lng && (
                                    <Marker
                                        key={review.id}
                                        position={{ lat: review.lat, lng: review.lng }}
                                        onClick={() => {
                                            setSelectedReview(review)
                                            setMapCenter({ lat: review.lat!, lng: review.lng! })
                                        }}
                                        title={review.place_name}
                                    />
                                )
                            ))}
                        </GoogleMap>
                    </LoadScript>
                </div>

                {selectedReview && (
                    <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-white shadow-xl flex gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedReview.place_name}</h2>
                                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-sm font-bold">
                                    <Star className="h-3.5 w-3.5 fill-yellow-600" />
                                    {selectedReview.rating}
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-4 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {selectedReview.address}
                            </p>
                            <div className="flex items-start gap-2 bg-gray-50 p-4 rounded-xl">
                                <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                <p className="text-gray-700 leading-relaxed">{selectedReview.content}</p>
                            </div>
                        </div>
                        <div className="w-32 flex flex-col justify-end items-end gap-2">
                            <div className="text-sm font-medium text-gray-400">방문일</div>
                            <div className="text-lg font-bold text-gray-600">{selectedReview.visited_date}</div>
                            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setSelectedReview(null)}>
                                닫기
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* 리뷰 추가 모달 */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold">새 방문 리뷰 작성</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="place_name">장소 이름</Label>
                                <Input
                                    id="place_name"
                                    value={newReview.place_name ?? ""}
                                    onChange={(e) => setNewReview({ ...newReview, place_name: e.target.value })}
                                    placeholder="예: 서울특별시청, 남산타워"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">주소</Label>
                                <Input
                                    id="address"
                                    value={newReview.address ?? ""}
                                    onChange={(e) => setNewReview({ ...newReview, address: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleGeocode(newReview.address ?? "")
                                        }
                                    }}
                                    placeholder="서울특별시 ... (입력 후 엔터)"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lat">위도 (Latitude)</Label>
                                    <Input
                                        id="lat"
                                        type="number"
                                        step="any"
                                        value={newReview.lat ?? ""}
                                        onChange={(e) => setNewReview({ ...newReview, lat: parseFloat(e.target.value) })}
                                        placeholder="37.5665"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lng">경도 (Longitude)</Label>
                                    <Input
                                        id="lng"
                                        type="number"
                                        step="any"
                                        value={newReview.lng ?? ""}
                                        onChange={(e) => setNewReview({ ...newReview, lng: parseFloat(e.target.value) })}
                                        placeholder="126.9780"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="visited_date">방문 일자</Label>
                                    <Input
                                        id="visited_date"
                                        type="date"
                                        value={newReview.visited_date ?? ""}
                                        onChange={(e) => setNewReview({ ...newReview, visited_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rating">평점 (1-5)</Label>
                                    <Input
                                        id="rating"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={newReview.rating ?? 5}
                                        onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">리뷰 내용</Label>
                                <Textarea
                                    id="content"
                                    value={newReview.content ?? ""}
                                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                                    placeholder="방문 소감을 남겨주세요."
                                    className="min-h-[60px]"
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <Button
                                onClick={handleAddReview}
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    '추가하기'
                                )}
                            </Button>
                            <Button
                                onClick={() => setShowAddModal(false)}
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                취소
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
