import { motion } from "framer-motion";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 md:p-12"
                >
                    <h1 className="text-4xl font-bold gradient-text mb-6">Privacy Policy</h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                            <p className="text-muted-foreground mb-4">
                                We collect information that you provide directly to us when you:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Create an account and complete your profile</li>
                                <li>Purchase a plan or subscription</li>
                                <li>Take exams and practice tests</li>
                                <li>Contact us for support</li>
                                <li>Participate in surveys or promotions</li>
                            </ul>
                            <p className="text-muted-foreground mt-4">
                                This may include your name, email address, phone number, username, password, and payment information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                            <p className="text-muted-foreground mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Process your exam attempts and store results</li>
                                <li>Send you exam results, analytics, and progress reports</li>
                                <li>Process payments and prevent fraud</li>
                                <li>Send you administrative messages and updates</li>
                                <li>Respond to your support requests</li>
                                <li>Calculate global rankings based on performance</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">3. Data Security</h2>
                            <p className="text-muted-foreground">
                                We implement industry-standard security measures to protect your personal information. Your password is encrypted using SHA-256 hashing, and all data is stored securely in our Supabase database with row-level security policies. Payment information is processed securely through Razorpay and is never stored on our servers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
                            <p className="text-muted-foreground mb-4">
                                We do not sell, rent, or share your personal information with third parties except:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>With your explicit consent</li>
                                <li>To comply with legal obligations</li>
                                <li>To protect our rights and prevent fraud</li>
                                <li>With service providers who assist in our operations (e.g., Razorpay for payments)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
                            <p className="text-muted-foreground mb-4">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Access your personal data</li>
                                <li>Update or correct your information</li>
                                <li>Delete your account and associated data</li>
                                <li>Export your exam results and analytics</li>
                                <li>Opt-out of promotional communications</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
                            <p className="text-muted-foreground">
                                We use session storage to maintain your login state and preferences. We do not use third-party tracking cookies for advertising purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
                            <p className="text-muted-foreground">
                                Our services are intended for students preparing for government exams. If you are under 18, please ensure you have parental consent before using our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
                            <p className="text-muted-foreground">
                                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                            <p className="text-muted-foreground mb-2">
                                If you have any questions about this Privacy Policy, please contact us:
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4 mt-4">
                                <p className="text-muted-foreground"><strong>Email:</strong> governmentadamany23@gmail.com</p>
                                <p className="text-muted-foreground"><strong>Phone:</strong> +91 9834100959</p>
                                <p className="text-muted-foreground"><strong>Address:</strong> Nanded, Maharashtra, India</p>
                            </div>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
