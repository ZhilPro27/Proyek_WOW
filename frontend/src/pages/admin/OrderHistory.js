import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { notifySuccess, notifyError, confirmAction } from '../../utils/notify';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, cancelled
  
  // State untuk Modal Detail
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter berjalan setiap kali orders atau filterStatus berubah
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.order_status === filterStatus));
    }
  }, [orders, filterStatus]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/order');
      // Urutkan dari yang terbaru (ID besar ke kecil atau created_at)
      const sorted = res.data.sort((a, b) => b.id - a.id);
      setFilteredOrders(sorted);
      setOrders(sorted);
    } catch (err) {
      console.error("Gagal ambil history", err);
    }
  };

  const handleShowDetail = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const updatePaymentStatus = async (orderId, currentStatus) => {
    // Toggle status: Jika 'pending' jadi 'paid', jika 'paid' jadi 'pending'
    const newStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    
    const isConfirmed = await confirmAction(
      'Ubah Status Pembayaran?', 
      `Ubah status menjadi ${newStatus.toUpperCase()}?`
    );
    
    if (isConfirmed) {
      try {
        await api.put(`/order/${orderId}/updatePayment`, { payment_status: newStatus });
        fetchOrders();
        notifySuccess(`Pembayaran berhasil diubah ke ${newStatus}`);
      } catch (err) {
        notifyError('Gagal update pembayaran');
      }
    }
  };

  const handleDelete = async (orderId) => {
    const isConfirmed = await confirmAction(
      'Hapus Pesanan?', 
      'Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.'
    );
    if (isConfirmed) {
      try {
        await api.delete(`/order/${orderId}`);
        fetchOrders();
        notifySuccess('Pesanan berhasil dihapus');
      } catch (err) {
        notifyError('Gagal menghapus pesanan');
      }
    }
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Riwayat Pesanan</h2>

      {/* --- Filter Controls --- */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex align-items-center gap-3">
          <label className="fw-bold">Filter Status:</label>
          <select 
            className="form-select w-auto" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="cancelled">Dibatalkan (Cancelled)</option>
            <option value="pending">Pending</option>
            <option value="processing">Sedang Dimasak</option>
          </select>
          
          <div className="ms-auto text-muted">
            Total Transaksi: <strong>{filteredOrders.length}</strong>
          </div>
        </div>
      </div>

      {/* --- Tabel Riwayat --- */}
      <div className="table-responsive card shadow-sm">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Waktu</th>
              <th>Meja</th>
              <th>Pelanggan</th>
              <th>Total Harga</th>
              <th>Pembayaran</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleString('id-ID')}</td>
                  <td>{order.table_number}</td>
                  <td>
                    {order.customer_name} <br/>
                    <span className="badge bg-light text-dark border">{order.location}</span>
                  </td>
                  <td className="fw-bold">Rp {parseInt(order.total_amount).toLocaleString('id-ID')}</td>
                  <td>
                      <div className="d-flex flex-column align-items-start gap-1">
                        {/* Tombol Badge yang bisa diklik */}
                        <button 
                          className={`btn btn-sm badge ${order.payment_status === 'paid' ? 'btn-success' : 'btn-danger'} border-0`}
                          onClick={() => updatePaymentStatus(order.id, order.payment_status)}
                          title="Klik untuk ubah status pembayaran"
                        >
                          {order.payment_status === 'paid' ? 'LUNAS (Paid)' : 'BELUM (Pending)'} 
                          <i className="bi bi-pencil-square ms-2"></i>
                        </button>
                        
                        <span className="text-muted small text-uppercase">
                          via {order.payment_method}
                        </span>
                      </div>
                    </td>
                  <td>
                    <span className={`badge ${
                      order.order_status === 'completed' ? 'bg-success' : 
                      order.order_status === 'cancelled' ? 'bg-danger' : 
                      'bg-warning text-dark'
                    }`}>
                      {order.order_status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-info text-white" onClick={() => handleShowDetail(order)}>
                      Detail
                    </button>
                    <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(order.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">Tidak ada data pesanan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Modal Detail (Custom CSS Bootstrap Modal) --- */}
      {showModal && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detail Pesanan #{selectedOrder.id}</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between mb-3">
                  <span><strong>Nama:</strong> {selectedOrder.customer_name}</span>
                  <span><strong>Meja:</strong> {selectedOrder.table_number}</span>
                </div>
                
                <ul className="list-group mb-3">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <li key={idx} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <span>{item.quantity}x {item.product_name}</span>
                        <span>Rp {parseInt(item.price_at_order * item.quantity).toLocaleString('id-ID')}</span>
                      </div>
                      
                      {/* Varian */}
                      {item.variants && item.variants.map((v, vIdx) => (
                        <small key={vIdx} className="text-muted d-block ms-3">
                          + {v.variant_name} (Rp {parseInt(v.variant_price).toLocaleString('id-ID')})
                        </small>
                      ))}

                      {/* Notes */}
                      {item.notes && <small className="text-danger d-block ms-3">Note: {item.notes}</small>}
                    </li>
                  ))}
                </ul>

                <h5 className="text-end">Total: Rp {parseInt(selectedOrder.total_amount).toLocaleString('id-ID')}</h5>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;