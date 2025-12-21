import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Navbar, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const KitchenPage = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    // Efek Suara Notifikasi (Pastikan volume laptop nyala)


    // 1. Load Data Awal
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/order');
                setOrders(response.data.data);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login'); // Tendang kalau belum login
                }
            }
        };
        fetchOrders();
    }, [navigate]);


    // 3. Fungsi Update Status
    const updateStatus = async (orderId, statusType, newStatus) => {
        try {
            // statusType: 'order_status' atau 'payment_status'
            const payload = statusType === 'order' 
                ? { order_status: newStatus } 
                : { payment_status: newStatus };

            await api.put(`/orders/${orderId}`, payload);

            // Update state lokal biar langsung berubah di layar
            setOrders((prev) => prev.map(o => {
                if (o.id === orderId) {
                    return statusType === 'order' 
                        ? { ...o, orderStatus: newStatus }
                        : { ...o, paymentStatus: newStatus };
                }
                return o;
            }));

            // Jika status 'completed', hapus dari layar (opsional)
            if (newStatus === 'completed') {
                setOrders((prev) => prev.filter(o => o.id !== orderId));
                toast.success("Order Selesai!");
            }

        } catch (error) {
            console.error(error);
            toast.error("Gagal update status");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-vh-100 bg-dark">
            {/* Header Dapur */}
            <Navbar bg="warning" variant="light" className="px-4 mb-4 shadow-sm">
                <Navbar.Brand className="fw-bold">👨‍🍳 Dapur W.O.W</Navbar.Brand>
                <Nav className="ms-auto">
                    <Button variant="outline-dark" size="sm" onClick={handleLogout}>Logout</Button>
                </Nav>
            </Navbar>

            <Container fluid className="px-4">
                <h4 className="text-white mb-4">Antrean Pesanan ({orders.length})</h4>
                
                <Row>
                    {orders.length === 0 && <p className="text-white-50">Belum ada pesanan aktif.</p>}
                    
                    {orders.map((order) => (
                        <Col key={order.id} md={6} lg={4} xl={3} className="mb-4">
                            <Card className="h-100 shadow border-0">
                                <Card.Header className={`d-flex justify-content-between align-items-center fw-bold ${order.orderStatus === 'pending' ? 'bg-danger text-white' : 'bg-primary text-white'}`}>
                                    <span>Meja {order.tableNumber}</span>
                                    <small>#{order.id}</small>
                                </Card.Header>
                                <Card.Body className="overflow-auto" style={{maxHeight: '300px'}}>
                                    <div className="mb-2 text-muted small">
                                        {new Date(order.createdAt).toLocaleTimeString()} 
                                        {order.customerName && ` - ${order.customerName}`}
                                    </div>
                                    
                                    {/* List Item */}
                                    <ul className="list-unstyled">
                                        {order.orderItems.map((item, idx) => (
                                            <li key={idx} className="border-bottom py-2">
                                                <div className="d-flex justify-content-between fw-bold">
                                                    <span>{item.quantity}x {item.product.name}</span>
                                                </div>
                                                {/* Varian */}
                                                {item.variants && item.variants.map(v => (
                                                    <div key={v.id} className="small text-primary ps-3">+ {v.variantName}</div>
                                                ))}
                                                {/* Catatan */}
                                                {item.notes && (
                                                    <div className="small text-danger fst-italic ps-3">"{item.notes}"</div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                                <Card.Footer className="bg-white">
                                    {/* Status Pembayaran */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <small className="text-muted">Pembayaran:</small>
                                        {order.paymentStatus === 'paid' ? (
                                            <Badge bg="success">LUNAS</Badge>
                                        ) : (
                                            <Button 
                                                size="sm" 
                                                variant="outline-warning"
                                                onClick={() => updateStatus(order.id, 'payment', 'paid')}
                                            >
                                                Verifikasi QRIS
                                            </Button>
                                        )}
                                    </div>

                                    {/* Tombol Aksi Masak */}
                                    <div className="d-grid gap-2">
                                        {order.orderStatus === 'pending' && (
                                            <Button variant="warning" onClick={() => updateStatus(order.id, 'order', 'processing')}>
                                                👨‍🍳 Mulai Masak
                                            </Button>
                                        )}
                                        {order.orderStatus === 'processing' && (
                                            <Button variant="success" onClick={() => updateStatus(order.id, 'order', 'completed')}>
                                                ✅ Selesai & Antar
                                            </Button>
                                        )}
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default KitchenPage;