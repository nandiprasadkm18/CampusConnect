import React from 'react';
import { motion } from 'framer-motion';
import MyProfile from '../components/MyProfile.jsx';

const MyProfilePage = () => {
  return (
    <div className="min-h-[80vh] flex items-start justify-center py-16 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-white border border-slate-100 rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-slate-200/40"
      >
        <MyProfile />
      </motion.div>
    </div>
  );
};

export default MyProfilePage;