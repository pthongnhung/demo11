import { useState } from 'react';

const inputFields = [
  { name: 'name', label: 'Tên sản phẩm', type: 'text' },
  { name: 'sku', label: 'SKU', type: 'text' },
  { name: 'price', label: 'Giá', type: 'number' },
  { name: 'stock', label: 'Tồn kho', type: 'number' },
];

function validate(form) {
  const errors = {};
  const name = form.name.trim();
  const price = Number(form.price);
  const stock = Number(form.stock);

  if (name.length < 3 || name.length > 100) {
    errors.name = 'Tên phải dài từ 3 đến 100 ký tự.';
  }
  if (!/^[A-Z]{3}-\d{4}$/.test(form.sku)) {
    errors.sku = 'SKU phải có dạng ABC-1234.';
  }
  if (!form.category) {
    errors.category = 'Hãy chọn danh mục.';
  }
  if (!form.price.trim() || !Number.isFinite(price) || price <= 0) {
    errors.price = 'Giá phải là số lớn hơn 0.';
  }
  if (!form.stock.trim() || !Number.isInteger(stock) || stock < 0) {
    errors.stock = 'Tồn kho phải là số nguyên không âm.';
  }

  return errors;
}

export default function ProductForm({ initialProduct, categories, onSave }) {
  const [form, setForm] = useState({
    name: initialProduct?.name ?? '',
    sku: initialProduct?.sku ?? '',
    category: initialProduct?.category ?? '',
    price: String(initialProduct?.price ?? ''),
    stock: String(initialProduct?.stock ?? ''),
    status: initialProduct?.status ?? 'active',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setFormError('');
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
      });
    } catch (err) {
      const { status, data } = err.response ?? {};
      if (status === 409) {
        setErrors({ sku: data?.message ?? 'SKU đã tồn tại.' });
      } else if (status === 400 && Object.hasOwn(form, data?.field)) {
        setErrors({ [data.field]: data.message ?? 'Giá trị không hợp lệ.' });
      } else {
        setFormError(data?.message ?? 'Không lưu được sản phẩm.');
      }
    } finally {
      setSaving(false);
    }
  }

  function renderError(name) {
    return errors[name] && (
      <p className="field-error" data-testid={`field-error-${name}`}>
        {errors[name]}
      </p>
    );
  }

  return (
    <form className="product-form" data-testid="product-form" onSubmit={handleSubmit} noValidate>
      {inputFields.map(({ name, label, type }) => (
        <div className="form-field" key={name}>
          <label htmlFor={`product-${name}`}>{label}</label>
          <input
            id={`product-${name}`}
            name={name}
            type={type}
            value={form[name]}
            onChange={handleChange}
          />
          {renderError(name)}
        </div>
      ))}

      <div className="form-field">
        <label htmlFor="product-category">Danh mục</label>
        <select id="product-category" name="category" value={form.category} onChange={handleChange}>
          <option value="">Chọn danh mục</option>
          {categories.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        {renderError('category')}
      </div>

      <div className="form-field">
        <label htmlFor="product-status">Trạng thái</label>
        <select id="product-status" name="status" value={form.status} onChange={handleChange}>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>
        {renderError('status')}
      </div>

      {formError && <p role="alert">{formError}</p>}
      <button className="add-button" type="submit" data-testid="submit-button" disabled={saving}>
        {saving ? 'Đang lưu…' : 'Lưu'}
      </button>
    </form>
  );
}