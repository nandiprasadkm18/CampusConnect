import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Card = ({ className, children, ...props }) => {
    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.2)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "rounded-xl border border-white/20 bg-white/70 backdrop-blur-md shadow-sm p-6 text-card-foreground transition-all dark:bg-slate-950/70 dark:border-slate-800",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
