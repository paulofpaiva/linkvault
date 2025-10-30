import { Link2 } from 'lucide-react'

interface LinkInfoProps {
  title: string
  url?: string
  className?: string
}

export default function LinkInfo({ title, url, className = '' }: LinkInfoProps) {
  return (
    <div className={`w-full rounded-md border bg-muted/30 p-3 text-left flex items-center gap-3 ${className}`}>
      <div className="mt-0.5">
        <Link2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        {url && (
          <div className="text-xs text-muted-foreground truncate">{url}</div>
        )}
      </div>
    </div>
  )
}


