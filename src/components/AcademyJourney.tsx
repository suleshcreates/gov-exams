import { ScrollTimeline, TimelineEvent } from "./lightswind/scroll-timeline";
import { GraduationCap, Users, Award, Rocket, BookOpen, Trophy } from "lucide-react";

const journeyEvents: TimelineEvent[] = [
  {
    year: "2020",
    title: "Foundation",
    subtitle: "The Beginning",
    description: "GovExams was founded with a vision to provide quality education and comprehensive exam preparation for government exam aspirants across India.",
    icon: <Rocket className="h-4 w-4 mr-2 text-primary" />,
    color: "primary",
    image: "/hero-bg1.jpg",
  },
  {
    year: "2021",
    title: "First Batch Success",
    subtitle: "100+ Students",
    description: "Our first batch of students achieved remarkable results with 95% pass rate. We expanded our course offerings and introduced bilingual support.",
    icon: <Users className="h-4 w-4 mr-2 text-primary" />,
    color: "primary",
    image: "/hero-bg2.jpg",
  },
  {
    year: "2022",
    title: "Digital Transformation",
    subtitle: "Online Platform Launch",
    description: "Launched our comprehensive online exam portal with proctored exams, instant results, and detailed analytics to help students track their progress.",
    icon: <BookOpen className="h-4 w-4 mr-2 text-primary" />,
    color: "primary",
    image: "/hero-bg3.jpg",
  },
  {
    year: "2023",
    title: "Recognition & Growth",
    subtitle: "500+ Success Stories",
    description: "Received recognition for excellence in government exam education. Our YouTube channel crossed 10K subscribers, and we built a strong community of learners.",
    icon: <Award className="h-4 w-4 mr-2 text-primary" />,
    color: "primary",
    image: "/hero-bg4.jpg",
  },
  {
    year: "2024",
    title: "Excellence Continues",
    subtitle: "Leading government exam Preparation",
    description: "Today, GovExams stands as a trusted name in exam preparation with thousands of successful students, comprehensive study materials, and a supportive community.",
    icon: <Trophy className="h-4 w-4 mr-2 text-primary" />,
    color: "primary",
    image: "/hero-bg1.jpg",
  },
];

export const AcademyJourney = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <ScrollTimeline
          events={journeyEvents}
          title="Our Journey"
          subtitle="From humble beginnings to becoming a trusted name in government exam education"
          animationOrder="staggered"
          cardAlignment="alternating"
          progressIndicator={true}
          cardVariant="elevated"
          cardEffect="glow"
          revealAnimation="slide"
          parallaxIntensity={0.1}
          progressLineWidth={3}
          progressLineCap="round"
          dateFormat="badge"
          connectorStyle="line"
          perspective={false}
          smoothScroll={true}
        />
      </div>
    </section>
  );
};

export default AcademyJourney;
