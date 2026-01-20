import { motion } from "framer-motion";
import { Star, Quote, User } from "lucide-react";

const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        role: "DMLT Student",
        image: null, // Placeholder for valid image if available, else fallback to icon
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
    }
];

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-8 rounded-2xl relative group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-2 border-transparent hover:border-primary/20"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                                <Quote className="w-10 h-10 text-primary" />
                            </div>

                            {/* Rating */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-muted-foreground mb-8 relative z-10 leading-relaxed">
                                "{testimonial.content}"
                            </p>

                            {/* Author Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/20">
                                    {testimonial.image ? (
                                        <img src={testimonial.image} alt={testimonial.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                                    <p className="text-xs text-primary font-medium">{testimonial.exam}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
