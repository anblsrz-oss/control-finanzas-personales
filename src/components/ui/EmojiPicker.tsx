import { useTranslation } from 'react-i18next'
import emojiCategories from '../../data/emojiCategories.json'
import { Emoji } from './Emoji'

// Galería curada de emojis para categorías, agrupada por tema relevante a
// finanzas. El catálogo vive en src/data/emojiCategories.json y se renderiza
// como SVG de Twemoji (ver Emoji.tsx) en vez de depender de la fuente nativa
// del sistema. Para agregar emojis: editar el JSON y correr `npm run emoji:sync`.
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = emojiCategories

interface EmojiPickerProps {
  value?: string
  onChange: (emoji: string) => void
  label?: string
}

export function EmojiPicker({ value, onChange, label }: EmojiPickerProps) {
  const { t } = useTranslation()
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label} {value && <Emoji emoji={value} className="text-lg" />}
        </label>
      )}
      <div className="max-h-44 space-y-3 overflow-y-auto rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3">
        {EMOJI_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              {t(group.label)}
            </p>
            <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onChange(emoji)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors ${
                    value === emoji
                      ? 'bg-brand-100 dark:bg-brand-800/60 ring-2 ring-brand-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Emoji emoji={emoji} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
