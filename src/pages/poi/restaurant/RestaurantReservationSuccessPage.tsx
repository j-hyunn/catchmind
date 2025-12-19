import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ReservationSuccessScreen, type SuccessSummary } from '@/components/poi/reservation/ReservationSuccessScreen'
import type { SerializedRestaurantReservationSelection } from '@/components/poi/reservation/RestaurantReserveBottomSheet'
import { poiService } from '@/services/poi/poiService'

type SuccessLocationState = {
  poiName?: string
  selection?: SerializedRestaurantReservationSelection
}

export function RestaurantReservationSuccessPage() {
  const { poiId } = useParams<{ poiId: string }>()
  const navigate = useNavigate()
  const locationState = (useLocation().state as SuccessLocationState | undefined) ?? {}
  const selection = locationState.selection
  const poiName = locationState.poiName
  const poi = useMemo(() => (poiId ? poiService.findPoiById(poiId) : undefined), [poiId])

  if (!selection || !poiName || !poi) {
    return (
      <section className="poi-detail poi-detail--empty">
        <div>예약 완료 정보를 표시할 수 없습니다.</div>
        <button type="button" onClick={() => navigate('/')}>
          홈으로 이동
        </button>
      </section>
    )
  }

  const visitDate = new Date(selection.date)
  const dateText = `${visitDate.getMonth() + 1}월 ${visitDate.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][visitDate.getDay()]})`
  const timeText = selection.sessionLabel ?? ''
  const peopleText = `${selection.people} · ${selection.tableType === 'hall' ? '홀' : '룸'}`

  const summary: SuccessSummary = {
    title: poiName,
    dateText,
    timeText,
    peopleText,
  }

  return (
    <ReservationSuccessScreen
      summary={summary}
      basePoi={{
        id: poi.id,
        category: 'restaurant',
        lat: Number(poi.lat ?? 0),
        lng: Number(poi.lng ?? 0),
      }}
      onClose={() => navigate(poiId ? `/poi/${poiId}` : '/')}
      onSelectRecommendation={id => navigate(`/poi/${id}`)}
      onViewAll={category => navigate('/', { state: { filterCategory: category } })}
      onViewReservationDetail={() => navigate(`/poi/${poiId}/reservation/confirm`, { replace: true, state: { selection, poiName } })}
    />
  )
}
