// src/components/TypingIndicator.tsx
import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="px-4 lg:px-8 py-2 flex flex-col w-full">
      <div className="flex items-center gap-1.5 px-4 py-3 bg-white text-[#19213d] rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm w-fit animate-in fade-in slide-in-from-left-2 duration-300">
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
