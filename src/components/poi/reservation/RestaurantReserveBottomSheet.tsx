import { DoorOpen, Lamp } from 'lucide-react'
import { useMemo, useState } from 'react'

import './RestaurantReserveBottomSheet.css'

type SessionOption = {
  id: string
  label: string
  minutes: number
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const
const PEOPLE_OPTIONS = Array.from({ length: 9 }, (_, idx) => `${idx + 1}명`)
const SESSION_START_HOUR = 10
const SESSION_END_HOUR = 22
const SESSION_INTERVAL_MINUTES = 30

const isSameDate = (a: Date, b: Date) => a.toDateString() === b.toDateString()
type ReserveStep = 'datetime' | 'tableType'
export type TableType = 'hall' | 'room'

export type RestaurantReservationSelection = {
  date: Date
  people: string
  sessionId: string | null
  sessionLabel: string | null
  tableType: TableType
}

export type SerializedRestaurantReservationSelection = Omit<RestaurantReservationSelection, 'date'> & { date: string }

const formatSessionLabel = (minutesFromMidnight: number) => {
  const hours = Math.floor(minutesFromMidnight / 60)
  const minutes = minutesFromMidnight % 60
  const period = hours < 12 ? '오전' : '오후'
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${period} ${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const buildSessionOptions = (): SessionOption[] => {
  const slots: SessionOption[] = []
  let idCounter = 1
  for (
    let minute = SESSION_START_HOUR * 60;
    minute <= SESSION_END_HOUR * 60;
    minute += SESSION_INTERVAL_MINUTES, idCounter += 1
  ) {
    slots.push({
      id: `session-${idCounter}`,
      label: formatSessionLabel(minute),
      minutes: minute,
    })
  }
  return slots
}

interface RestaurantReserveBottomSheetProps {
  open: boolean
  onClose: () => void
  onSelectSession?: (sessionId: string) => void
  onProceed?: (payload: RestaurantReservationSelection) => void
}

export function RestaurantReserveBottomSheet({ open, onClose, onSelectSession, onProceed }: RestaurantReserveBottomSheetProps) {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedPeople, setSelectedPeople] = useState(PEOPLE_OPTIONS[0])
  const sessionOptions = useMemo(() => buildSessionOptions(), [])
  const [selectedSession, setSelectedSession] = useState<SessionOption['id'] | null>(null)
  const [step, setStep] = useState<ReserveStep>('datetime')
const [tableType, setTableType] = useState<TableType>('hall')

  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()

  if (!open) {
    return null
  }

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(year => year - 1)
      setViewMonth(11)
    } else {
      setViewMonth(month => month - 1)
    }
  }

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(year => year + 1)
      setViewMonth(0)
    } else {
      setViewMonth(month => month + 1)
    }
  }

  const handleSelectToday = () => {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(new Date(today))
  }

  const handleSelectDate = (day: number) => {
    const targetDate = new Date(viewYear, viewMonth, day)
    if (targetDate < today) return
    setSelectedDate(targetDate)
  }

  const handleSelectSession = (session: SessionOption) => {
    setSelectedSession(session.id)
    onSelectSession?.(session.id)
  }

  const handleNext = () => {
    if (step === 'datetime') {
      setStep('tableType')
      setTableType(current => current ?? 'hall')
      return
    }
    if (tableType) {
      const selectedSessionOption = sessionOptions.find(option => option.id === selectedSession)
      onProceed?.({
        date: selectedDate,
        people: selectedPeople,
        sessionId: selectedSession,
        sessionLabel: selectedSessionOption?.label ?? null,
        tableType,
      })
    }
  }

  const handleCancel = () => {
    if (step === 'tableType') {
      setStep('datetime')
      setTableType('hall')
      return
    }
    onClose()
  }

  const showDatetimeStep = step === 'datetime'
  const isNextDisabled = showDatetimeStep ? !selectedSession : !tableType

  return (
    <div className="reserve-overlay">
      <section className="reserve-bottom-sheet" aria-label="예약 선택 모달">
        <div className="reserve-sheet__bar" aria-hidden />
        {showDatetimeStep ? (
          <>
            <header className="reserve-sheet__calendar-header">
              <button type="button" onClick={handleSelectToday} className="reserve-sheet__today">
                오늘
              </button>
              <div className="reserve-sheet__calendar-month">
                <button type="button" onClick={goPrevMonth} aria-label="이전 달">
                  ‹
                </button>
                <span>
                  {viewYear}.{String(viewMonth + 1).padStart(2, '0')}
                </span>
                <button type="button" onClick={goNextMonth} aria-label="다음 달">
                  ›
                </button>
              </div>
              <div className="reserve-sheet__calendar-filter">
                전체 <span>⌄</span>
              </div>
            </header>

            <div className="reserve-sheet__calendar-grid">
              {DAY_LABELS.map(day => (
                <span key={day} className="reserve-sheet__day-label">
                  {day}
                </span>
              ))}
              {Array.from({ length: firstWeekday }).map((_, idx) => (
                <div key={`empty-${idx}`} className="reserve-sheet__date reserve-sheet__date--empty" aria-hidden="true" />
              ))}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const day = idx + 1
                const current = new Date(viewYear, viewMonth, day)
                const isSelected = isSameDate(selectedDate, current)
                const isToday = isSameDate(today, current)
                const isPast = current < today
                const dateClassNames = ['reserve-sheet__date']
                if (isSelected) {
                  dateClassNames.push('reserve-sheet__date--selected')
                }
                if (isToday) {
                  dateClassNames.push('reserve-sheet__date--today')
                }
                if (isPast) {
                  dateClassNames.push('reserve-sheet__date--disabled')
                }
                return (
                  <button
                    key={day}
                    type="button"
                    className={dateClassNames.join(' ')}
                    disabled={isPast}
                    onClick={() => handleSelectDate(day)}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            <div className="reserve-sheet__people-row">
              {PEOPLE_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  className={`reserve-sheet__people-chip ${selectedPeople === option ? 'reserve-sheet__people-chip--active' : ''}`}
                  onClick={() => setSelectedPeople(option)}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="reserve-sheet__session-row">
              {sessionOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  className={`reserve-sheet__session-chip ${selectedSession === option.id ? 'reserve-sheet__session-chip--active' : ''}`}
                  onClick={() => handleSelectSession(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="reserve-sheet__table-step">
            <div className="reserve-sheet__table-header">
              <h2>테이블 타입 선택</h2>
              <div className="reserve-sheet__progress">
                <span className="reserve-sheet__progress-bar" />
              </div>
            </div>
            <div className="reserve-sheet__table-options">
              <button
                type="button"
                className={`reserve-sheet__table-option ${tableType === 'hall' ? 'reserve-sheet__table-option--active' : ''}`}
                onClick={() => setTableType('hall')}
              >
                <Lamp size={32} strokeWidth={1.5} />
                <span>홀</span>
              </button>
              <button
                type="button"
                className={`reserve-sheet__table-option ${tableType === 'room' ? 'reserve-sheet__table-option--active' : ''}`}
                onClick={() => setTableType('room')}
              >
                <DoorOpen size={32} strokeWidth={1.5} />
                <span>룸</span>
              </button>
            </div>
          </div>
        )}

        <div className="reserve-sheet__actions">
          <button type="button" className="reserve-sheet__close" onClick={handleCancel}>
            {showDatetimeStep ? '닫기' : '이전'}
          </button>
          <button type="button" className="reserve-sheet__next" onClick={handleNext} disabled={isNextDisabled}>
            다음
          </button>
        </div>
      </section>
    </div>
  )
}
