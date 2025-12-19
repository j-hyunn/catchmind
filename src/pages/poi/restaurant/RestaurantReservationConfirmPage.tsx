import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { RestaurantReservationSelection, SerializedRestaurantReservationSelection } from '@/components/poi/reservation/RestaurantReserveBottomSheet'
import { poiService } from '@/services/poi/poiService'

import './RestaurantReservationConfirmPage.css'

const PURPOSE_OPTIONS = ['데이트', '친목', '가족식사', '생일', '기념일', '여행', '비즈니스미팅', '소개팅', '기타']
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const TABLE_LABEL: Record<'hall' | 'room', string> = {
  hall: '홀',
  room: '룸',
}

type LocationState = {
  selection?: SerializedRestaurantReservationSelection
}

export function RestaurantReservationConfirmPage() {
  const { poiId } = useParams<{ poiId: string }>()
  const navigate = useNavigate()
  const locationState = (useLocation().state as LocationState | undefined) ?? {}
  const rawSelection = locationState.selection
  const selection: RestaurantReservationSelection | undefined = rawSelection
    ? {
        ...rawSelection,
        date: new Date(rawSelection.date),
      }
    : undefined
  const poi = useMemo(() => (poiId ? poiService.findPoiById(poiId) : undefined), [poiId])
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([])
  const [requestNote, setRequestNote] = useState('')
  const [agreeThirdParty, setAgreeThirdParty] = useState(false)

  if (!selection || !poi) {
    return (
      <section className="reservation-confirm-page reservation-confirm-page--empty">
        <div>예약 정보를 불러올 수 없습니다.</div>
        <button type="button" onClick={() => navigate(poiId ? `/poi/${poiId}` : '/')}>
          이전 페이지로 이동
        </button>
      </section>
    )
  }

  const visitDate = selection.date
  const summary = `${visitDate.getMonth() + 1}월 ${visitDate.getDate()}일 (${WEEKDAY_LABELS[visitDate.getDay()]}) · ${selection.sessionLabel ?? ''} · ${selection.people} · ${TABLE_LABEL[selection.tableType]}`

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes(previous => (previous.includes(purpose) ? previous.filter(item => item !== purpose) : [...previous, purpose]))
  }

  const handleSubmit = () => {
    if (!agreeThirdParty || !poiId) {
      return
    }
    const serializedSelection: SerializedRestaurantReservationSelection = {
      ...selection,
      date: selection.date.toISOString(),
    }
    navigate(`/poi/${poiId}/reservation/success`, {
      replace: true,
      state: {
        selection: serializedSelection,
        poiName: poi.name,
      },
    })
  }

  return (
    <section className="reservation-confirm-page">
      <header className="reservation-confirm-page__header">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전">
          ‹
        </button>
        <div className="reservation-confirm-page__title">{poi.name}</div>
        <span aria-hidden />
      </header>

      <main className="reservation-confirm-page__content">
        <section className="reservation-confirm-page__block">
          <div className="reservation-confirm-page__block-title">예약 정보</div>
          <div className="reservation-confirm-page__summary">{summary}</div>
          <button type="button" className="reservation-confirm-page__ghost-btn">
            다른 사람이 방문해요
          </button>
        </section>

        <section className="reservation-confirm-page__block">
          <div className="reservation-confirm-page__block-title reservation-confirm-page__block-title--row">
            방문 목적 <span>*복수 선택 가능</span>
          </div>
          <div className="reservation-confirm-page__chip-row">
            {PURPOSE_OPTIONS.map(option => (
              <button
                key={option}
                type="button"
                className={`reservation-purpose-chip ${selectedPurposes.includes(option) ? 'reservation-purpose-chip--active' : ''}`}
                onClick={() => togglePurpose(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="reservation-confirm-page__block">
          <div className="reservation-confirm-page__block-title">고객 요청 사항</div>
          <textarea
            className="reservation-confirm-page__textarea"
            placeholder="매장에 요청할 내용이 있다면 작성해주세요."
            value={requestNote}
            onChange={event => setRequestNote(event.target.value)}
            rows={4}
          />
        </section>

        <section className="reservation-confirm-page__block reservation-confirm-page__terms">
          <label className="reservation-confirm-page__terms-row">
            <input type="checkbox" checked={agreeThirdParty} onChange={event => setAgreeThirdParty(event.target.checked)} />
            <span>개인정보 제 3자 제공 동의</span>
            <span aria-hidden>›</span>
          </label>
        </section>
      </main>

      <footer className="reservation-confirm-page__footer">
        <div className="reservation-confirm-page__footer-summary">
          <span className="reservation-confirm-page__footer-label">예약 정보</span>
          <strong>{summary}</strong>
        </div>
        <button type="button" className="reservation-confirm-page__cta" onClick={handleSubmit} disabled={!agreeThirdParty}>
          예약하기
        </button>
      </footer>
    </section>
  )
}
