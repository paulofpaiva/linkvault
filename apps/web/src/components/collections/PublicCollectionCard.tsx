import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Folder } from 'lucide-react'
import { motion } from 'framer-motion'

interface PublicCollection {
  id: string
  title: string
  color?: string | null
  linkCount: number
}

interface Props {
  collection: PublicCollection
  onClick?: (id: string) => void
}

export default function PublicCollectionCard({ collection, onClick }: Props) {
  return (
    <motion.div
      onClick={() => onClick?.(collection.id)}
      initial={{ y: 0, scale: 1, boxShadow: '0 0 #0000' }}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
    >
      <Card className="bg-muted/20 rounded-3xl cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="mt-0.5">
              <Folder className="h-6 w-6" style={{ color: collection.color || undefined }} />
            </div>
            <CardTitle className="text-lg flex-1 min-w-0 truncate">{collection.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 pt-2">
          <div className="text-xs text-muted-foreground">{collection.linkCount} {collection.linkCount === 1 ? 'link' : 'links'}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}


