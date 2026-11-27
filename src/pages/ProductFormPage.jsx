import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosClient.js";
import ProductForm from "../components/ProductForm.jsx";

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = id !== undefined;
  const [result, setResult] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };

    async function loadForm() {
      try {
        const [categories, product] = await Promise.all([
          api.get("/categories", config),
          editing ? api.get(`/products/${id}`, config) : null,
        ]);

        if (!controller.signal.aborted) {
          setResult({
            id,
            categories: categories.data,
            product: product?.data,
          });
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setResult({
          id,
          error:
            editing && err.response?.status === 404
              ? "Không tìm thấy sản phẩm"
              : (err.response?.data?.message ?? "Không tải được dữ liệu form."),
        });
      }
    }

    loadForm();
    return () => controller.abort();
  }, [id, editing]);

  async function saveProduct(payload) {
    if (editing) {
      await api.put(`/products/${id}`, payload);
    } else {
      await api.post("/products", payload);
    }

    navigate("/products", {
      state: { toast: editing ? "Đã sửa sản phẩm" : "Đã thêm sản phẩm" },
    });
  }

  if (!result || result.id !== id) return <p>Đang tải dữ liệu form…</p>;
  if (result.error) return <p role="alert">{result.error}</p>;

  return (
    <>
      <h1>{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h1>
      <ProductForm
        key={id ?? "new"}
        initialProduct={result.product}
        categories={result.categories}
        onSave={saveProduct}
      />
    </>
  );
}
