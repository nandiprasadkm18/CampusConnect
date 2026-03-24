import React from 'react';
import { motion } from 'framer-motion';
import Register from '../components/Register.jsx';

const RegisterPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-white flex flex-col items-center justify-start p-6"
    >
      <Register />
    </motion.div>
  );
};

export default RegisterPage;