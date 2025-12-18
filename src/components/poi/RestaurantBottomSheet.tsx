import { Bookmark } from 'lucide-react'

import './RestaurantBottomSheet.css'

interface RestaurantBottomSheetProps {
  onBookmark: () => void
  onPrimaryAction: () => void
}

export function RestaurantBottomSheet({ onBookmark, onPrimaryAction }: RestaurantBottomSheetProps) {
  return (
    <section className="restaurant-bottom-sheet" aria-label="바텀 시트">
      <div className="restaurant-bottom-sheet__actions">
        <button
          type="button"
          className="restaurant-bottom-sheet__bookmark"
          aria-label="저장"
          onClick={onBookmark}
        >
          <Bookmark size={18} />
        </button>
        <button type="button" className="restaurant-bottom-sheet__cta" onClick={onPrimaryAction}>
          예약하기
        </button>
      </div>
    </section>
  )
}
