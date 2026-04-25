import React, { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={`
        bg-white/10 
        backdrop-blur-xl 
        border 
        border-white/20 
        shadow-2xl 
        p-8 
        rounded-3xl 
        hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] 
        hover:scale-[1.02] 
        transition-all 
        duration-500 
        ease-in-out 
        ${className ?? ''}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
