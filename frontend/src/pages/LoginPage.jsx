import React from 'react';
import { motion } from 'framer-motion';
import Login from '../components/Login.jsx';

const LoginPage = ({ onLogin }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-white flex flex-col items-center justify-center p-6"
    >
      <Login onLogin={onLogin} />
    </motion.div>
  );
};

export default LoginPage;
