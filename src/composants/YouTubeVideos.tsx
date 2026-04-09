import { useState } from 'react';
import { useYouTubeSearch, YouTubeVideo } from '@/hooks/useYouTubeSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Play, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeVideosProps {
  searchQuery: string;
}

const YouTubeVideos = ({ searchQuery }: YouTubeVideosProps) => {
  const { data: videos, isLoading } = useYouTubeSearch(searchQuery);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Recherche de vidéos YouTube...</span>
      </div>
    );
  }

  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Youtube className="w-5 h-5 text-red-500" />
        <h3 className="font-semibold text-sm">Vidéos recommandées</h3>
      </div>

      {/* Active video player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-border mb-3">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveVideo(null)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {videos.map((video) => (
          <motion.button
            key={video.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveVideo(video.id)}
            className={`flex gap-3 p-2 rounded-lg text-left transition-colors ${
              activeVideo === video.id
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-secondary/50 border border-border hover:bg-secondary'
            }`}
          >
            <div className="relative flex-shrink-0 w-28 h-20 rounded-md overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium line-clamp-2 text-foreground"
                dangerouslySetInnerHTML={{ __html: video.title }}
              />
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                {video.channelTitle}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default YouTubeVideos;
