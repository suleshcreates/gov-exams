import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MessageCircle, Send, CheckCircle, User, AtSign, Loader2, Lock, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || 'https://gov-exams-1.onrender.com';

const subjects = [
    "Payment Issue",
    "Exam Access Problem",
    "Technical Bug",
    "Account Issue",
    "Content Request",
    "Feedback / Suggestion",
    "Other"
];

const ContactFormSection = () => {
    const { toast } = useToast();
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.subject || !form.message) {
            toast({ title: "Missing Info", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }
        try {
            setSubmitting(true);
            const res = await fetch(`${API_URL}/api/public/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                setSubmitted(true);
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                toast({ title: "Message Sent! ✨", description: "We'll get back to you within 24 hours." });
            } else {
                const data = await res.json();
                toast({ title: "Error", description: data.error || "Failed to send message", variant: "destructive" });
            }
        } catch {
            toast({ title: "Network Error", description: "Please check your connection.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact-form" className="py-24 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
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
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-primary">Contact Us</span>
                    </motion.div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
                        Get in <span className="gradient-text-accent">Touch</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have questions or facing an issue? We're here to help you succeed.
                    </p>
                </motion.div>

                {/* Split Layout */}
                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">

                    {/* LEFT — Info Panel (Navy) */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2 relative p-8 sm:p-10 flex flex-col justify-between"
                        style={{ background: 'linear-gradient(135deg, hsl(210 74% 10%) 0%, hsl(210 74% 16%) 100%)' }}
                    >
                        {/* Geometric dot pattern */}
                        <div className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
                                backgroundSize: '24px 24px'
                            }}
                        />

                        <div className="relative z-10">
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
                                Get in{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #FF9933 0%, #FF8800 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                    Touch
                                </span>
                            </h3>
                            <p className="text-white/60 text-sm leading-relaxed mb-10">
                                Our team of dedicated educators is here to help you navigate your path to success.
                            </p>

                            {/* Contact Cards */}
                            <div className="space-y-4">
                                {/* Email */}
                                <motion.a
                                    href="mailto:kirkanbalasaheb4@gmail.com"
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                                    style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #FF9933 0%, #FF8800 100%)' }}>
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.1em] text-white/40 font-bold mb-0.5">Email Support</p>
                                        <p className="text-white/90 text-sm font-medium">kirkanbalasaheb4@gmail.com</p>
                                    </div>
                                </motion.a>

                                {/* Phone */}
                                <motion.a
                                    href="tel:+918275437940"
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                                    style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #FF9933 0%, #FF8800 100%)' }}>
                                        <Phone className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] uppercase tracking-[0.1em] text-white/40 font-bold mb-0.5">Phone Line</p>
                                        <p className="text-white/90 text-sm font-medium">+91 82754 37940</p>
                                    </div>
                                </motion.a>

                            </div>
                        </div>

                        {/* Bottom trust badge */}
                        <div className="relative z-10 mt-10 flex items-center gap-2 text-white/30 text-xs">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Your data is secure with us</span>
                        </div>
                    </motion.div>

                    {/* RIGHT — Form Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="lg:col-span-3 bg-card p-8 sm:p-10"
                    >
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center justify-center py-16 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                        style={{ background: 'linear-gradient(135deg, hsl(115 90% 28%) 0%, hsl(115 80% 35%) 100%)' }}>
                                        <CheckCircle className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                                    <p className="text-muted-foreground mb-8 max-w-md">
                                        Thank you for reaching out. We'll respond to your email within 24 hours.
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSubmitted(false)}
                                        className="px-8 py-3 rounded-full font-bold text-sm text-white"
                                        style={{ background: 'linear-gradient(135deg, hsl(210 74% 16%) 0%, hsl(210 74% 25%) 100%)' }}
                                    >
                                        Send Another Message
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                >
                                    <h3 className="text-xl font-bold text-foreground mb-1">Send us a Message</h3>
                                    <p className="text-sm text-muted-foreground mb-8">Fill in the details below and we'll get back to you</p>

                                    <div className="space-y-5">
                                        {/* Name & Email */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em] mb-1.5 block">
                                                    Full Name <span className="text-destructive">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={form.name}
                                                        onChange={handleChange}
                                                        placeholder="Your full name"
                                                        className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em] mb-1.5 block">
                                                    Email Address <span className="text-destructive">*</span>
                                                </label>
                                                <div className="relative">
                                                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        placeholder="your@email.com"
                                                        className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phone & Subject */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em] mb-1.5 block">
                                                    Phone <span className="text-muted-foreground/40">(optional)</span>
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={form.phone}
                                                        onChange={handleChange}
                                                        placeholder="Your phone number"
                                                        className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em] mb-1.5 block">
                                                    Subject <span className="text-destructive">*</span>
                                                </label>
                                                <div className="relative">
                                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                                    <select
                                                        name="subject"
                                                        value={form.subject}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                                        required
                                                    >
                                                        <option value="">Select a topic</option>
                                                        {subjects.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.05em] mb-1.5 block">
                                                Message <span className="text-destructive">*</span>
                                            </label>
                                            <textarea
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                placeholder="Describe your issue or question in detail..."
                                                rows={5}
                                                className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                                required
                                            />
                                        </div>

                                        {/* Submit */}
                                        <motion.button
                                            type="submit"
                                            disabled={submitting}
                                            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(255, 153, 51, 0.3)' }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-3.5 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            style={{ background: 'linear-gradient(135deg, #FF9933 0%, #FF8800 100%)' }}
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    SUBMIT ENQUIRY
                                                </>
                                            )}
                                        </motion.button>

                                        <p className="text-[11px] text-muted-foreground/60 text-center flex items-center justify-center gap-1.5">
                                            <Lock className="w-3 h-3" />
                                            We value your privacy. Your data is secure with us.
                                        </p>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ContactFormSection;
