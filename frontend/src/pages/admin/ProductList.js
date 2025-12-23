import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { notifyError, notifySuccess, confirmAction } from '../../utils/notify';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/product');
      setProducts(res.data);
    } catch (err) {
      console.error("Gagal ambil produk", err);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirmAction(
      'Hapus Menu?', 
      'Yakin ingin menghapus menu ini? Data tidak bisa dikembalikan.'
    );

    if (isConfirmed) {
      try {
        await api.delete(`/product/${id}`);
        notifySuccess('Menu berhasil dihapus');
        fetchProducts();
      } catch (err) {
        notifyError('Gagal menghapus menu');
      }
    }
  };

  // --- FITUR BARU: Toggle Status ---
  const handleToggleStatus = async (product) => {
    const newStatus = !product.is_available; 

    // Siapkan FormData
    const payload = { 
      is_available: newStatus ? 1 : 0 
    };

    // Optimistic Update
    const originalProducts = [...products];
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, is_available: newStatus } : p
    );
    setProducts(updatedProducts);

    try {
      // PERBAIKAN DI SINI:
      // Hapus object { headers: ... }
      // Biarkan Axios mengatur header otomatis karena kita mengirim instance FormData
      await api.put(`/product/${product.id}/availability`, payload);
      
      notifySuccess(`Status menu "${product.name}" diperbarui!`);
    } catch (err) {
      setProducts(originalProducts);
      notifyError('Gagal update status. Silakan coba lagi.');
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Daftar Menu</h2>
        <Link to="/admin/product/new" className="btn btn-primary">+ Tambah Menu</Link>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>No</th>
              <th>Foto</th>
              <th>Nama</th>
              <th>Harga Dasar</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>
                  {product.image_url ? (
                    <img 
                      src={`${process.env.API_IMAGE_URL}/${product.image_url}`} 
                      alt={product.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span className="text-muted small">No Image</span>
                  )}
                </td>
                <td>{product.name}</td>
                <td>Rp {parseInt(product.base_price).toLocaleString('id-ID')}</td>
                <td>
                    {/* --- TOGGLE SWITCH --- */}
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        role="switch" 
                        id={`switch-${product.id}`}
                        checked={!!product.is_available} // Pastikan boolean
                        onChange={() => handleToggleStatus(product)}
                        style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      />
                      <label 
                        className={`form-check-label small ms-2 fw-bold ${product.is_available ? 'text-success' : 'text-danger'}`} 
                        htmlFor={`switch-${product.id}`}
                        style={{cursor: 'pointer'}}
                      >
                        {product.is_available ? 'Tersedia' : 'Habis'}
                      </label>
                    </div>
                  </td>
                <td>
                  <Link to={`/admin/product/edit/${product.id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                  <button onClick={() => handleDelete(product.id)} className="btn btn-sm btn-danger">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;