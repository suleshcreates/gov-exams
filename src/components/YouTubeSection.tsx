import { motion } from "framer-motion";
import { Youtube, Play, Bell, Users, Video, ExternalLink, Sparkles } from "lucide-react";

interface YouTubeSectionProps {
  channelUrl: string;
  channelName?: string;
  subscriberCount?: string;
  videoCount?: string;
  featuredVideoId?: string;
}

export const YouTubeSection = ({
  channelUrl,
  channelName = "GovExams",
  subscriberCount = "10K+",
  videoCount = "100+",
  featuredVideoId,
}: YouTubeSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-red-500/5 via-background to-red-600/5 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-red-500/20"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{
              y: [null, '-20%', null],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut'
            }}
          />
        ))}
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
            <span className="text-sm font-bold text-red-500">Free Video Tutorials</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            Learn with <span className="text-red-500">{channelName}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Subscribe to our YouTube channel for free tutorials, exam tips, and comprehensive preparation content
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">

            {/* Featured Video - Large Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 md:row-span-2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-full min-h-[300px] md:min-h-[400px] bg-gradient-to-br from-gray-900 to-gray-800 group">
                {featuredVideoId ? (
                  <iframe
                    className="w-full h-full absolute inset-0"
                    src={`https://www.youtube.com/embed/${featuredVideoId}?rel=0`}
                    title="Featured Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-red-700/30" />
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative z-10 w-24 h-24 rounded-full bg-red-500 flex items-center justify-center cursor-pointer shadow-2xl shadow-red-500/50"
                    >
                      <Play className="w-12 h-12 text-white fill-white ml-2" />
                    </motion.div>
                  </div>
                )}
                {/* Overlay Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">Featured Tutorial</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subscriber Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-6 flex flex-col justify-center border-2 border-red-500/20 hover:border-red-500/40 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{subscriberCount}</div>
                  <div className="text-sm text-muted-foreground">Subscribers</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Join our growing community of exam aspirants</p>
            </motion.div>

            {/* Video Count Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-6 flex flex-col justify-center border-2 border-red-500/20 hover:border-red-500/40 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-7 h-7 text-red-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{videoCount}</div>
                  <div className="text-sm text-muted-foreground">Videos</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Quality tutorials on every topic</p>
            </motion.div>

            {/* CTA Card - Full Width on Bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-3"
            >
              <div className="glass-card rounded-3xl p-6 md:p-8 border-2 border-red-500/30 bg-gradient-to-r from-red-500/10 to-red-600/5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">Ready to start learning?</h3>
                    <p className="text-muted-foreground">Subscribe now and never miss a new tutorial!</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.a
                      href={channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-center transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                    >
                      <Youtube className="w-5 h-5" />
                      Subscribe Now
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                    <motion.a
                      href={channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 rounded-full glass-card hover:bg-white/10 font-semibold text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Bell className="w-5 h-5" />
                      Turn On Notifications
                    </motion.a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
