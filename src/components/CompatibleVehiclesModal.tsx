import { X, ChevronRight, CarFront, Loader2 } from "lucide-react";

export interface VehicleCompatibility {
 id: number;
 name: string;
 engine: string;
 yearStart: number;
 yearEnd: number;
 brand: {
  id: number;
  name: string;
 };
}

interface Props {
 isOpen: boolean;
 onClose: () => void;
 vehicles: VehicleCompatibility[];
 isLoading?: boolean;
}

export default function CompatibleVehiclesModal({
 isOpen,
 onClose,
 vehicles,
 isLoading = false,
}: Props) {
 if (!isOpen) return null;

 // Agrupar por marca
 const grouped = vehicles.reduce(
  (acc, v) => {
   const brandName = v.brand.name.toUpperCase();
   if (!acc[brandName]) acc[brandName] = [];
   acc[brandName].push(v);
   return acc;
  },
  {} as Record<string, VehicleCompatibility[]>,
 );

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
   <div className="bg-[#fcfdfe] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
    {/* Header */}
    <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-white">
     <div className="flex items-center gap-3 text-[#19213d]">
      <CarFront size={24} className="text-blue-500" />
      <h2 className="text-xl font-bold">Vehículos Compatibles</h2>
     </div>
     <button
      onClick={onClose}
      className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-xl transition-colors"
     >
      <X size={20} />
     </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
     {isLoading ? (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
       <Loader2 className="animate-spin mb-4" size={32} />
       <p className="font-medium">Cargando vehículos compatibles...</p>
      </div>
     ) : (
      <>
       {Object.entries(grouped).map(([brandName, brandVehicles]) => (
        <div key={brandName}>
         <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-black text-[#19213d] uppercase tracking-wider">
           {brandName}
          </h3>
          <span className="bg-zinc-100 text-zinc-500 text-[11px] font-bold px-2 py-0.5 rounded-full">
           {brandVehicles.length}
          </span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandVehicles.map((v) => (
           <div
            key={v.id}
            className="bg-white border border-zinc-100 rounded-xl p-5 hover:shadow-md hover:border-zinc-200 transition-all group flex flex-col justify-between shadow-sm"
           >
            <div>
             <h4 className="font-bold text-[#19213d] text-base">{v.name}</h4>
             <p className="text-[13px] text-zinc-500 mt-1 font-medium">
              Motor: {v.engine === "N/A" ? "--" : v.engine}
             </p>
            </div>
            <div className="flex items-center justify-between mt-4">
             <div className="bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-1.5 rounded-lg">
              {v.yearStart} - {v.yearEnd}
             </div>
             <ChevronRight
              size={16}
              className="text-zinc-300 group-hover:text-blue-400 transition-colors"
             />
            </div>
           </div>
          ))}
         </div>

         <hr className="mt-8 border-zinc-100" />
        </div>
       ))}

       {vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
         <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center mb-4 text-blue-500 border border-blue-100">
          <CarFront size={32} />
         </div>
         <h3 className="text-xl font-bold text-[#19213d]">Sin vehículos compatibles</h3>
         <p className="text-zinc-500 mt-2 font-medium max-w-sm">
          No hay vehículos compatibles registrados para este producto.
         </p>
        </div>
       )}
      </>
     )}
    </div>
   </div>
  </div>
 );
}
