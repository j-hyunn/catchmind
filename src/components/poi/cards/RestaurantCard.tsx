import { Bookmark, CircleDollarSign, Clock4 } from 'lucide-react'
import type { KeyboardEvent } from 'react'

import './RestaurantCard.css'

export type ReservationStatus = 'open' | 'closed'

export interface ReservationDate {
  label: string
  status: ReservationStatus
}

interface RestaurantCardProps {
  name: string
  rating: number | string
  reviewCount: number
  categoryLabel: string
  location: string
  distanceLabel?: string
  images?: string[]
  onSave?: () => void
  dates?: ReservationDate[]
  onSelectDate?: (date: ReservationDate) => void
  openHours?: string
  priceLabel?: string
  onSelect?: () => void
}

export function RestaurantCard({
  name,
  rating,
  reviewCount,
  categoryLabel,
  location,
  distanceLabel,
  images = [],
  onSave,
  dates = [],
  onSelectDate,
  openHours,
  priceLabel,
  onSelect,
}: RestaurantCardProps) {
  const formattedRating = typeof rating === 'number' ? rating.toFixed(1) : rating
  const hoursLabel = openHours ? `영업 중 · ${openHours}` : '운영 정보 준비 중'
  const costLabel = priceLabel ?? '가격 정보 없음'

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onSelect) {
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <article className="restaurant-card" role={onSelect ? 'button' : undefined} tabIndex={onSelect ? 0 : undefined} onClick={onSelect} onKeyDown={handleKeyDown}>
      <div className="restaurant-card__header">
        <p className="restaurant-card__title">{name}</p>
        <button
          type="button"
          className="restaurant-card__save"
          onClick={event => {
            event.stopPropagation()
            onSave?.()
          }}
          aria-label="저장"
        >
          <Bookmark size={18} />
        </button>
      </div>

      <p className="restaurant-card__meta">
        <span className="restaurant-card__meta-rating">⭐ {formattedRating}</span>
        <span className="restaurant-card__meta-reviews">({reviewCount})</span> · {categoryLabel} ·{' '}
        {distanceLabel ?? location}
      </p>

      <div className="restaurant-card__images">
        {[0, 1].map(index => (
          <div key={`${name}-image-${index}`} className="restaurant-card__image-box">
            {images[index] ? (
              <img src={images[index]!} alt={`${name} 이미지 ${index + 1}`} className="restaurant-card__image" />
            ) : (
              <div className="restaurant-card__placeholder" />
            )}
          </div>
        ))}
      </div>

      <div className="restaurant-card__info">
        <div className="restaurant-card__info-row">
          <Clock4 size={16} aria-hidden />
          <span>{hoursLabel}</span>
        </div>
        <div className="restaurant-card__info-row">
          <CircleDollarSign size={16} aria-hidden />
          <span>{costLabel}</span>
        </div>
      </div>

      {dates.length > 0 && (
        <div className="restaurant-card__date-row">
          {dates.map(date => {
            const isClosed = date.status === 'closed'
            return (
              <button
                key={date.label}
                type="button"
                disabled={isClosed}
                className={`restaurant-card__date-chip ${
                  isClosed ? 'restaurant-card__date-chip--closed' : 'restaurant-card__date-chip--open'
                }`}
                onClick={event => {
                  event.stopPropagation()
                  if (!isClosed) {
                    onSelectDate?.(date)
                  }
                }}
              >
                <span className="restaurant-card__date-label">{date.label}</span>
                <span
                  className={`restaurant-card__date-status ${
                    isClosed ? '' : 'restaurant-card__date-status--available'
                  }`}
                >
                  {isClosed ? '예약 마감' : '예약 가능'}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </article>
  )
}
