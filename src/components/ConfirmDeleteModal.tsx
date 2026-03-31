import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-[#19213d] mb-2">
            Eliminar Producto
          </h3>
          <p className="text-zinc-500 text-sm mb-6">
            ¿Estás seguro de que deseas eliminar el producto <span className="font-bold text-[#19213d]">{productName}</span>? Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-500/20"
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
