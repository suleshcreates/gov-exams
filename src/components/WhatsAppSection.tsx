import { motion } from "framer-motion";
import { MessageCircle, Users, Zap, BookOpen, Bell, ExternalLink, Sparkles, Send } from "lucide-react";

interface WhatsAppSectionProps {
  communityUrl: string;
  memberCount?: string;
  communityName?: string;
}

export const WhatsAppSection = ({
  communityUrl,
  memberCount = "5K+",
  communityName = "GovExams Community",
}: WhatsAppSectionProps) => {
  return (
    <section className="py-20 bg-gradient-to-br from-green-500/5 via-background to-emerald-600/5 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 20 + 10,
              height: Math.random() * 20 + 10,
              background: `rgba(34, 197, 94, ${Math.random() * 0.2 + 0.05})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
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
          {/* WhatsApp Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-green-500/10 backdrop-blur-sm border border-green-500/20 mb-6"
          >
            <Sparkles className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold text-green-500">Join Our Community</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            Connect on <span className="text-green-500">WhatsApp</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant updates, study materials, and connect with fellow aspirants
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center">

            {/* Left: Phone Mockup with Chat Animation */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative flex justify-center"
            >
              {/* Phone Frame */}
              <div className="relative w-72 sm:w-80">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full transform scale-75" />

                {/* Phone */}
                <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl border border-gray-700">
                  {/* Screen */}
                  <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-green-600 px-6 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{communityName}</div>
                        <div className="text-green-200 text-xs">{memberCount} participants</div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="bg-[#0b141a] p-4 space-y-3 min-h-[280px]">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                          <p className="text-white text-sm">New study material uploaded! 📚</p>
                          <span className="text-xs text-gray-400">9:30 AM</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex justify-end"
                      >
                        <div className="bg-green-700 rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                          <p className="text-white text-sm">Thanks! This is so helpful 🙏</p>
                          <span className="text-xs text-green-200">9:31 AM ✓✓</span>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                          <p className="text-white text-sm">Daily quiz starting in 10 mins! 🎯</p>
                          <span className="text-xs text-gray-400">9:32 AM</span>
                        </div>
                      </motion.div>

                      {/* Typing Indicator */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-800 rounded-full px-4 py-2">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-gray-400 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Input Bar */}
                    <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2">
                      <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2">
                        <span className="text-gray-400 text-sm">Type a message</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Features and CTA */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Feature Cards */}
              <div className="grid gap-4">
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="glass-card rounded-2xl p-5 border-l-4 border-green-500 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Instant Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new exams, job alerts, and important dates
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="glass-card rounded-2xl p-5 border-l-4 border-green-500 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Free Study Materials</h4>
                    <p className="text-sm text-muted-foreground">
                      Daily notes, PDFs, and practice questions shared by experts
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="glass-card rounded-2xl p-5 border-l-4 border-green-500 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Doubt Solving</h4>
                    <p className="text-sm text-muted-foreground">
                      Ask questions and get answers from peers and mentors
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Button */}
              <motion.a
                href={communityUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(34, 197, 94, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="block w-full p-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">Join WhatsApp Group</span>
                  <ExternalLink className="w-5 h-5" />
                </div>
                <p className="text-sm text-green-100 mt-2">
                  Free • No spam • Active community
                </p>
              </motion.a>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="glass-card rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-500">{memberCount}</div>
                  <div className="text-xs text-muted-foreground">Members</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-500">24/7</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-500">100+</div>
                  <div className="text-xs text-muted-foreground">Daily Posts</div>
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
