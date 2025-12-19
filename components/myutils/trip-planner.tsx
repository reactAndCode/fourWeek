"use client"

import { useState } from "react"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Edit, Copy, Trash2, MapPin } from "lucide-react"

interface Trip {
  id: string
  name: string
  startDate: string
  endDate: string
}

interface Place {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  startTime: string
  endTime: string
  memo: string
}

// Google Maps 설정
const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const gangnamCenter = {
  lat: 37.4979, // 강남구 중심
  lng: 127.0276,
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

export function TripPlanner() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // 지도 중심 좌표
  const [mapCenter, setMapCenter] = useState(gangnamCenter)

  // 모달 상태
  const [showTripModal, setShowTripModal] = useState(false)
  const [showPlaceModal, setShowPlaceModal] = useState(false)

  // 새 여행 폼
  const [newTrip, setNewTrip] = useState({
    name: "",
    startDate: "",
    endDate: "",
  })

  // 새 장소 폼
  const [newPlace, setNewPlace] = useState({
    name: "",
    address: "",
    lat: 37.4979,  // 강남구 중심
    lng: 127.0276,
    startTime: "",
    endTime: "",
    memo: "",
  })

  const handleAddTrip = () => {
    if (!newTrip.name || !newTrip.startDate || !newTrip.endDate) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    const trip: Trip = {
      id: Date.now().toString(),
      name: newTrip.name,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
    }

    setTrips([...trips, trip])
    setNewTrip({ name: "", startDate: "", endDate: "" })
    setShowTripModal(false)
  }

  const handleAddPlace = () => {
    if (!newPlace.name) {
      alert("장소 이름을 입력해주세요.")
      return
    }

    const place: Place = {
      id: Date.now().toString(),
      ...newPlace,
    }

    setPlaces([...places, place])
    setSelectedPlace(place)
    setNewPlace({
      name: "",
      address: "",
      lat: 37.4979,
      lng: 127.0276,
      startTime: "",
      endTime: "",
      memo: "",
    })
    setShowPlaceModal(false)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-200px)]">
      {/* 좌측: 여행 계획 섹션 */}
      <div className="w-64 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">여행 계획 마다</h2>
          <button
            onClick={() => setShowTripModal(true)}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {trips.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">
              여행 계획을 추가해보세요
            </div>
          ) : (
            trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTrip?.id === trip.id
                    ? "bg-blue-50 border-blue-200 border"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-sm">{trip.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {trip.startDate} ~ {trip.endDate}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 중앙: 지도 섹션 */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="장소 검색"
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowPlaceModal(true)}>
            <MapPin className="h-4 w-4 mr-2" />
            장소 추가
          </Button>
        </div>

        {/* 지도 영역 */}
        <div className="flex-1 bg-gray-100 rounded-lg relative overflow-hidden">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={15}
              options={mapOptions}
            >
              {/* 장소 마커 표시 */}
              {places.map((place, index) => (
                <Marker
                  key={place.id}
                  position={{ lat: place.lat, lng: place.lng }}
                  label={{
                    text: `${index + 1}`,
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  onClick={() => setSelectedPlace(place)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>

      {/* 우측: 상세 정보 섹션 */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">장소 상세</h2>
        </div>

        {selectedTrip ? (
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">
                Day 1: {selectedTrip.startDate}
              </div>
              <div className="font-medium mb-3">{selectedTrip.name}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  편집
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Copy className="h-3 w-3 mr-1" />
                  복제
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Trash2 className="h-3 w-3 mr-1" />
                  삭제
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">경로</h3>
                <button
                  onClick={() => setShowPlaceModal(true)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {places.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-sm">
                  장소가 없어서 잘리이요
                </div>
              ) : (
                <div className="space-y-2">
                  {places.map((place, index) => (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-3 rounded-lg cursor-pointer border ${
                        selectedPlace?.id === place.id
                          ? "bg-blue-50 border-blue-200"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {place.name}
                          </div>
                          {place.address && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {place.address}
                            </div>
                          )}
                          {(place.startTime || place.endTime) && (
                            <div className="text-xs text-gray-400 mt-1">
                              {place.startTime} ~ {place.endTime}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            여행을 선택해주세요
          </div>
        )}
      </div>

      {/* 여행 추가 모달 */}
      {showTripModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">새 여행 추가</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tripName">여행명</Label>
                <Input
                  id="tripName"
                  value={newTrip.name}
                  onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                  placeholder="내 당일치기 여행"
                />
              </div>
              <div>
                <Label htmlFor="startDate">출발일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">도착일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddTrip} className="flex-1">
                추가
              </Button>
              <Button
                onClick={() => {
                  setShowTripModal(false)
                  setNewTrip({ name: "", startDate: "", endDate: "" })
                }}
                variant="outline"
                className="flex-1"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 장소 추가 모달 */}
      {showPlaceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">새 장소 추가</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="lat">경도</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={newPlace.lat}
                    onChange={(e) => setNewPlace({ ...newPlace, lat: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="lng">위도</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={newPlace.lng}
                    onChange={(e) => setNewPlace({ ...newPlace, lng: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="placeName">장소 이름</Label>
                <Input
                  id="placeName"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  placeholder="강남역"
                />
              </div>
              <div>
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  value={newPlace.address}
                  onChange={(e) => setNewPlace({ ...newPlace, address: e.target.value })}
                  placeholder="서울특별시 강남구..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newPlace.startTime}
                    onChange={(e) => setNewPlace({ ...newPlace, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newPlace.endTime}
                    onChange={(e) => setNewPlace({ ...newPlace, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="memo">메모</Label>
                <Textarea
                  id="memo"
                  value={newPlace.memo}
                  onChange={(e) => setNewPlace({ ...newPlace, memo: e.target.value })}
                  placeholder="메모를 입력하세요"
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddPlace} className="flex-1">
                추가
              </Button>
              <Button
                onClick={() => {
                  setShowPlaceModal(false)
                  setNewPlace({
                    name: "",
                    address: "",
                    lat: 37.4979,
                    lng: 127.0276,
                    startTime: "",
                    endTime: "",
                    memo: "",
                  })
                }}
                variant="outline"
                className="flex-1"
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
