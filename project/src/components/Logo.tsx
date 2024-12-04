import React from 'react';
import { Globe } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Globe className="w-8 h-8 text-[rgb(var(--primary))]" />
        <div className="absolute inset-0 bg-[rgb(var(--primary))] blur-lg opacity-30 animate-pulse-slow" />
      </div>
      <div className="flex items-baseline">
        <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[rgb(var(--primary))] via-[rgb(var(--secondary))] to-[rgb(var(--accent))] bg-clip-text text-transparent">
          Atlas
        </span>
        <span className="text-2xl font-black tracking-tight text-[rgb(var(--primary))]">AI</span>
      </div>
    </div>
  );
};

export default Logo;