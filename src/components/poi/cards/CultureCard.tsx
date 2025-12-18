import type { KeyboardEvent, MouseEvent } from 'react'

import { Bookmark, CircleDollarSign, Clock4 } from 'lucide-react'

import type { LifestylePoi } from '@/types/poi'
import { getMockRating, mapCategoryLabel } from '@/utils/poi'

import './CultureCard.css'

interface CultureCardProps {
  poi: LifestylePoi
  distanceLabel?: string
  onBookmark?: () => void
  onSelect?: (poi: LifestylePoi) => void
  onReserve?: (poi: LifestylePoi) => void
}

export function CultureCard({ poi, distanceLabel, onBookmark, onSelect, onReserve }: CultureCardProps) {
  const { rating, reviews } = getMockRating(poi)
  const audienceLabel = poi.type ?? mapCategoryLabel(poi.category)
  const periodLabel = poi.endDate ? `~ ${poi.endDate}` : '상시 진행'
  const timeLabel = poi.openHours || '시간 정보 없음'
  const primaryPrice = poi.sessions?.[0]?.price ?? 18000
  const youthPrice = Math.max(0, Math.round((primaryPrice * 0.7) / 100) * 100)
  const locationLabel = distanceLabel ?? poi.address
  const imageSrc = poi.images?.[0]

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onSelect) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(poi)
    }
  }

  const reserveHandler = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onReserve?.(poi)
  }

  return (
    <article
      className="culture-card"
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(poi)}
      onKeyDown={handleKeyDown}
    >
      <div className="culture-card__header">
        <p className="culture-card__title">{poi.name}</p>
        <button
          type="button"
          className="culture-card__save"
          onClick={event => {
            event.stopPropagation()
            onBookmark?.()
          }}
          aria-label="저장"
        >
          <Bookmark size={18} />
        </button>
      </div>

      <p className="culture-card__meta">
        <span className="culture-card__meta-rating">⭐ {rating}</span>
        <span className="culture-card__meta-reviews">({reviews})</span> · {audienceLabel} · {locationLabel}
      </p>

      <div className="culture-card__image-wrapper">
        {imageSrc ? <img src={imageSrc} alt={`${poi.name} 이미지`} /> : <div className="culture-card__placeholder" />}
      </div>

      <div className="culture-card__info">
        <p className="culture-card__info-row">
          <Clock4 size={16} aria-hidden />
          <span>
            {periodLabel} · {timeLabel}
          </span>
        </p>
        <p className="culture-card__info-row">
          <CircleDollarSign size={16} aria-hidden />
          <span>
            성인 {primaryPrice.toLocaleString()}원 · 어린이/청소년 {youthPrice.toLocaleString()}원
          </span>
        </p>
      </div>

      <button type="button" className="culture-card__reserve" onClick={reserveHandler}>
        예매하기
      </button>
    </article>
  )
}
