import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';

const OrderStatus = () => {
  const location = useLocation();
  const { orderId, customerName, tableNumber } = location.state || {};

  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true); // State loading awal

  useEffect(() => {
    if (!orderId) return;

    const fetchStatus = async () => {
      try {
        const res = await api.get(`/order/${orderId}/getStatus`);
        setStatus(res.data.order_status);
      } catch (err) {
        console.error("Gagal cek status", err);
      } finally {
        setLoading(false); // Matikan loading setelah fetch pertama selesai
      }
    };

    fetchStatus(); 
    const interval = setInterval(fetchStatus, 5000); 

    return () => clearInterval(interval); 
  }, [orderId]);

  // Tampilan jika orderId hilang
  if (!orderId) {
    return (
      <div className="container text-center pt-5">
        <h3>Data pesanan tidak ditemukan.</h3>
        <Link to="/customer/menu" className="btn btn-primary mt-3">Kembali ke Menu</Link>
      </div>
    );
  }

  // --- PERBAIKAN: Tampilkan Loading Screen ---
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-warning" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Mengambil status pesanan...</p>
      </div>
    );
  }
  // -------------------------------------------

  const getStatusDisplay = () => {
    switch (status) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Pesanan Diterima',
          desc: 'Mohon tunggu, pesananmu sedang dalam antrean.',
          color: 'bg-secondary'
        };
      case 'processing':
        return {
          icon: '👨‍🍳',
          title: 'Sedang Dimasak',
          desc: 'Koki kami sedang menyiapkan hidangan spesial untukmu!',
          color: 'bg-warning text-dark'
        };
      case 'completed':
        return {
          icon: '✅',
          title: 'Siap Disajikan',
          desc: 'Pesananmu sudah siap! Silakan nikmati.',
          color: 'bg-success'
        };
      case 'cancelled':
        return {
          icon: '❌',
          title: 'Pesanan Dibatalkan',
          desc: 'Maaf, pesanan ini telah dibatalkan.',
          color: 'bg-danger'
        };
      default:
        return { icon: '?', title: 'Status Tidak Diketahui', desc: '', color: 'bg-secondary' };
    }
  };

  const info = getStatusDisplay();

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100 px-4">
      <div className="text-center mb-5">
        <h1 className="fw-bold mb-0">Meja {tableNumber}</h1>
        <p className="text-muted">A.n. {customerName}</p>
      </div>

      <div className={`card border-0 shadow-lg text-white text-center p-4 w-100 ${info.color}`} style={{maxWidth: '400px', borderRadius: '20px'}}>
        <div style={{fontSize: '4rem', marginBottom: '10px'}}>{info.icon}</div>
        <h2 className="fw-bold">{info.title}</h2>
        <p className="mb-0 opacity-75">{info.desc}</p>
        
        {/* Loading Spinner Kecil (tetap ada untuk indikasi polling background) */}
        {status !== 'completed' && status !== 'cancelled' && (
          <div className="mt-4">
            <div className="spinner-border spinner-border-sm" role="status"></div>
            <small className="ms-2">Mengupdate status...</small>
          </div>
        )}
      </div>

      <div className="mt-5">
        <Link to={`/customer/menu?table=${tableNumber}`} className="btn btn-outline-dark rounded-pill px-4">
          📖 Pesan Menu Lain
        </Link>
      </div>
    </div>
  );
};

export default OrderStatus;