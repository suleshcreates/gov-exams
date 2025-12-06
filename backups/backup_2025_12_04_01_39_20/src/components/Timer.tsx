import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

const Timer = ({ initialMinutes, onTimeUp }: TimerProps) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds, onTimeUp]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const percentage = (seconds / (initialMinutes * 60)) * 100;
  const isLowTime = seconds < 60;

  return (
    <motion.div
      animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 1, repeat: isLowTime ? Infinity : 0 }}
      className="
        fixed top-4 left-2 sm:left-6 z-50
        glass-card rounded-xl px-3 sm:px-4 py-2 sm:py-3
        flex items-center gap-2 sm:gap-3
        bg-white/10 backdrop-blur-lg border border-white/20 shadow-md
      "
    >
      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 18}`}
            strokeDashoffset={`${2 * Math.PI * 18 * (1 - percentage / 100)}`}
            className={isLowTime ? "text-destructive" : "text-primary"}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock
            className={`w-3 h-3 sm:w-4 sm:h-4 ${
              isLowTime ? "text-destructive" : "text-primary"
            }`}
          />
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground leading-none hidden sm:block">Time Left</p>
        <p
          className={`text-sm sm:text-base font-semibold ${
            isLowTime ? "text-destructive animate-glow-pulse" : "gradient-text"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </p>
      </div>
    </motion.div>
  );
};

export default Timer;
