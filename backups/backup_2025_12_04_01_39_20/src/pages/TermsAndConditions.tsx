import { motion } from "framer-motion";

const TermsAndConditions = () => {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 md:p-12"
                >
                    <h1 className="text-4xl font-bold gradient-text mb-6">Terms and Conditions</h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground">
                                By accessing and using DMLT Academy ("the Platform"), you accept and agree to be bound by these Terms and  Conditions. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">2. Services Provided</h2>
                            <p className="text-muted-foreground mb-4">
                                DMLT Academy provides:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Online practice exams for DMLT (Diploma in Medical Laboratory Technology) students</li>
                                <li>500+ Multiple Choice Questions across 5 subjects</li>
                                <li>Bilingual support (English and Marathi)</li>
                                <li>Instant results and comprehensive analytics</li>
                                <li>Global ranking system based on performance</li>
                                <li>Various subscription plans for accessing content</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
                            <p className="text-muted-foreground mb-4">
                                To use our services, you must:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Create an account with accurate information</li>
                                <li>Verify your email address through OTP</li>
                                <li>Complete your profile with required details</li>
                                <li>Keep your password secure and confidential</li>
                                <li>Be responsible for all activities under your account</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">4. Payment and Pricing</h2>
                            <p className="text-muted-foreground mb-4">
                                All payments are processed securely through Razorpay. By purchasing a plan:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>You agree to pay the price displayed at the time of purchase</li>
                                <li>All prices are in Indian Rupees (INR)</li>
                                <li>Payment must be completed before accessing plan benefits</li>
                                <li>Plan validity starts from the date of successful payment</li>
                                <li>We reserve the right to change prices at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
                            <p className="text-muted-foreground">
                                All content on DMLT Academy, including questions, study materials, design, logos, and software, is the property of DMLT Academy and protected by copyright laws. You may not reproduce, distribute, or create derivative works without explicit written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">6. Prohibited Activities</h2>
                            <p className="text-muted-foreground mb-4">
                                You agree NOT to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Share your account credentials with others</li>
                                <li>Copy, distribute, or sell our questions or content</li>
                                <li>Use automated tools or bots to access the platform</li>
                                <li>Attempt to hack, reverse engineer, or disrupt our services</li>
                                <li>Submit false information or create multiple accounts</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">7. Exam Integrity</h2>
                            <p className="text-muted-foreground">
                                To maintain the integrity of our platform, we expect all users to attempt exams honestly without unauthorized assistance. We reserve the right to cancel results or suspend accounts if we detect cheating or unfair practices.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                            <p className="text-muted-foreground">
                                DMLT Academy provides educational content and practice materials. We make no guarantees regarding exam success or job placement. Our platform is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">9. Account Termination</h2>
                            <p className="text-muted-foreground">
                                We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent activities. You may also delete your account at any time through your profile settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">10. Modifications to Terms</h2>
                            <p className="text-muted-foreground">
                                We may modify these Terms and Conditions at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notifications.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                            <p className="text-muted-foreground">
                                These Terms and Conditions are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Maharashtra, India.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                            <p className="text-muted-foreground mb-2">
                                For questions about these Terms and Conditions, contact us:
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4 mt-4">
                                <p className="text-muted-foreground"><strong>Email:</strong> dmltadamany23@gmail.com</p>
                                <p className="text-muted-foreground"><strong>Phone:</strong> +91 9834100959</p>
                                <p className="text-muted-foreground"><strong>Address:</strong> Udgir, Maharashtra, India</p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
