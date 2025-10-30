import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className='flex flex-wrap gap-2 mt-3'>
      <button
        type='button'
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        className={`group relative rounded-md border p-2 text-left transition-all w-28 md:w-32 ${theme === 'light' ? 'ring-2 ring-primary border-primary' : 'hover:border-foreground/30'}`}
      >
        <div className='flex items-center gap-2 mb-1'>
          <div className='flex gap-1'>
            <span className='h-2 w-2 rounded-full bg-red-400' />
            <span className='h-2 w-2 rounded-full bg-yellow-400' />
            <span className='h-2 w-2 rounded-full bg-green-400' />
          </div>
          <span className='text-[10px] text-muted-foreground'>Light</span>
        </div>
        <div className='rounded-sm border bg-white h-12 overflow-hidden'>
          <div className='h-3 bg-gray-100' />
          <div className='h-full bg-white' />
        </div>
      </button>

      <button
        type='button'
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`group relative rounded-md border p-2 text-left transition-all w-28 md:w-32 ${theme === 'dark' ? 'ring-2 ring-primary border-primary' : 'hover:border-foreground/30'}`}
      >
        <div className='flex items-center gap-2 mb-1'>
          <div className='flex gap-1'>
            <span className='h-2 w-2 rounded-full bg-red-500' />
            <span className='h-2 w-2 rounded-full bg-yellow-500' />
            <span className='h-2 w-2 rounded-full bg-green-500' />
          </div>
          <span className='text-[10px] text-muted-foreground'>Dark</span>
        </div>
        <div className='rounded-sm border bg-zinc-900 h-12 overflow-hidden'>
          <div className='h-3 bg-zinc-800' />
          <div className='h-full bg-zinc-900' />
        </div>
      </button>
    </div>
  )
}


