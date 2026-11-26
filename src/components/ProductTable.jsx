import ProductRow from './ProductRow.jsx';

const columns = [
  'Tên', 'SKU', 'Danh mục', 'Giá', 'Tồn kho', 'Trạng thái', 'Thao tác',
];

export default function ProductTable({ products, categoryNames, onEdit, onDelete }) {
    
  return (
    <table className="product-table" data-testid="product-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            categoryNames={categoryNames}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  );
}