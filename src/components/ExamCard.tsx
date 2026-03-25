import { motion } from "framer-motion";
import { Clock, Lock, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { Exam } from "@/data/mockData";

interface ExamCardProps {
  exam: Exam & { thumbnail_url?: string; expiry_date?: string | null };
  index: number;
  isPurchased?: boolean;
  onPurchase?: (exam: Exam) => void;
}

const ExamCard = ({ exam, index, isPurchased, onPurchase }: ExamCardProps) => {
  const isExpired = exam.expiry_date ? new Date(exam.expiry_date) < new Date() : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`glass-card rounded-2xl neon-border group relative overflow-hidden ${isExpired ? 'opacity-75' : ''}`}
    >
      <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity" />

      {/* Expired Overlay Badge */}
      {isExpired && (
        <div className="absolute top-3 left-3 z-20 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg">
          EXPIRED
        </div>
      )}

      {/* Thumbnail */}
      {exam.thumbnail_url ? (
        <div className="h-44 w-full overflow-hidden relative">
          <img
            src={exam.thumbnail_url}
            alt={exam.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="h-44 w-full bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center">
          <Image className="w-12 h-12 text-primary/30" />
        </div>
      )}

      <div className="relative z-10 p-4 sm:p-6">
        {/* Title + Price */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:gradient-text transition-all flex-1 pr-3">
            {exam.title}
          </h3>
          <div className="flex flex-col items-end shrink-0">
            {exam.price ? (
              <span className={`text-2xl font-extrabold ${isExpired ? 'text-slate-400 line-through' : 'text-primary'}`}>₹{exam.price}</span>
            ) : (
              <span className="text-xl font-bold text-green-600">Free</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {exam.description}
        </p>

        {/* Validity Badge */}
        <div className="flex items-center gap-2 text-xs sm:text-sm mb-5">
          <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : 'text-primary'}`} />
          <span className={isExpired ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
            {isExpired
              ? 'This subject has expired'
              : exam.expiry_date
                ? `Expires: ${new Date(exam.expiry_date).toLocaleDateString()}`
                : (exam.validity_days ? `${exam.validity_days} Days Validity` : 'Lifetime Access')
            }
          </span>
        </div>

        {/* Action */}
        <div className="flex items-center justify-end">
          {isExpired ? (
            <span className="px-5 py-2.5 rounded-full bg-slate-200 text-slate-500 font-medium text-sm cursor-not-allowed">
              No Longer Available
            </span>
          ) : exam.isPaid && !isPurchased ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                onPurchase?.(exam);
              }}
              className="px-5 py-2.5 rounded-full gradient-accent text-white font-medium neon-glow text-sm whitespace-nowrap flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Unlock Now
            </motion.button>
          ) : (
            <Link to={`/exam/${exam.id}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-full gradient-primary text-white font-medium neon-glow text-sm whitespace-nowrap"
              >
                {isPurchased ? 'Start Learning' : 'View Details'}
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ExamCard;
