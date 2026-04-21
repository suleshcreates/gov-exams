import { motion } from "framer-motion";
import { Clock, FileText, Lock, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { Exam } from "@/data/mockData";

interface ExamCardProps {
  exam: Exam;
  index: number;
}

const ExamCard = ({ exam, index }: ExamCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass-card rounded-2xl p-4 sm:p-6 neon-border group relative overflow-hidden"
    >
      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:gradient-text transition-all">
            {exam.title}
          </h3>
          {!exam.isPaid && (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 line-clamp-2">
          {exam.description}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <BookMarked className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-muted-foreground">
              5 Question Sets
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-muted-foreground">
              20 MCQs/Set
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm col-span-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-muted-foreground">
              {exam.timeAllowed} minutes
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link to={`/exam/${exam.id}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full gradient-primary text-white font-medium neon-glow text-sm sm:text-base whitespace-nowrap"
            >
              View Details
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExamCard;
