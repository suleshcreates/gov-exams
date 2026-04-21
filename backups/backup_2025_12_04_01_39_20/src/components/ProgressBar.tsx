import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Question Progress
        </span>
        <span className="text-xs sm:text-sm font-bold gradient-text">
          {current} / {total}
        </span>
      </div>

      <div className="relative h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full gradient-primary rounded-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </motion.div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Started</span>
        <span>{Math.round(percentage)}% Complete</span>
        <span>Finish</span>
      </div>
    </div>
  );
};

export default ProgressBar;
