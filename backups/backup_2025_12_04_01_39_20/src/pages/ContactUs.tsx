import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Contact Us</h1>
                    <p className="text-lg text-muted-foreground">
                        Have questions? We're here to help!
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card rounded-2xl p-8 space-y-6"
                    >
                        <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Email</h3>
                                    <a
                                        href="mailto:dmltadamany23@gmail.com"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        dmltadamany23@gmail.com
                                    </a>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We'll respond within 24 hours
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Phone</h3>
                                    <a
                                        href="tel:+919834100959"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        +91 9834100959
                                    </a>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Mon-Sat, 9:00 AM - 6:00 PM IST
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                                    <a
                                        href="https://wa.me/919834100959?text=Hello!%20I%20have%20a%20question%20about%20DMLT%20Academy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        +91 9834100959
                                    </a>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Get instant support
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Location</h3>
                                    <p className="text-muted-foreground">
                                        Udgir, Maharashtra<br />
                                        India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-semibold mb-6">Common Questions</h2>

                        <div className="space-y-4">
                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-semibold mb-2">How do I reset my password?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use the "Forgot Password" link on the login page to reset your password via OTP verification.
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                                <p className="text-sm text-muted-foreground">
                                    We accept all major payment methods through Razorpay, including credit/debit cards, UPI, net banking, and wallets.
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-semibold mb-2">Can I get a refund?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Yes! We offer a 7-day money-back guarantee. See our Refund Policy for details.
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-semibold mb-2">How many times can I attempt an exam?</h3>
                                <p className="text-sm text-muted-foreground">
                                    You can attempt each exam set multiple times to improve your score and understanding.
                                </p>
                            </div>

                            <div className="border-l-4 border-primary pl-4">
                                <h3 className="font-semibold mb-2">Is the content available in Marathi?</h3>
                                <p className="text-sm text-muted-foreground">
                                    Yes! All our questions are available in both English and Marathi for your convenience.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                Still have questions? Don't hesitate to reach out via any of the contact methods above!
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Business Hours */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card rounded-2xl p-8 mt-8 text-center"
                >
                    <h2 className="text-2xl font-semibold mb-4">Support Hours</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                        <div>
                            <div className="text-primary font-semibold mb-2">Email Support</div>
                            <div className="text-sm text-muted-foreground">24/7 - Responds within 24 hours</div>
                        </div>
                        <div>
                            <div className="text-primary font-semibold mb-2">Phone Support</div>
                            <div className="text-sm text-muted-foreground">Mon-Sat: 9 AM - 6 PM IST</div>
                        </div>
                        <div>
                            <div className="text-primary font-semibold mb-2">WhatsApp</div>
                            <div className="text-sm text-muted-foreground">Mon-Sat: 9 AM - 8 PM IST</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactUs;
