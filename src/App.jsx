import { Navigate, Route, Routes } from 'react-router-dom';
import ProductTable from './components/ProductTable.jsx';
import sampleProducts from './data/sample.js';

const products = [...sampleProducts].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);

function ProductsPage() {
  return (
    <>
      <div className="toolbar">
        <h1>Sản phẩm</h1>
        <button type="button" className="add-button" data-testid="add-button">
          Thêm sản phẩm
        </button>
      </div>

      <ProductTable products={products} />
    </>
  );
}

export default function App() {
  return (
    <>
      <header className="site-header">OfficeMart Admin</header>

      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </main>
    </>
  );
}