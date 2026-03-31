import React from "react";

export const renderFormattedText = (text: string, isSidebar: boolean = false) => {
  if (!text) return null;
  // Detecta **, * o []
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index} className="font-bold">{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      if (isSidebar) {
        return (
          <span key={index} className="italic text-zinc-500 font-medium">
            ⚡ {part.slice(1, -1)}
          </span>
        );
      }
      return (
        <span 
          key={index} 
          className="block text-center text-zinc-500 italic text-xs py-1.5"
        >
          ⚡ El usuario seleccionó: <span className="font-semibold text-zinc-700">{part.slice(1, -1)}</span>
        </span>
      );
    }
    return isSidebar ? (
      <React.Fragment key={index}>{part}</React.Fragment>
    ) : (
      <span key={index} className="whitespace-pre-wrap">
        {part}
      </span>
    );
  });
};
