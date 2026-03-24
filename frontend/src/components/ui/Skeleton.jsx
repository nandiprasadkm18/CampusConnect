import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-100 rounded-lg ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
