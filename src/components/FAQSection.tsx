import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles, MessageCircle } from "lucide-react";
import { useState } from "react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
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
        answer: "We offer a 7-day money-back guarantee if you're not satisfied with our platform. Contact our support team at support@govexams.info for assistance with refunds or any other concerns."
    },
    {
        question: "How are the rankings calculated?",
        answer: "Your global rank is calculated based on your average score across all exams taken. The ranking system updates automatically after each exam completion, showing you where you stand among all students on the platform."
    },
    {
        question: "Do I need to install any software?",
        answer: "No installation required! GovExams is a web-based platform. Simply visit our website, create an account, and start practicing. All you need is a web browser and internet connection."
    }
];

const AccordionItem = ({
    item,
    index,
    isOpen,
    onClick
}: {
    item: FAQItem;
    index: number;
    isOpen: boolean;
    onClick: () => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group"
        >
            <div
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isOpen
                        ? "bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 shadow-xl shadow-primary/10"
                        : "bg-card/50 hover:bg-card/80"
                    }`}
            >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    }`}>
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-border"
                        style={{
                            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                            padding: '2px'
                        }}
                    />
                </div>

                {/* Question Header */}
                <button
                    onClick={onClick}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 relative z-10"
                >
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ rotate: isOpen ? 360 : 0 }}
                            transition={{ duration: 0.3 }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen
                                    ? "bg-gradient-to-br from-primary to-purple-600 text-white"
                                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                }`}
                        >
                            <span className="font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                        </motion.div>
                        <span className={`text-left font-semibold transition-colors ${isOpen ? "text-foreground" : "text-foreground/80 group-hover:text-foreground"
                            }`}>
                            {item.question}
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isOpen
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                            }`}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </button>

                {/* Answer Content */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="px-6 pb-6 pl-20">
                                <div className="bg-background/50 rounded-xl p-4 border border-border/50">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

                {/* Floating Icons */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-primary/10"
                        style={{
                            left: `${10 + (i * 15)}%`,
                            top: `${20 + (i % 3) * 30}%`,
                        }}
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.5,
                        }}
                    >
                        <HelpCircle className="w-8 h-8" />
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm border border-primary/20 mb-6"
                    >
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-primary">Got Questions?</span>
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                        Frequently Asked <span className="gradient-text">Questions</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Find answers to common questions about our platform, exams, and pricing
                    </p>
                </motion.div>

                {/* FAQ Grid - Two Columns on Desktop */}
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {faqData.slice(0, 4).map((item, index) => (
                            <AccordionItem
                                key={index}
                                item={item}
                                index={index}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            />
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {faqData.slice(4).map((item, index) => (
                            <AccordionItem
                                key={index + 4}
                                item={item}
                                index={index + 4}
                                isOpen={openIndex === index + 4}
                                onClick={() => setOpenIndex(openIndex === index + 4 ? null : index + 4)}
                            />
                        ))}
                    </div>
                </div>

                {/* Contact Support CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16"
                >
                    <div className="max-w-2xl mx-auto text-center p-8 rounded-3xl bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/5 border border-primary/10">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-xl shadow-primary/30">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                        <p className="text-muted-foreground mb-6">
                            Our team is here to help! Get instant support via WhatsApp.
                        </p>
                        <a
                            href="https://wa.me/918275437940?text=Hello!%20I%20have%20a%20question%20about%20GovExams"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(var(--primary), 0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg"
                            >
                                Contact on WhatsApp
                            </motion.button>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
