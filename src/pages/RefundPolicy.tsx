import { motion } from "framer-motion";

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-background py-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 md:p-12"
                >
                    <h1 className="text-4xl font-bold gradient-text mb-6">Cancellation and Refund Policy</h1>
                    <p className="text-sm text-muted-foreground mb-8">
                        Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <div className="prose prose-lg max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">1. Refund Eligibility</h2>
                            <p className="text-muted-foreground mb-4">
                                At GovExams, we want you to be completely satisfied with your purchase. We offer a <strong>7-day money-back guarantee</strong> for all our plans under the following conditions:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Refund request must be made within 7 days of purchase</li>
                                <li>You have not completed more than 3 exam sets</li>
                                <li>No evidence of content copying or unauthorized sharing</li>
                                <li>Valid reason for dissatisfaction provided</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">2. Non-Refundable Situations</h2>
                            <p className="text-muted-foreground mb-4">
                                Refunds will NOT be provided in the following cases:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>Refund requested after 7 days from purchase date</li>
                                <li>Account has completed more than 3 exam sets</li>
                                <li>Violation of Terms and Conditions</li>
                                <li>Evidence of sharing account or questions with others</li>
                                <li>Change of mind after extensively using the service</li>
                                <li>Technical issues caused by user's device or internet connection</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">3. How to Request a Refund</h2>
                            <p className="text-muted-foreground mb-4">
                                To request a refund:
                            </p>
                            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
                                <li>Email us at <strong>support@govexams.info</strong></li>
                                <li>Include your order/transaction ID</li>
                                <li>Provide registered email and phone number</li>
                                <li>Explain the reason for your refund request</li>
                                <li>Allow 3-5 business days for review</li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">4. Refund Processing Time</h2>
                            <p className="text-muted-foreground">
                                Once your refund request is approved:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                                <li>Refund will be initiated within 3-5 business days</li>
                                <li>Amount will be credited to the original payment method</li>
                                <li>Bank processing may take an additional 5-7 business days</li>
                                <li>You will receive a confirmation email once processed</li>
                                <li>Your account access will be revoked upon refund approval</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">5. Partial Refunds</h2>
                            <p className="text-muted-foreground">
                                In certain cases, we may offer partial refunds based on usage. For example, if you've used the service for a few days but are unsatisfied, we may offer aproportionate refund minus the used portion and a processing fee.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">6. Plan Cancellation</h2>
                            <p className="text-muted-foreground mb-4">
                                Since all our plans offer lifetime access:
                            </p>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                                <li>There are no recurring charges or auto-renewal</li>
                                <li>You can stop using the service at any time</li>
                                <li>No cancellation notice required</li>
                                <li>Your access continues for the plan's validity period</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">7. Technical Issues</h2>
                            <p className="text-muted-foreground">
                                If you experience technical problems preventing you from using our services, please contact us immediately at support@govexams.info. We will work to resolve the issue promptly. Refunds for technical issues will be considered on a case-by-case basis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">8. Payment Gateway Charges</h2>
                            <p className="text-muted-foreground">
                                Please note that payment gateway charges (typically 2-3% of transaction amount) are non-refundable and will be deducted from refund amounts as per Razorpay's policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">9. Dispute Resolution</h2>
                            <p className="text-muted-foreground">
                                If you're not satisfied with our refund decision, you may escalate the matter by contacting us at support@govexams.info. We are committed to resolving all disputes fairly and promptly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                            <p className="text-muted-foreground mb-2">
                                For refund requests or questions about this policy:
                            </p>
                            <div className="bg-primary/5 rounded-lg p-4 mt-4">
                                <p className="text-muted-foreground"><strong>Email:</strong> support@govexams.info</p>
                                <p className="text-muted-foreground"><strong>Phone:</strong> +91 9834100959</p>
                                <p className="text-muted-foreground"><strong>WhatsApp:</strong> +91 9834100959</p>
                                <p className="text-muted-foreground"><strong>Address:</strong> Udgir, Maharashtra, India</p>
                            </div>
                        </section>

                        <div className="bg-primary/10 border-l-4 border-primary p-4 mt-8 rounded">
                            <p className="text-sm text-muted-foreground">
                                <strong>Note:</strong> This refund policy is in compliance with Indian consumer protection laws and Razorpay's payment gateway requirements. We reserve the right to modify this policy with prior notice to users.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RefundPolicy;
