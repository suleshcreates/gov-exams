import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { TestimonialsColumn } from "./TestimonialsColumn";

const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        role: "DMLT Student",
        image: null,
        content: "GovExams was a game-changer for my DMLT preparation. The bilingual questions helped me understand complex concepts easily. Highly recommended!",
        rating: 5,
        exam: "DMLT 2023",
    },
    {
        id: 2,
        name: "Rahul Patil",
        role: "Govt. Exam Aspirant",
        image: null,
        content: "The analytics feature showed me exactly where I was lagging behind. I improved my weak areas and cleared my exam in the first attempt.",
        rating: 5,
        exam: "MPC 2024",
    },
    {
        id: 3,
        name: "Anjali Deshmukh",
        role: "Pharmacy Student",
        image: null,
        content: "The question sets are very similar to the actual exam pattern. Practicing here gave me the confidence I needed to score high.",
        rating: 4,
        exam: "Pharmacy Entrance",
    },
    {
        id: 4,
        name: "Suresh Reddy",
        role: "Banking Aspirant",
        image: null,
        content: "The variety of questions in the bank exams section is unmatched. It covered everything from reasoning to aptitude perfectly.",
        rating: 5,
        exam: "IBPS PO",
    },
    {
        id: 5,
        name: "Neha Gupta",
        role: "SSC Aspirant",
        image: null,
        content: "I loved the timed mock tests. They really helped me manage my time better during the actual exam day.",
        rating: 5,
        exam: "SSC CGL",
    },
    {
        id: 6,
        name: "Vikram Singh",
        role: "Railway Aspirant",
        image: null,
        content: "The special exams section is pure gold. It felt like I was sitting for the real paper. Great job team!",
        rating: 4,
        exam: "RRB NTPC",
    },
    {
        id: 7,
        name: "Sneha Kapoor",
        role: "MPSC Aspirant",
        image: null,
        content: "The quality of Marathi questions is excellent. Usually, translations are bad on other sites, but here they are perfect.",
        rating: 5,
        exam: "MPSC State",
    },
    {
        id: 8,
        name: "Amit Verma",
        role: "Police Bharti",
        image: null,
        content: "Simple interface, great questions. I practiced daily for 2 months and cleared my written test easily.",
        rating: 5,
        exam: "Police Constable",
    },
    {
        id: 9,
        name: "Pooja Mehta",
        role: "Nursing Officer",
        image: null,
        content: "The nursing specific questions were very detailed. Helped me a lot with the technical part of the exam.",
        rating: 5,
        exam: "AIIMS Nursing",
    }
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const TestimonialsSection = () => {
    return (
        <section className="py-20 bg-background relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6 border border-accent/20">
                        <Star className="w-4 h-4" />
                        <span>Student Success Stories</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                        Hear From Our <span className="gradient-text">Toppers</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        See how GovExams is helping students across Maharashtra achieve their dreams.
                    </p>
                </motion.div>

                {/* Marquee Columns */}
                <div className="flex justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[700px]">
                    <TestimonialsColumn testimonials={[...firstColumn, ...thirdColumn]} duration={25} />
                    <TestimonialsColumn testimonials={[...secondColumn, ...firstColumn]} className="hidden md:block" duration={35} />
                    <TestimonialsColumn testimonials={[...thirdColumn, ...secondColumn]} className="hidden lg:block" duration={28} />
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
