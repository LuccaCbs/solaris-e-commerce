import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

export type ActionItem = {
  label: string
  onClick: () => void
  danger?: boolean
  hidden?: boolean
}

type ActionsMenuProps = {
  items: ActionItem[]
}

const ActionsMenu = ({ items }: ActionsMenuProps) => {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const visibleItems = items.filter((item) => !item.hidden)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleToggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({ top: rect.bottom + 4, left: rect.right - 160 })
    }
    setOpen((prev) => !prev)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        aria-label="Acciones"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {open &&
        createPortal(
          <div
            className="fixed z-50 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1"
            style={{ top: position.top, left: position.left }}
          >
            {visibleItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  item.danger ? 'text-red-600' : 'text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}

export default ActionsMenu
