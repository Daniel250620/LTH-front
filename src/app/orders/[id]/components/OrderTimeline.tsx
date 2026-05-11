"use client";

import {
  Sparkles,
  Clock,
  Sliders,
  Truck,
  Building2,
  CheckCircle2,
  Check
} from "lucide-react";

interface OrderTimelineProps {
  status: string;
  deliveryMethod: string;
}

export default function OrderTimeline({ status, deliveryMethod }: OrderTimelineProps) {
  // Helper to determine status progress step state
  const getStepStatus = (stepId: string, currentStatus: string, deliveryMethodStr: string) => {
    const stepsList = deliveryMethodStr === "delivery" 
      ? ["pending", "preparing", "in_transit", "completed"]
      : ["pending", "preparing", "ready_for_pickup", "completed"];

    const currentIndex = stepsList.indexOf(currentStatus);
    const stepIndex = stepsList.indexOf(stepId);

    if (currentStatus === "cancelled") {
      return "cancelled";
    }

    if (currentIndex === -1) return "pending";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  const getTimelineSteps = (deliveryMethodStr: string) => {
    if (deliveryMethodStr === "delivery") {
      return [
        { id: "pending", label: "Pendiente", icon: Clock, color: "amber", bg: "bg-amber-500" },
        { id: "preparing", label: "Preparación", icon: Sliders, color: "blue", bg: "bg-blue-500" },
        { id: "in_transit", label: "En Camino", icon: Truck, color: "sky", bg: "bg-sky-500" },
        { id: "completed", label: "Completado", icon: CheckCircle2, color: "emerald", bg: "bg-emerald-500" },
      ];
    } else {
      return [
        { id: "pending", label: "Pendiente", icon: Clock, color: "amber", bg: "bg-amber-500" },
        { id: "preparing", label: "Preparación", icon: Sliders, color: "blue", bg: "bg-blue-500" },
        { id: "ready_for_pickup", label: "Listo Sucursal", icon: Building2, color: "purple", bg: "bg-purple-500" },
        { id: "completed", label: "Completado", icon: CheckCircle2, color: "emerald", bg: "bg-emerald-500" },
      ];
    }
  };

  return (
    <div className="w-full max-w-7xl lg:max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 anim-card">
      <style>{`
        @keyframes timeline-ping {
          0% {
            transform: scale(0.98);
            opacity: 0.85;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .animate-timeline-ping {
          animation: timeline-ping 2.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>

      <div className="bg-white/95 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-3">
          <Sparkles size={15} className="text-red-500 animate-pulse" />
          <h2 className="text-sm font-black text-[#102B5E] uppercase tracking-widest">Rastreo de Pedido en Tiempo Real</h2>
        </div>
        
        {/* Scrollable Flow container */}
        <div className="flex items-center justify-between overflow-x-auto pt-6 pb-4 scrollbar-none gap-4">
          {getTimelineSteps(deliveryMethod).map((step, idx, arr) => {
            const stepStatus = getStepStatus(step.id, status, deliveryMethod);
            const StepIcon = step.icon;
            const isLast = idx === arr.length - 1;
            
            let circleColor = "";
            let textColor = "";
            let iconColor = "";
            let ringPulse = false;
            
            if (stepStatus === "completed") {
              circleColor = "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/15";
              textColor = "text-slate-800 font-bold";
              iconColor = "text-white";
            } else if (stepStatus === "active") {
              circleColor = `${step.bg} border-${step.color}-500 text-white shadow-lg shadow-${step.color}-500/20`;
              textColor = `text-${step.color}-600 font-black`;
              iconColor = "text-white";
              ringPulse = true;
            } else if (stepStatus === "cancelled") {
              circleColor = "bg-rose-100 border-rose-200 text-rose-500";
              textColor = "text-rose-400 font-bold line-through";
              iconColor = "text-rose-400";
            } else {
              circleColor = "bg-slate-50 border-slate-200 text-slate-400";
              textColor = "text-slate-400 font-semibold";
              iconColor = "text-slate-400";
            }
            
            return (
              <div key={step.id} className="flex-1 flex items-start min-w-[140px] last:flex-none">
                <div className="flex flex-col items-center text-center gap-2.5">
                  {/* Circle Icon */}
                  <div className="relative">
                    {ringPulse && (
                      <div className={`absolute -inset-1.5 rounded-full border border-${step.color}-500 opacity-70 animate-timeline-ping pointer-events-none`} />
                    )}
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${circleColor}`}>
                      {stepStatus === "completed" ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        <StepIcon size={18} className={iconColor} />
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <p className={`text-xs md:text-[13px] uppercase tracking-wider leading-tight ${textColor}`}>
                      {step.label}
                    </p>
                    {stepStatus === "active" && (
                      <span className="inline-flex items-center text-[9px] bg-slate-900 text-white font-black uppercase px-2.5 py-0.5 rounded-full mt-1.5 animate-pulse tracking-widest">
                        En Curso
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Intersecting line */}
                {!isLast && (
                  <div className="flex-1 h-0.5 mx-4 min-w-[30px] rounded-full relative overflow-hidden bg-slate-100 mt-[24px]">
                    <div className={`absolute inset-y-0 left-0 transition-all duration-1000 ${
                      stepStatus === "completed" ? "w-full bg-emerald-500" :
                      stepStatus === "active" ? "w-1/2 bg-gradient-to-r from-blue-500 to-transparent animate-pulse" :
                      "w-0 bg-slate-200"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
