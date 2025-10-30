import { useTheme } from '@/contexts/ThemeContext'
import { AVAILABLE_THEMES } from '@/themes'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className='flex flex-wrap gap-2 mt-3'>
      {AVAILABLE_THEMES.map(t => (
        <button
          key={t.name}
          type='button'
          onClick={() => setTheme(t.name)}
          aria-pressed={theme === t.name}
          className={`group relative rounded-md border p-2 text-left transition-all w-28 md:w-32 ${theme === t.name ? 'ring-2 ring-primary border-primary' : 'hover:border-foreground/30'}`}
        >
          <div className='flex items-center gap-2 mb-1'>
            <div className='flex gap-1'>
              <span className={`h-2 w-2 rounded-full ${t.swatches[0]}`} />
              <span className={`h-2 w-2 rounded-full ${t.swatches[1]}`} />
              <span className={`h-2 w-2 rounded-full ${t.swatches[2]}`} />
            </div>
            <span className='text-[10px] text-muted-foreground'>{t.label}</span>
          </div>
          <div className={`rounded-sm border h-12 overflow-hidden ${t.bgPreview}`}>
            <div className='h-3 bg-black/10 dark:bg-white/10' />
            <div className='h-full bg-white/80 dark:bg-black/80' />
          </div>
        </button>
      ))}
    </div>
  )
}


