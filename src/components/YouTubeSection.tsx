import { motion } from "framer-motion";
import { Youtube, Play, Bell, Users, Video } from "lucide-react";

interface YouTubeSectionProps {
  channelUrl: string;
  channelName?: string;
  subscriberCount?: string;
  videoCount?: string;
  featuredVideoId?: string; // YouTube video ID
}

export const YouTubeSection = ({
  channelUrl,
  channelName = "DMLT Academy",
  subscriberCount = "10K+",
  videoCount = "100+",
  featuredVideoId,
}: YouTubeSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-red-500/5 via-background to-red-600/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* YouTube Icon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-red-500/10 backdrop-blur-sm border border-red-500/20 mb-6"
          >
            <Youtube className="w-6 h-6 text-red-500" />
            <span className="text-sm font-bold text-red-500">Join Our YouTube Community</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            Learn with <span className="text-red-500">DMLT Academy</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Subscribe to our YouTube channel for free tutorials, exam tips, and comprehensive DMLT preparation content
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center">
          {/* Video Player / Thumbnail */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            {featuredVideoId ? (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${featuredVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 bg-black/40" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative z-10 w-20 h-20 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-lg"
                >
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </motion.div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-xl mb-1">Latest Video</h3>
                  <p className="text-sm opacity-90">Click to watch on YouTube</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Channel Info & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <Users className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{subscriberCount}</div>
                <div className="text-sm text-muted-foreground">Subscribers</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <Video className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{videoCount}</div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <h3 className="font-bold text-xl mb-4">What You'll Get:</h3>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold">Free DMLT Tutorials</p>
                  <p className="text-sm text-muted-foreground">Comprehensive video lessons on all subjects</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold">Exam Tips & Tricks</p>
                  <p className="text-sm text-muted-foreground">Expert strategies to ace your exams</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold">Weekly Updates</p>
                  <p className="text-sm text-muted-foreground">New content every week</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Youtube className="w-5 h-5" />
                Subscribe Now
              </motion.a>
              <motion.a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-4 rounded-full glass-card hover:bg-white/10 font-semibold text-center transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Get Notified
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
