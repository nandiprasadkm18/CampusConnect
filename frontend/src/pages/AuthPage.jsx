import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';
import OTPVerification from '../components/OTPVerification.jsx';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignIn, setIsSignIn] = useState(location.pathname === '/login');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationType, setVerificationType] = useState('email');

  useEffect(() => {
    setIsSignIn(location.pathname === '/login');
  }, [location.pathname]);

  const toggle = () => {
    const newPath = isSignIn ? '/register' : '/login';
    setIsVerifying(false);
    navigate(newPath);
  };

  const handleRegisterSuccess = () => {
    setIsVerifying(true);
    setVerificationType('email');
  };

  const handleVerified = (updatedUser) => {
    onLogin(updatedUser);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 gap-8">
      <div className="text-center">
         <span className="text-2xl font-serif font-black tracking-tighter text-slate-900">
            CAMPUS<span className="text-indigo-600">CONNECT</span>
         </span>
      </div>
      <div className="relative w-full max-w-[850px] h-[580px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden shadow-slate-200 border border-slate-100 font-sans">
        
        {/* Forms Container Layer */}
        <div className="absolute top-0 left-0 w-full h-full">
            {/* Sign In Form - Only interactive when isSignIn is true */}
            <motion.div
               animate={{ 
                 x: isSignIn ? 0 : '100%',
                 opacity: isSignIn ? 1 : 0,
                 pointerEvents: isSignIn ? 'auto' : 'none'
               }}
               transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
               className="absolute top-0 left-0 w-full md:w-1/2 h-full z-20 flex flex-col items-center justify-center bg-white"
            >
              <div className="w-full h-full overflow-y-auto custom-scrollbar flex items-center justify-center py-10">
                 <div className="w-full max-w-sm">
                    <Login onLogin={onLogin} />
                 </div>
              </div>
            </motion.div>

            {/* Sign Up Form - Only interactive when isSignIn is false */}
            <motion.div
               animate={{ 
                 x: isSignIn ? 0 : '100%',
                 opacity: isSignIn ? 0 : 1,
                 pointerEvents: isSignIn ? 'none' : 'auto',
                 zIndex: isSignIn ? 10 : 30
               }}
               transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
               className="absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center bg-white"
            >
              <div className="w-full h-full overflow-y-auto custom-scrollbar flex items-center justify-center py-10">
                <div className="w-full max-w-sm">
                   {isVerifying ? (
                     <OTPVerification 
                        initialType={verificationType} 
                        onVerified={handleVerified} 
                     />
                   ) : (
                     <Register onRegisterSuccess={handleRegisterSuccess} />
                   )}
                </div>
              </div>
            </motion.div>
        </div>

        {/* Overlay Container (Desktop only) */}
        <motion.div
           animate={{ 
             x: isSignIn ? 0 : '-100%'
           }}
           transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
           className="hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[100] shadow-2xl"
        >
          <motion.div 
            animate={{ 
              x: isSignIn ? 0 : '50%'
            }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className="relative left-[-100%] h-full w-[200%] bg-slate-950 text-white"
          >
            {/* Left Overlay Panel (Appears on the left when Register is active) */}
            <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col items-center text-center px-12 pt-0 pb-0">
                <div className="flex-1 flex items-center w-full max-w-sm">
                  <div className="space-y-4 w-full">
                    <h2 className="text-3xl font-serif font-extrabold tracking-tight text-white leading-tight">Welcome Back!</h2>
                    <p className="text-slate-300 font-medium text-sm leading-relaxed mx-auto opacity-70">Login to access your personalized campus dashboard and events.</p>
                  </div>
                </div>
                <div className="w-full max-w-sm pb-[88px]">
                  <button onClick={toggle} className="group max-w-xs mx-auto w-full py-3.5 bg-white text-slate-950 rounded-xl font-bold text-xs uppercase tracking-[0.3em] transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center">
                    Back to Portal
                  </button>
                </div>
            </div>

            {/* Right Overlay Panel (Appears on the right when Login is active) */}
            <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col items-center text-center px-12 pt-0 pb-0">
                <div className="flex-1 flex items-center w-full max-w-sm">
                  <div className="space-y-4 w-full">
                    <h2 className="text-3xl font-serif font-extrabold tracking-tight text-white leading-tight">New here?</h2>
                    <p className="text-slate-300 font-medium text-sm leading-relaxed mx-auto opacity-70">Join our campus network to explore and register for the latest events.</p>
                  </div>
                </div>
                <div className="w-full max-w-sm pb-[147px]">
                  <button onClick={toggle} className="group max-w-xs mx-auto w-full py-3.5 bg-white text-slate-950 rounded-xl font-bold text-xs uppercase tracking-[0.3em] transition-all hover:bg-slate-50 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center">
                    Register Hub
                  </button>
                </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile View Toggles (Simplified footer) */}
        <div className="md:hidden absolute bottom-0 left-0 w-full p-8 bg-white/90 backdrop-blur-lg border-t border-slate-100 text-center z-[110]">
           <button onClick={toggle} className="text-indigo-600 font-bold text-xs uppercase tracking-widest ring-2 ring-indigo-50 px-8 py-3 rounded-full hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 mx-auto">
             {isSignIn ? "Click to Register" : "Already a member?"}
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
