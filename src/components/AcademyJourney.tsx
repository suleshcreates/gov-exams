import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Activity, Zap, Award, Target, BookOpen } from "lucide-react";

export const AcademyJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const beamHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const milestones = [
    {
      year: "2020",
      title: "Inception",
      subtitle: "The Spark",
      description: "Started with a single vision: to democratize quality education. We planted the seed of knowledge in a small classroom.",
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      align: "left"
    },
    {
      year: "2021",
      title: "First Breakthrough",
      subtitle: "100+ Selections",
      description: "Our methodology proved itself. The first batch of students cracked the toughest state exams with flying colors.",
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      align: "right"
    },
    {
      year: "2022",
      title: "Digital Evolution",
      subtitle: "Going Online",
      description: "Launched the GovExams portal. Advanced analytics and AI-driven insights became available to every student.",
      icon: <Target className="w-5 h-5 text-emerald-500" />,
      align: "left"
    },
    {
      year: "2023",
      title: "State Recognition",
      subtitle: "Award for Excellence",
      description: "Honored as the 'Most Promising EdTech' in the region. Our community grew to 50,000+ active learners.",
      icon: <Award className="w-5 h-5 text-purple-500" />,
      align: "right"
    },
    {
      year: "2024",
      title: "The Future",
      subtitle: "National Expansion",
      description: "Setting new standards with 'Special Exams'. We are now shaping the future of government service aspirants across India.",
      icon: <BookOpen className="w-5 h-5 text-rose-500" />,
      align: "left"
    }
  ];

  return (
    <div className="relative bg-white py-24 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div ref={containerRef} className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Growth Story</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              From humble beginnings to a revolution in exam preparation.
            </p>
          </motion.div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Central Beam Track (Inactive) */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 rounded-full md:-translate-x-1/2" />

          {/* Active Pulse Beam */}
          <motion.div
            style={{ height: beamHeight }}
            className="absolute left-4 md:left-1/2 top-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 rounded-full md:-translate-x-1/2 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-0 origin-top"
          >
            {/* Moving Pulse Effect inside the beam */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>

          {/* Milestones */}
          <div className="space-y-12 md:space-y-24 pb-12">
            {milestones.map((item, index) => (
              <MilestoneCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MilestoneCard = ({ item, index }: { item: any; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-20% 0px -20% 0px", once: true }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className={`relative flex items-center md:items-start flex-col md:flex-row gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}
    >
      {/* The Dot on the timeline */}
      <div className="absolute left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 md:-translate-x-1/2 -translate-x-1/2 z-10">
        <div className="w-8 h-8 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-lg group">
          <div className="w-3 h-3 rounded-full bg-amber-500 group-hover:scale-125 transition-transform duration-300" />
        </div>
      </div>

      {/* Content Card Side */}
      <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:pr-16 text-left md:text-right' : 'md:pl-16 text-left'}`}>
        <div className="md:hidden pl-2 pb-2"> {/* Spacer for mobile alignment */} </div>

        <div className={`relative group p-6 md:p-8 rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:border-amber-200
                     ${isEven ? 'mr-auto' : 'ml-auto'}`}
        >
          {/* Year Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4 border border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-700 group-hover:border-amber-100 transition-colors
                        ${isEven ? 'md:flex-row-reverse' : ''}`}
          >
            {item.icon}
            <span>{item.year}</span>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{item.title}</h3>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">{item.subtitle}</h4>

          <p className="text-slate-600 leading-relaxed font-medium">
            {item.description}
          </p>
        </div>
      </div>

      {/* Empty side for layout balance */}
      <div className="w-full md:w-1/2 hidden md:block" />
    </motion.div>
  );
};

export default AcademyJourney;
