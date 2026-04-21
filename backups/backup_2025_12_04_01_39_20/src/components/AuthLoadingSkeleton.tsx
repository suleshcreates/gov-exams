import { motion } from 'framer-motion';

const AuthLoadingSkeleton = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto p-6"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Footer skeleton */}
          <div className="mt-6 text-center">
            <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLoadingSkeleton;
