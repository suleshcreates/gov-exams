import { motion, AnimatePresence } from "framer-motion";
import { Quote, Sparkles, Target, Award, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";

const quotes = [
    {
        text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "Perseverance",
        icon: <Target className="w-6 h-6 text-primary" />,
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "Dreams",
        icon: <Sparkles className="w-6 h-6 text-accent" />,
    },
    {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela",
        category: "Education",
        icon: <BookOpen className="w-6 h-6 text-primary" />,
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        category: "Belief",
        icon: <Award className="w-6 h-6 text-accent" />,
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        category: "Persistence",
        icon: <Target className="w-6 h-6 text-primary" />,
    },
];

export const MotivationSection = () => {
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % quotes.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 border border-primary/20">
                        <Sparkles className="w-4 h-4" />
                        <span>Daily Inspiration</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                        Motivation for <span className="gradient-text">Success</span>
                    </h2>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <div className="glass-card rounded-3xl p-8 md:p-12 relative border border-white/20 shadow-xl backdrop-blur-xl">
                        {/* Quote Icon Background */}
                        <div className="absolute top-8 left-8 opacity-10">
                            <Quote className="w-24 h-24 text-primary" />
                        </div>

                        <div className="relative z-10 min-h-[200px] flex flex-col justify-center items-center text-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuote}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-center mb-4">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                                            {quotes[currentQuote].icon}
                                        </div>
                                    </div>

                                    <p className="text-2xl md:text-3xl font-medium leading-relaxed italic text-foreground/90">
                                        "{quotes[currentQuote].text}"
                                    </p>

                                    <div className="pt-4">
                                        <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-4" />
                                        <p className="font-bold text-lg gradient-text">
                                            {quotes[currentQuote].author}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {quotes[currentQuote].category}
                                        </p>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation Dots */}
                        <div className="flex justify-center gap-2 mt-8">
                            {quotes.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentQuote(index)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentQuote === index
                                            ? "w-8 bg-primary"
                                            : "bg-primary/20 hover:bg-primary/40"
                                        }`}
                                    aria-label={`Go to quote ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MotivationSection;
