import { motion } from "framer-motion";
import { Languages } from "lucide-react";

interface TranslateButtonProps {
  isMarathi: boolean;
  onToggle: () => void;
}

const TranslateButton = ({ isMarathi, onToggle }: TranslateButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium transition-all ${
        isMarathi
          ? "gradient-accent text-white neon-border"
          : "glass-card hover:bg-white/10"
      }`}
    >
      <Languages className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="text-sm sm:text-base">{isMarathi ? "मराठी" : "English"}</span>
    </motion.button>
  );
};

export default TranslateButton;
