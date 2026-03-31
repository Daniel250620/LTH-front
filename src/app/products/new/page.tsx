"use client";

import ProductForm from "@/components/ProductForm";
import { useProductStore } from "@/store/useProductStore";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, loading } = useProductStore();

  const handleSubmit = async (data: any) => {
    const result = await createProduct(data);
    if (result) {
      router.push("/products");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProductForm 
        title="Crear Nuevo Producto"
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}
