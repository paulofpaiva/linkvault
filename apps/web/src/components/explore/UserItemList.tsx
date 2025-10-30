import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/text'
import { motion } from 'framer-motion'

interface Props {
  id: string
  name: string
  publicCollectionsCount?: number
  publicLinksCount?: number
  onClick?: (id: string) => void
}

export default function UserItemList({ id, name, publicCollectionsCount = 0, publicLinksCount = 0, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onClick?.(id)}
      className="w-full text-left px-4 py-3 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring flex items-center gap-4"
      initial={{ y: 0, scale: 1, boxShadow: '0 0 #0000' }}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {publicCollectionsCount} {publicCollectionsCount === 1 ? 'collection' : 'collections'} • {publicLinksCount} {publicLinksCount === 1 ? 'link' : 'links'}
        </div>
      </div>
    </motion.button>
  )
}


