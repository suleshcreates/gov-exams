import { motion } from "framer-motion";
import { MessageCircle, Users, Zap, BookOpen, TrendingUp } from "lucide-react";

interface WhatsAppSectionProps {
  communityUrl: string;
  memberCount?: string;
  communityName?: string;
}

export const WhatsAppSection = ({
  communityUrl,
  memberCount = "500+",
  communityName = "DMLT Academy Community",
}: WhatsAppSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-500/5 via-background to-green-600/5 relative overflow-hidden">
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
          {/* WhatsApp Icon Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 mb-6"
          >
            <MessageCircle className="w-6 h-6 text-green-500" />
            <span className="text-sm font-bold text-green-500">Join Our WhatsApp Community</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            Connect with <span className="text-green-500">Fellow Students</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our active WhatsApp community for instant updates, study materials, doubt clearing, and peer support
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Community Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 border-2 border-green-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Active Community</h3>
                    <p className="text-sm text-muted-foreground">{memberCount} members and growing</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Instant Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new exams, study materials, and important announcements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <BookOpen className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Study Materials</h4>
                    <p className="text-sm text-muted-foreground">
                      Access exclusive notes, PDFs, and resources shared by experts
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Peer Learning</h4>
                    <p className="text-sm text-muted-foreground">
                      Discuss topics, clear doubts, and learn from fellow DMLT students
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-8 border-2 border-green-500/30 relative overflow-hidden"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{communityName}</h3>
                  <p className="text-muted-foreground">
                    Be part of our growing community of DMLT aspirants
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.a
                    href={communityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block w-full px-6 py-4 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-center transition-colors shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Join Community Now
                    </div>
                  </motion.a>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Free to join • No spam • Active moderation
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{memberCount}</div>
                    <div className="text-xs text-muted-foreground">Active Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">24/7</div>
                    <div className="text-xs text-muted-foreground">Support Available</div>
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

export default WhatsAppSection;
