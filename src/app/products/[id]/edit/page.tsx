"use client";

import { useEffect, useState, use } from "react";
import ProductForm from "@/components/ProductForm";
import { useProductStore } from "@/store/useProductStore";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { Loader2, AlertCircle } from "lucide-react";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { fetchProductById, updateProduct, loading, error } = useProductStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      const data = await fetchProductById(id);
      if (data) {
        setProduct(data);
      }
      setIsInitialLoading(false);
    };
    loadProduct();
  }, [id, fetchProductById]);

  const handleSubmit = async (data: any) => {
    const result = await updateProduct(id, data);
    if (result) {
      setIsSuccess(true);
      // Wait a moment so the user sees the success state before redirecting
      setTimeout(() => {
        router.push("/products");
        router.refresh();
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] gap-6 bg-white rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-[#19213d]">¡Producto Actualizado!</h3>
          <p className="text-zinc-500 font-bold mt-2">Los cambios se guardaron correctamente. Redirigiendo...</p>
        </div>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-[#19213d] animate-spin" />
        <p className="text-zinc-500 font-bold text-sm">Cargando datos del producto...</p>
      </div>
    );
  }

  if (!product && !isInitialLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-12 text-center border border-zinc-100">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-[#19213d]">Producto no encontrado</h3>
        <p className="text-zinc-500 text-sm mt-1">
          {error || "No se pudo encontrar el producto solicitado."}
        </p>
        <button
          onClick={() => router.push("/products")}
          className="mt-6 bg-[#19213d] text-white px-6 py-2 rounded-xl text-sm font-bold"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProductForm 
        key={product?.id}
        title={`Editar Producto: ${product?.name}`}
        initialData={product || undefined}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}
