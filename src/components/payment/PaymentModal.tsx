import React, { useState } from 'react';
import { X, Lock, CreditCard, AlertCircle } from 'lucide-react';
import { supabaseService } from '@/lib/supabaseService';
import { useAuth } from '@/context/AuthContext';
import logger from '@/lib/logger';
import { toast } from '@/hooks/use-toast';
import { loadRazorpay } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: {
        id: string;
        name: string;
        price: number;
        subjects: string[];
        validity_days: number | null;
    };
    onSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) => {
    const { auth } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    const handlePayment = async () => {
        setProcessing(true);
        setError(null);

        try {
            // 1. Load Razorpay SDK
            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                throw new Error('Razorpay SDK failed to load. Are you online?');
            }

            // 2. Create Order on Backend
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    amount: plan.price,
                    planId: plan.id,
                    receipt: `receipt_${auth.user?.phone}_${Date.now()}`
                }
            });

            if (orderError || !orderData) {
                logger.error('Order creation failed:', orderError);
                throw new Error('Failed to create payment order. Please try again.');
            }

            // 3. Initialize Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Ethereal Exam Quest",
                description: `Purchase ${plan.name}`,
                order_id: orderData.id,
                handler: async function (response: any) {
                    try {
                        logger.info('Payment successful:', response);

                        // 4. Save Purchase to Database
                        const examIds = plan.subjects;
                        const expiresAt = plan.validity_days
                            ? new Date(Date.now() + plan.validity_days * 24 * 60 * 60 * 1000).toISOString()
                            : null;

                        await supabaseService.savePlanPurchase({
                            student_phone: auth.user?.phone || '',
                            student_name: auth.user?.name || '',
                            plan_id: plan.id,
                            plan_name: plan.name,
                            price_paid: plan.price,
                            exam_ids: examIds,
                            expires_at: expiresAt,
                            // Store Razorpay details
                            payment_id: response.razorpay_payment_id,
                        });

                        toast({
                            title: "Payment Successful! 🎉",
                            description: `You have successfully purchased the ${plan.name}.`,
                        });

                        onSuccess();
                        onClose();
                    } catch (err) {
                        logger.error('Post-payment save failed:', err);
                        toast({
                            title: "Payment Recorded",
                            description: "Payment successful but there was an issue activating the plan. Please contact support.",
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    name: auth.user?.name,
                    contact: auth.user?.phone,
                    email: auth.user?.email
                },
                theme: {
                    color: "#3399cc"
                },
                modal: {
                    ondismiss: function () {
                        setProcessing(false);
                    }
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                logger.error('Payment failed:', response.error);
                setError(response.error.description || 'Payment failed');
                setProcessing(false);
            });

            rzp1.open();

        } catch (err: any) {
            logger.error('Payment flow error:', err);
            setError(err.message || 'An unexpected error occurred.');
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Secure Payment</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Plan</span>
                            <span className="font-semibold">{plan.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span>₹{plan.price}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {!import.meta.env.VITE_RAZORPAY_KEY_ID ? (
                        <div className="text-center py-4">
                            <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Razorpay Key ID missing in configuration.</p>
                        </div>
                    ) : (
                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Pay Now
                                </>
                            )}
                        </button>
                    )}

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <Lock size={12} />
                        <span>Secured by Razorpay</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
