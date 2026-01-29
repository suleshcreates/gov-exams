import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, History, User, Menu, X, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavbar } from "@/context/NavbarContext";
import { useAuth } from "@/context/AuthContext";


const Navbar = () => {
  const location = useLocation();
  const { visible } = useNavbar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, signOut } = useAuth();

  // Track if we're on the hero section (top of home page)
  const [isOnHero, setIsOnHero] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Consider "hero" the first 500px of scroll on home page
      const scrolled = window.scrollY > 100;
      setIsOnHero(!scrolled && location.pathname === '/');
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const onLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";
  const isCompleteProfilePage = location.pathname === "/complete-profile";

  if (!visible) {
    return null;
  }

  // Check if profile is complete
  const hasUsername = auth.user?.username && auth.user.username.trim() !== '';
  const hasPhone = auth.user?.phone && auth.user.phone.trim() !== '';
  const isProfileComplete = hasUsername && hasPhone;

  const navItems = [
    { path: "/", label: "Home", icon: BookOpen },
    { path: "/exams", label: "Exams", icon: BookOpen },
    { path: "/pyq", label: "PYQ", icon: Crown },
    { path: "/plans", label: "Plans", icon: Crown },
    { path: "/history", label: "History", icon: History },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-md border-b border-border/30"
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-primary/20 overflow-hidden"
            >
              <img
                src="/logo.png"
                alt="GovExams logo"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </motion.div>
            <span className="text-xl sm:text-2xl font-extrabold gradient-text">GovExams</span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2">
            {!auth.isAuthenticated || !isProfileComplete ? (
              <>
                {!isCompleteProfilePage && (
                  <>
                    <Link to="/login">
                      <button className="px-6 py-2.5 rounded-full gradient-primary text-white font-bold neon-glow shadow-md">
                        Login
                      </button>
                    </Link>
                    {isLoginPage && (
                      <Link to="/signup">
                        <button className="ml-2 px-6 py-2.5 rounded-full glass-card border font-bold hover:bg-white/10 transition">
                          Signup
                        </button>
                      </Link>
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="relative group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 ${isActive
                          ? "gradient-primary text-white neon-border shadow-lg shadow-primary/30"
                          : isOnHero
                            ? "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 hover:shadow-lg hover:shadow-black/20 border border-white/20"
                            : "glass-card hover:bg-white/10 hover:shadow-lg hover:shadow-primary/10"
                          }`}
                      >
                        <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="font-bold">{item.label}</span>
                        {/* Hover underline indicator */}
                        {!isActive && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-1/2 transition-all duration-300 rounded-full" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
                <button
                  onClick={onLogout}
                  className={`ml-2 px-6 py-2.5 rounded-full font-bold transition ${isOnHero
                    ? "bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20"
                    : "glass-card border hover:bg-white/10"
                    }`}
                >
                  Logout
                </button>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg glass-card hover:bg-white/10"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-2"
            >
              <div className="flex flex-col gap-2">
                {!auth.isAuthenticated || !isProfileComplete ? (
                  <>
                    {!isCompleteProfilePage && (
                      <>
                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                          <button className="w-full px-4 py-3 rounded-full gradient-primary text-white font-bold neon-glow shadow-md text-center">Login</button>
                        </Link>
                        {isLoginPage && (
                          <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                            <button className="w-full mt-2 px-4 py-3 rounded-full glass-card border font-bold hover:bg-white/10 transition text-center">Signup</button>
                          </Link>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="relative"
                        >
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all ${isActive
                              ? "gradient-primary text-white neon-border"
                              : "glass-card hover:bg-white/10"
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-bold">{item.label}</span>
                          </motion.div>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => { setIsMenuOpen(false); onLogout(); }}
                      className="mt-2 px-4 py-3 rounded-full glass-card border font-bold hover:bg-white/10 transition text-center"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
