import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Lock, Calendar, ArrowLeft, Eye, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PYQData {
    id: string;
    title: string;
    description: string;
    category: string;
    year: number;
    price: number;
    pdf_url: string;
    page_count: number;
    file_size_mb: number;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PYQDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [pyq, setPYQ] = useState<PYQData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showViewer, setShowViewer] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

    useEffect(() => {
        if (id) {
            loadPYQDetails();
            if (auth.isAuthenticated) {
                checkAccess();
            }
        }
    }, [id, auth.isAuthenticated]);

    const loadPYQDetails = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/pyq/${id}`);
            if (!response.ok) {
                navigate('/pyq');
                return;
            }
            const data = await response.json();
            setPYQ(data);
        } catch (error) {
            console.error('Error loading PYQ:', error);
            navigate('/pyq');
        } finally {
            setLoading(false);
        }
    };

    const checkAccess = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/api/student/pyq/${id}/access`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setHasAccess(data.hasAccess);
        } catch (error) {
            console.error('Error checking access:', error);
        }
    };

    const handlePurchase = async () => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!pyq) return;

        setProcessing(true);

        try {
            const token = localStorage.getItem('access_token');

            // Create Razorpay order
            const orderResponse = await fetch(`${API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: pyq.price,
                    currency: 'INR',
                    receipt: `pyq_${pyq.id}_${Date.now()}`,
                    notes: {
                        resource_type: 'pyq',
                        resource_id: pyq.id
                    }
                })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const orderData = await orderResponse.json();

            // Real Razorpay flow
            const options = {
                key: RAZORPAY_KEY,
                amount: orderData.amount, // Amount in paise
                currency: orderData.currency,
                name: 'GovExams',
                description: `PYQ: ${pyq.title}`,
                order_id: orderData.id,
                prefill: {
                    name: auth.user?.name,
                    email: auth.user?.email,
                    contact: auth.user?.phone
                },
                theme: {
                    color: '#3B82F6'
                },
                handler: async function (response: any) {
                    // Verify payment and grant access
                    try {
                        const verifyResponse = await fetch(`${API_URL}/api/student/premium-access/purchase`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                resource_type: 'pyq',
                                resource_id: pyq.id,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                amount_paid: pyq.price
                            })
                        });

                        if (verifyResponse.ok) {
                            setHasAccess(true);
                            alert('Purchase successful! You can now view the PDF.');
                        } else {
                            throw new Error('Failed to verify payment');
                        }
                    } catch (err) {
                        console.error('Payment verification error:', err);
                        alert('Payment received but verification failed. Please contact support.');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (error) {
            console.error('Purchase error:', error);
            alert('Failed to initiate purchase. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!pyq) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <p>PYQ not found</p>
            </div>
        );
    }

    // Secure PDF Viewer Component separated for cleaner route handling
    // See SecurePDFViewer.tsx for the new implementation
    // This file now handles details and purchase only.

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/pyq')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to PYQs
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative flex items-center justify-center">
                        <FileText className="w-24 h-24 text-white/30" />
                        <div className="absolute top-4 right-4 flex gap-2">
                            {pyq.category && (
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                                    {pyq.category}
                                </span>
                            )}
                            {pyq.year && (
                                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {pyq.year}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-4">{pyq.title}</h1>
                        <p className="text-muted-foreground mb-6">
                            {pyq.description || 'Previous Year Question Paper - Complete set with all questions and answers.'}
                        </p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 mb-8 text-sm text-muted-foreground">
                            {pyq.page_count > 0 && (
                                <span className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    {pyq.page_count} pages
                                </span>
                            )}
                            {pyq.file_size_mb > 0 && (
                                <span>{pyq.file_size_mb} MB</span>
                            )}
                        </div>

                        {/* Security Features Banner */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-8">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
                                <ShieldCheck className="w-5 h-5" />
                                Secure PDF Viewer
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-500">
                                This PDF is protected with anti-screenshot and anti-copy measures.
                            </p>
                        </div>

                        {/* Action Area */}
                        <div className="border-t pt-6">
                            {hasAccess ? (
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => navigate(`/secure-viewer/${id}`)}
                                        className="flex-1 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-5 h-5" />
                                        View PDF Securely
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="text-center sm:text-left">
                                        <div className="text-3xl font-bold text-primary">₹{pyq.price}</div>
                                        <div className="text-sm text-muted-foreground">One-time purchase</div>
                                    </div>
                                    <button
                                        onClick={handlePurchase}
                                        disabled={processing}
                                        className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5" />
                                                Purchase Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PYQDetail;
