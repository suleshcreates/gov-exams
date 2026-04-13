import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle, User, AtSign, FileText, Loader2 } from "lucide-react";
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

const ContactUs = () => {
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
        } catch (err) {
            toast({ title: "Network Error", description: "Please check your connection and try again.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
            {/* Hero */}
            <div className="relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-orange-900/20" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative container mx-auto px-6 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                            <MessageCircle className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-white/80 uppercase tracking-[0.15em]">Support</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
                            Get in Touch
                        </h1>
                        <p className="text-lg text-slate-400 mt-4 max-w-lg mx-auto font-medium">
                            Have a question or facing an issue? We're here to help. Send us a message and we'll respond within 24 hours.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6 -mt-8 pb-20">
                <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">

                    {/* Contact Info Cards — Left Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-5"
                    >
                        {/* Email Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500 transition-colors">
                                    <Mail className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Email</h3>
                                    <a href="mailto:kirkanbalasaheb4@gmail.com" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                                        kirkanbalasaheb4@gmail.com
                                    </a>
                                    <p className="text-xs text-slate-400 mt-1">We respond within 24 hours</p>
                                </div>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-colors">
                                    <Phone className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Phone</h3>
                                    <a href="tel:+918275437940" className="text-sm text-slate-500 hover:text-green-600 transition-colors">
                                        +91 82754 37940
                                    </a>
                                    <p className="text-xs text-slate-400 mt-1">Mon–Sat, 9 AM – 6 PM IST</p>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors">
                                    <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">WhatsApp</h3>
                                    <a
                                        href="https://wa.me/918275437940?text=Hello!%20I%20need%20help%20with%20GovExams"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                                    >
                                        +91 82754 37940
                                    </a>
                                    <p className="text-xs text-slate-400 mt-1">Get instant support</p>
                                </div>
                            </div>
                        </div>

                        {/* Location Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-colors">
                                    <MapPin className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">Location</h3>
                                    <p className="text-sm text-slate-500">Nanded, Maharashtra, India</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Teaser */}
                        <div className="bg-slate-900 rounded-2xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-3">Common Questions</h3>
                            <div className="space-y-3 text-sm text-slate-300">
                                <div className="border-l-2 border-indigo-400 pl-3">
                                    <p className="font-semibold text-white text-xs mb-0.5">How to reset my password?</p>
                                    <p className="text-xs">Use "Forgot Password" on the login page.</p>
                                </div>
                                <div className="border-l-2 border-indigo-400 pl-3">
                                    <p className="font-semibold text-white text-xs mb-0.5">Payment methods?</p>
                                    <p className="text-xs">UPI, cards, net banking via Razorpay.</p>
                                </div>
                                <div className="border-l-2 border-indigo-400 pl-3">
                                    <p className="font-semibold text-white text-xs mb-0.5">Can I get a refund?</p>
                                    <p className="text-xs">Yes, 7-day money-back guarantee.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form — Right Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Send className="w-5 h-5" />
                                    Send us a Message
                                </h2>
                                <p className="text-indigo-200 text-sm mt-1">Fill in the form below and we'll get back to you</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="p-12 text-center"
                                    >
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                                        <p className="text-slate-500 mb-6">Thank you for reaching out. We'll respond to your email within 24 hours.</p>
                                        <button
                                            onClick={() => setSubmitted(false)}
                                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
                                        >
                                            Send Another Message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="p-8 space-y-5"
                                    >
                                        {/* Name & Email row */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                                    Full Name <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={form.name}
                                                        onChange={handleChange}
                                                        placeholder="Your name"
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                                    Email <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        placeholder="your@email.com"
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Phone & Subject row */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                                    Phone <span className="text-slate-300">(optional)</span>
                                                </label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={form.phone}
                                                        onChange={handleChange}
                                                        placeholder="Your phone number"
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                                    Subject <span className="text-red-400">*</span>
                                                </label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <select
                                                        name="subject"
                                                        value={form.subject}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all appearance-none bg-white"
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
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                                                Message <span className="text-red-400">*</span>
                                            </label>
                                            <textarea
                                                name="message"
                                                value={form.message}
                                                onChange={handleChange}
                                                placeholder="Describe your issue or question in detail..."
                                                rows={5}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all resize-none"
                                                required
                                            />
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[11px] text-slate-400 text-center">
                                            By submitting this form, you agree to our privacy policy. We'll only use your email to respond to your query.
                                        </p>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
