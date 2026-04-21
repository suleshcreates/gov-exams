import { motion, AnimatePresence } from "framer-motion";
import ExamCard from "@/components/ExamCard";
import { GraduationCap, Sparkles, Trophy, Clock, Shield, Crown, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ExamCardSkeleton } from "@/components/skeletons/ExamCardSkeleton";
import { PlanCardSkeleton } from "@/components/skeletons/PlanCardSkeleton";
import { adminService } from "@/admin/lib/adminService";
import YouTubeSection from "@/components/YouTubeSection";
import WhatsAppSection from "@/components/WhatsAppSection";
import AcademyJourney from "@/components/AcademyJourney";
import logger from "@/lib/logger";

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  validity_days: number | null;
  subjects: string[];
  is_active: boolean;
  display_order: number;
  badge: string | null;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

const Home = () => {
  const { auth } = useAuth();
  const [examsLoading, setExamsLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>([]);

  // Load subjects from database
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setExamsLoading(true);
        const subjectsData = await adminService.getSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        logger.error("Error loading subjects:", error);
      } finally {
        setExamsLoading(false);
      }
    };

    loadSubjects();
  }, []);

  // Load plan templates from database
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        const plans = await adminService.getPlanTemplates(false); // Only active plans
        setPlanTemplates(plans);
      } catch (error) {
        logger.error("Error loading plans:", error);
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

  const scrollToExams = () => {
    document.getElementById('exams-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5"
        style={{
          backgroundImage: 'url(/final-hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-primary">Next Generation Examination Platform</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 leading-tight px-4"
            >
              Ace Your Exams with{" "}
              <span className="gradient-text">DMLT Academy</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto px-4"
            >
              Choose from 5 subjects, 5 question sets each. Professional DMLT-focused MCQ exams with bilingual support, instant results, and comprehensive analytics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-6 justify-center mb-16"
            >
              <button
                onClick={scrollToExams}
                className="group px-8 py-4 rounded-full gradient-primary text-white font-bold text-lg hover:scale-105 transition-transform neon-glow"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6" />
                  Start Learning
                </div>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4"
            >
              <div className="text-center">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-foreground">5</div>
                <div className="text-sm text-muted-foreground">Subjects</div>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-foreground">25</div>
                <div className="text-sm text-muted-foreground">Question Sets</div>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-foreground">20</div>
                <div className="text-sm text-muted-foreground">MCQs per Set</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Academy Journey Timeline */}
      <AcademyJourney />

      {/* Available Subjects */}
      <section id="exams-section" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
              Available <span className="gradient-text">Subjects</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your subject and choose from 5 different question sets. Each set contains 20 carefully curated MCQs.
            </p>
          </motion.div>
          {!auth.isAuthenticated ? (
            <div className="w-full flex flex-col items-center justify-center py-16">
              <p className="text-lg mb-6">Login to view available exam sets.</p>
              <a href="/login">
                <button className="px-8 py-4 rounded-full gradient-primary text-white font-bold text-lg hover:scale-105 transition-transform neon-glow">
                  Login to View Exams
                </button>
              </a>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {examsLoading ? (
                <motion.div
                  key="exams-skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4"
                >
                  {[...Array(5)].map((_, i) => (
                    <ExamCardSkeleton key={i} />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="exams-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4"
                >
                  {subjects.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 text-lg">No subjects available. Please add subjects from the admin panel.</p>
                    </div>
                  ) : (
                    subjects.map((subject, index) => (
                      <ExamCard
                        key={subject.id}
                        exam={{
                          id: subject.id,
                          title: subject.name,
                          description: subject.description || 'Subject exam',
                          duration: 60,
                          totalQuestions: 100,
                          difficulty: 'medium' as const,
                          topics: [],
                          passingScore: 85
                        }}
                        index={index}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* YouTube Section */}
      <YouTubeSection
        channelUrl="https://youtube.com/@dmltacademy"
        channelName="DMLT Academy"
        subscriberCount="10K+"
        videoCount="100+"
        featuredVideoId="Ifo1IPNy3YY"
      />

      {/* WhatsApp Community Section */}
      <WhatsAppSection
        communityUrl="https://chat.whatsapp.com/BjTBURbfavl6LQdSMikNze"
        communityName="DMLT Academy Community"
        memberCount="500+"
      />

      {/* Plans Section */}
      <section id="plans-section" className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-foreground">
              Choose Your <span className="gradient-text">Learning Plan</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Get access to multiple subjects with our affordable plans. Master Plan offers the best value with 31% discount!
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {plansLoading ? (
              <motion.div
                key="plans-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 mb-8"
              >
                {[...Array(3)].map((_, i) => (
                  <PlanCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="plans-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4 mb-8"
              >
                {planTemplates.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-muted-foreground">No plans available at the moment.</p>
                  </div>
                ) : (
                  planTemplates.slice(0, 3).map((plan, index) => {
                    const subjects = Array.isArray(plan.subjects) ? plan.subjects : JSON.parse(plan.subjects || '[]');

                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className={`glass-card rounded-2xl p-6 sm:p-8 border-2 relative ${plan.badge === 'POPULAR'
                          ? "border-primary shadow-xl scale-105 md:scale-105"
                          : plan.badge === 'BEST VALUE'
                            ? "border-primary/50 shadow-lg"
                            : "border-border"
                          }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                            <span className={`px-4 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${plan.badge === 'BEST VALUE' ? 'gradient-primary' : 'bg-primary'
                              }`}>
                              {plan.badge === 'BEST VALUE' && <Crown className="w-3 h-3 fill-current" />}
                              {plan.badge === 'POPULAR' && <Star className="w-3 h-3 fill-current" />}
                              {plan.badge}
                            </span>
                          </div>
                        )}

                        <div className="text-center mb-6">
                          <h3 className="text-xl sm:text-2xl font-bold mb-2 gradient-text">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {plan.description}
                          </p>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-3xl sm:text-4xl font-bold gradient-text">
                              ₹{plan.price}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {plan.validity_days ? `${plan.validity_days} days access` : 'Lifetime access'}
                          </p>
                        </div>

                        <ul className="space-y-2 mb-6">
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">✓</span>
                            {subjects.length} Subject{subjects.length !== 1 ? 's' : ''} Included
                          </li>
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">✓</span>
                            All Question Sets
                          </li>
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">✓</span>
                            Bilingual Support
                          </li>
                          <li className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">✓</span>
                            Instant Results & Analytics
                          </li>
                        </ul>

                        <Link to="/plans">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.badge === 'BEST VALUE' || plan.badge === 'POPULAR'
                              ? "gradient-primary text-white hover:opacity-90"
                              : "bg-card border-2 border-border hover:border-primary"
                              }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              View Plan
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </motion.button>
                        </Link>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link to="/plans">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full glass-card hover:bg-white/10 font-semibold text-lg"
              >
                View All Plans & Details
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Statistics & Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary">Our Achievements</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
              Platform <span className="gradient-text">Statistics</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful DMLT students who have trusted our platform for their exam preparation
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-8 text-center hover:neon-border transition-all group"
            >
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Active Students</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-8 text-center hover:neon-border transition-all group"
            >
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Exams Completed</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-8 text-center hover:neon-border transition-all group"
            >
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">92%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-2xl p-8 text-center hover:neon-border transition-all group"
            >
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold gradient-text mb-2">25</div>
              <div className="text-sm text-muted-foreground">Question Sets</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary">Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our platform, exams, and pricing
            </p>
          </motion.div>

          {/* FAQ Accordion */}
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How many subjects and question sets are available?",
                answer: "We offer 5 comprehensive subjects, each with 5 different question sets. Every question set contains 20 carefully curated MCQs, giving you a total of 500 practice questions across all subjects."
              },
              {
                question: "What is the exam format and duration?",
                answer: "Each exam set contains 20 multiple-choice questions with a time limit that varies by subject. The platform offers bilingual support (English and Marathi), instant results, and detailed performance analytics after each exam."
              },
              {
                question: "How does the pricing work?",
                answer: "We offer flexible plans including individual subject access and bundled packages. Our Master Plan provides access to all subjects with a 31% discount. All plans include lifetime access to question sets, bilingual support, and comprehensive analytics."
              },
              {
                question: "Can I access the platform on mobile devices?",
                answer: "Yes! Our platform is fully responsive and works seamlessly on all devices - smartphones, tablets, and desktop computers. You can practice anytime, anywhere with a stable internet connection."
              },
              {
                question: "What happens if I fail an exam?",
                answer: "Don't worry! You can retake any exam multiple times. Each attempt helps you learn and improve. Our analytics show your progress over time, helping you identify areas that need more focus."
              },
              {
                question: "Is there a refund policy?",
                answer: "We offer a 7-day money-back guarantee if you're not satisfied with our platform. Contact our support team at dmltadamany23@gmail.com for assistance with refunds or any other concerns."
              },
              {
                question: "How are the rankings calculated?",
                answer: "Your global rank is calculated based on your average score across all exams taken. The ranking system updates automatically after each exam completion, showing you where you stand among all students on the platform."
              },
              {
                question: "Do I need to install any software?",
                answer: "No installation required! DMLT Academy is a web-based platform. Simply visit our website, create an account, and start practicing. All you need is a web browser and internet connection."
              }
            ].map((faq, index) => (
              <motion.details
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-card rounded-xl overflow-hidden group"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-foreground hover:text-primary transition-colors flex items-center justify-between">
                  <span className="pr-4">{faq.question}</span>
                  <ArrowRight className="w-5 h-5 text-primary group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-6 pb-4 text-muted-foreground">
                  <p>{faq.answer}</p>
                </div>
              </motion.details>
            ))}
          </div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">
              Still have questions? We're here to help!
            </p>
            <a
              href="https://wa.me/919834100959?text=Hello!%20I%20have%20a%20question%20about%20DMLT%20Academy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-full gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Contact on WhatsApp
              </motion.button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
