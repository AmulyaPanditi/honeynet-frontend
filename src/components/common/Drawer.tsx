import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[width]

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div
          className={cn(
            'w-screen bg-soc-surface border-l border-soc-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out',
            widthClass
          )}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-soc-border/80 flex items-center justify-between bg-soc-card/50">
            <div>
              <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-soc-cyan animate-pulse" />
                {title}
              </h2>
              {subtitle && <p className="text-xs text-soc-muted mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-soc-muted hover:text-white hover:bg-soc-border/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
