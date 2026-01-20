import { motion } from "framer-motion";
import { Check, Crown, IndianRupee, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabaseService } from "@/lib/supabaseService";
import { adminService } from "@/admin/lib/adminService";
import logger from "@/lib/logger";
import PaymentModal from "@/components/payment/PaymentModal";

interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  price: number;
  validity_days: number | null;
  subjects: string[];
  is_active: boolean;
  display_order: number;
  badge: string | null;
}

const Plans = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [planTemplates, setPlanTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedPlans, setPurchasedPlans] = useState<string[]>([]);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTemplate | null>(null);

  // Load plan templates from database
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        // Use public endpoint
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/public/plans`);

        if (!response.ok) {
          throw new Error('Failed to fetch plan templates');
        }

        const result = await response.json();
        // Filter for active plans (backend might return all, so filter here too safely)
        const activePlans = (result.data || []).filter((p: PlanTemplate) => p.is_active !== false);
        setPlanTemplates(activePlans);
      } catch (error) {
        logger.error("Error loading plans:", error);
        toast({
          title: "Error",
          description: "Failed to load plans. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Load purchased plans
  useEffect(() => {
    const loadPurchasedPlans = async () => {
      if (!auth.isAuthenticated || !auth.user || !auth.user.phone) return;

      try {
        logger.debug('Loading purchased plans for phone:', auth.user.phone);
        const plans = await supabaseService.getStudentPlans(auth.user.phone);
        logger.debug('Purchased plans loaded:', plans);
        setPurchasedPlans(plans.map(p => p.plan_template_id || p.plan_id).filter(Boolean));
      } catch (error) {
        logger.error("Error loading purchased plans:", error);
      }
    };

    loadPurchasedPlans();
  }, [auth.isAuthenticated, auth.user]);

  const handlePlanSelection = (plan: PlanTemplate) => {
    if (!auth.isAuthenticated || !auth.user) {
      toast({
        title: "Login Required",
        description: "Please login to purchase a plan.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Check if user has completed profile (phone number required)
    if (!auth.user.phone) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile by adding a phone number before purchasing a plan.",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }

    // Parse subjects for the modal
    let subjects: string[] = [];
    if (Array.isArray(plan.subjects)) {
      subjects = plan.subjects;
    } else if (typeof plan.subjects === 'string') {
      try {
        subjects = JSON.parse(plan.subjects);
      } catch (e) {
        logger.error('Failed to parse subjects:', plan.subjects);
        subjects = [];
      }
    }

    // Prepare plan with parsed subjects
    const planWithSubjects = {
      ...plan,
      subjects
    };

    setSelectedPlan(planWithSubjects);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh purchased plans
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const checkPlanAccess = (planId: string): boolean => {
    return purchasedPlans.includes(planId);
  };

  if (loading) {
    return (
      <div className="flex-1 pt-20 sm:pt-24 pb-16 bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-20 sm:pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4"
            >
              Choose Your <span className="gradient-text">Learning Plan</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Select a plan that fits your needs. Get access to quality exam preparation content.
            </motion.p>
          </div>

          {/* Plans Grid */}
          {planTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
              {planTemplates.map((plan, index) => {
                const hasPurchased = checkPlanAccess(plan.id);
                const isProcessingPlan = isProcessing === plan.id;
                const subjects = Array.isArray(plan.subjects) ? plan.subjects : JSON.parse(plan.subjects || '[]');

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative glass-card rounded-2xl p-6 sm:p-8 border-2 transition-all ${plan.badge === 'POPULAR'
                      ? "border-primary shadow-xl scale-105 md:scale-105"
                      : plan.badge === 'BEST VALUE'
                        ? "border-primary/50 shadow-lg"
                        : "border-border"
                      }`}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className={`px-4 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1 ${plan.badge === 'BEST VALUE' ? 'gradient-primary' : 'bg-primary'
                          }`}>
                          {plan.badge === 'BEST VALUE' && <Crown className="w-3 h-3 fill-current" />}
                          {plan.badge === 'POPULAR' && <Star className="w-3 h-3 fill-current" />}
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl sm:text-3xl font-bold mb-2 gradient-text">
                        {plan.name}
                      </h3>
                      {plan.description && (
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {plan.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-1">
                        <IndianRupee className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        <span className="text-4xl sm:text-5xl font-bold gradient-text">
                          {plan.price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {plan.validity_days ? `${plan.validity_days} days access` : 'Lifetime access'}
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-muted-foreground">
                          {subjects.length} Subject{subjects.length !== 1 ? 's' : ''} Included
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-muted-foreground">
                          All Question Sets
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-muted-foreground">
                          Bilingual Support (English & Marathi)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-muted-foreground">
                          Instant Results & Analytics
                        </span>
                      </li>
                    </ul>

                    {/* Action Button */}
                    <button
                      onClick={() => handlePlanSelection(plan)}
                      disabled={isProcessingPlan || hasPurchased}
                      className={`w-full py-3 sm:py-4 rounded-lg font-semibold transition-all ${hasPurchased
                        ? "bg-green-500 text-white cursor-not-allowed"
                        : plan.badge === 'BEST VALUE' || plan.badge === 'POPULAR'
                          ? "gradient-primary text-white hover:opacity-90"
                          : "bg-card border-2 border-border hover:border-primary"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isProcessingPlan ? (
                        <div className="flex items-center justify-center gap-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Processing...
                        </div>
                      ) : hasPurchased ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" />
                          Purchased
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          Purchase Plan
                          {plan.badge === 'BEST VALUE' && <Crown className="w-4 h-4" />}
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Plans;
