interface CollectionInfoProps {
  title: string
  linkCount: number
  color?: string
  className?: string
}

export default function CollectionInfo({ title, linkCount, color, className = '' }: CollectionInfoProps) {
  return (
    <div className={`w-full rounded-md border bg-muted/30 p-3 text-left flex items-center gap-3 ${className}`}>
      <div className="mt-0.5">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: color || 'currentColor' }}>
          <path d="M3 7h5l2 3h11v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v3" />
        </svg>
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{linkCount} {linkCount === 1 ? 'link' : 'links'}</div>
      </div>
    </div>
  )
}


