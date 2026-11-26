import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosClient.js";
import ProductTable from "../components/ProductTable.jsx";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [toast, setToast] = useState(location.state?.toast ?? "");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const [response, categoryResponse] = await Promise.all([
          api.get("/products", { params: { page: 1, limit: 10 }, signal }),
          api.get("/categories", { signal }),
        ]);

        if (signal.aborted) return;

        setProducts(response.data.data);
        setCategoryNames(
          Object.fromEntries(
            categoryResponse.data.map(({ id, name }) => [id, name]),
          ),
        );
      } catch (err) {
        if (!signal.aborted) {
          setError(err.response?.data?.message ?? "Không tải được sản phẩm.");
        }
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [reload]);

  async function confirmDelete() {
    if (!selectedProduct || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await api.delete(`/products/${selectedProduct.id}`);
      setSelectedProduct(null);
      setToast("Đã xoá sản phẩm");
      setReload((count) => count + 1);
    } catch (err) {
      setDeleteError(err.response?.data?.message ?? "Không xoá được sản phẩm.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="toolbar">
        <h1>Sản phẩm</h1>
        <button
          type="button"
          className="add-button"
          data-testid="add-button"
          onClick={() => navigate("/products/new")}
        >
          Thêm sản phẩm
        </button>
      </div>

      {toast && (
        <p role="status" data-testid="toast">
          {toast}
        </p>
      )}
      {loading && <p data-testid="loading">Đang tải sản phẩm…</p>}

      {!loading && error && (
        <div role="alert" data-testid="error-message">
          <p>{error}</p>
          <button
            type="button"
            data-testid="retry-button"
            onClick={() => setReload((count) => count + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p data-testid="empty-state">Không có sản phẩm.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <ProductTable
          products={products}
          categoryNames={categoryNames}
          onEdit={(id) => navigate(`/products/${id}/edit`)}
          onDelete={(product) => {
            if (deleting) return;
            setDeleteError("");
            setSelectedProduct(product);
          }}
        />
      )}

      {selectedProduct && (
        <section
          role="dialog"
          aria-labelledby="delete-title"
          data-testid="confirm-dialog"
        >
          <h2 id="delete-title">Xác nhận xoá</h2>
          <p>Bạn có muốn xoá {selectedProduct.name}?</p>
          {deleteError && <p role="alert">{deleteError}</p>}

          <button
            type="button"
            data-testid="confirm-no"
            disabled={deleting}
            onClick={() => setSelectedProduct(null)}
          >
            Huỷ
          </button>
          <button
            type="button"
            data-testid="confirm-yes"
            disabled={deleting}
            onClick={confirmDelete}
          >
            {deleting ? "Đang xoá…" : "Đồng ý"}
          </button>
        </section>
      )}
    </>
  );
}
