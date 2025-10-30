import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Link } from '@linkvault/shared';
import { ExternalLink, Link2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface Props {
  link: Link;
}

export default function PublicLinkCard({ link }: Props) {
  const formattedDate = formatDistanceToNow(new Date(link.createdAt), { addSuffix: true });

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ y: 0, scale: 1, boxShadow: '0 0 #0000' }}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22, mass: 0.6 }}
    >
      <Card className="bg-muted/20 rounded-3xl transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg truncate flex items-center gap-2">
            <Link2 className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{link.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-2">
          <div className="flex items-center gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-600 truncate flex-1"
            >
              {link.url}
            </a>
            <button
              onClick={handleOpenLink}
              className="p-1 hover:bg-accent rounded"
              aria-label="Open link in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-muted-foreground">{formattedDate}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


