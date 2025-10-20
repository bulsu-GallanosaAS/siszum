import React, { useEffect, useMemo, useState } from 'react';
import { Package, RefreshCw, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import './Inventory.css';

interface ItemRow {
  id: number;
  name: string;
  buying_price: number;
  quantity_kg: number;
}

type NewItemForm = {
  name: string;
  buying_price: string;
  quantity_kg: string;
};

const RawInventory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<NewItemForm>({ name: '', buying_price: '', quantity_kg: '' });
  const [editItem, setEditItem] = useState<ItemRow | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/raw-inventory');
      const list: ItemRow[] = (res.data?.data || []).map((x: any) => ({
        id: x.id,
        name: x.name,
        buying_price: Number(x.buying_price || 0),
        quantity_kg: Number(x.quantity_kg || 0),
      }));
      setItems(list);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const totalOnHandValue = useMemo(() => {
    return items.reduce((sum, i) => sum + (Number(i.buying_price || 0) * Number(i.quantity_kg || 0)), 0);
  }, [items]);

  const lowStockItems = useMemo(() => {
    return items.filter((i) => Number(i.quantity_kg) < 1);
  }, [items]);

  const updateItem = async (id: number, payload: Partial<ItemRow>) => {
    setUpdatingId(id);
    try {
      await apiClient.put(`/raw-inventory/${id}`, payload);
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...payload } as ItemRow : p)));
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNewItem = async () => {
    if (!form.name.trim()) return alert('Please enter a product name');
    const rawName = form.name.trim();
    if (!form.buying_price || Number(form.buying_price) < 0) return alert('Enter valid buying price');
    if (!form.quantity_kg || Number(form.quantity_kg) < 0) return alert('Enter valid quantity (kg)');
    try {
      await apiClient.post('/raw-inventory', {
        name: rawName,
        buying_price: Number(form.buying_price),
        quantity_kg: Number(form.quantity_kg),
      });
      setShowAdd(false);
      setForm({ name: '', buying_price: '', quantity_kg: '' });
      fetchItems();
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message || 'Failed to save');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader" />
        <p>Loading inventory</p>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Inventory</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setShowAdd(true)} aria-label="Add product">
            <PlusCircle size={18} /> Add Product
          </button>
          <button className="add-btn" onClick={fetchItems} aria-label="Refresh inventory">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-content">
            <h3>{items.length}</h3>
            <p>Tracked Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-content">
            <h3>₱{totalOnHandValue.toFixed(2)}</h3>
            <p>Value on Hand</p>
          </div>
        </div>
        <div className={`stat-card ${lowStockItems.length > 0 ? 'warning' : ''}`}>
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-content">
            <h3>{lowStockItems.length}</h3>
            <p>Low Stock (&lt; 1 kg)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">{error}</div>
      )}

      <div className="products-container">
        <div className="products-header">
          <h3>Raw Inventory</h3>
        </div>
        <div className="products-table-container">
          <div className="responsive-table-wrapper">
            <table className="products-table" style={{ tableLayout: 'fixed', minWidth: 800 }}>
              <colgroup>
                <col />
                <col style={{ width: '140px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '140px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ whiteSpace: 'nowrap' }}>Product</th>
                  <th className="price" style={{ whiteSpace: 'nowrap' }}>Buying Price</th>
                  <th className="price" style={{ whiteSpace: 'nowrap' }}>Kilos</th>
                  <th className="actions" style={{ whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <p>No items yet. Click Add Product to create one.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-info">
                          <div className="product-name">{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="price">₱{Number(item.buying_price).toFixed(2)}</td>
                    <td className="price">{Number(item.quantity_kg).toFixed(3)} kg</td>
                    <td className="actions" style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="action-btn edit"
                        title="Edit"
                        disabled={updatingId === item.id}
                        onClick={() => setEditItem(item)}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete"
                        disabled={updatingId === item.id}
                        onClick={async () => {
                          if (!window.confirm(`Delete ${item.name}?`)) return;
                          setUpdatingId(item.id);
                          try {
                            await apiClient.delete(`/raw-inventory/${item.id}`);
                            setItems((prev) => prev.filter((p) => p.id !== item.id));
                          } catch (e: any) {
                            console.error(e);
                            alert(e?.response?.data?.message || 'Delete failed');
                          } finally {
                            setUpdatingId(null);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Product</h2>
              <button className="close-btn" onClick={() => setShowAdd(false)} aria-label="Close">×</button>
            </div>
            <div className="add-product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    placeholder="e.g., Chicken, Pork, Beef, Shrimp, Vegetables"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Buying Price (₱)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Enter buying price"
                    value={form.buying_price}
                    onChange={(e) => setForm((f) => ({ ...f, buying_price: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    placeholder="Enter quantity in kg"
                    value={form.quantity_kg}
                    onChange={(e) => setForm((f) => ({ ...f, quantity_kg: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="discard-btn" onClick={() => setShowAdd(false)}>Cancel</button>
                <button className="add-product-btn" onClick={saveNewItem}><PlusCircle size={18} /> Add Product</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="close-btn" onClick={() => setEditItem(null)} aria-label="Close">×</button>
            </div>
            <div className="add-product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={editItem.name}
                    onChange={(e) => setEditItem((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Buying Price (₱)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editItem.buying_price}
                    onChange={(e) => setEditItem((prev) => (prev ? { ...prev, buying_price: Number(e.target.value) } : prev))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={editItem.quantity_kg}
                    onChange={(e) => setEditItem((prev) => (prev ? { ...prev, quantity_kg: Number(e.target.value) } : prev))}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="discard-btn" onClick={() => setEditItem(null)}>Cancel</button>
                <button
                  className="add-product-btn"
                  onClick={async () => {
                    if (!editItem) return;
                    if (!editItem.name.trim()) return alert('Name is required');
                    if (editItem.buying_price < 0) return alert('Buying price must be >= 0');
                    if (editItem.quantity_kg < 0) return alert('Kilos must be >= 0');
                    await updateItem(editItem.id, {
                      name: editItem.name.trim(),
                      buying_price: editItem.buying_price,
                      quantity_kg: editItem.quantity_kg,
                    });
                    setEditItem(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RawInventory;
