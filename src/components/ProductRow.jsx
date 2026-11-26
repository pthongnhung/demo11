import { categoryNames } from "../data/sample.js";

const formatPrice = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function ProductRow({
  product,
  categoryNames = {},
  onEdit,
  onDelete,
}) {
  const isActive = product.status === "active";

  return (
    <tr data-testid="product-row">
      <td data-label="Tên">{product.name}</td>
      <td data-label="SKU">{product.sku}</td>
      <td data-label="Danh mục">
        {categoryNames[product.category] ?? product.category}
      </td>
      <td data-label="Giá">{formatPrice.format(product.price)}</td>
      <td data-label="Tồn kho">
        {product.stock === 0 ? (
          <strong className="sold-out">Hết hàng</strong>
        ) : (
          product.stock
        )}
      </td>
      <td data-label="Trạng thái">
        <span
          data-testid="product-status"
          className={
            isActive ? "status status-active" : "status status-inactive"
          }
        >
          {isActive ? "Đang bán" : "Ngừng bán"}
        </span>
      </td>
      <td data-label="Thao tác">
        <div className="row-actions">
          <button
            type="button"
            data-testid="edit-button"
            onClick={() => onEdit?.(product.id)}
          >
            Sửa
          </button>
          <button
            type="button"
            className="delete-button"
            data-testid="delete-button"
            onClick={() => onDelete?.(product)}
          >
            Xoá
          </button>
        </div>
      </td>
    </tr>
  );
}
