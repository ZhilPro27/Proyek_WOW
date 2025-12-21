import React, { useState } from 'react';
import { Container, Card, Button, Form, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api'; // Pastikan file ini ada (dari langkah sebelumnya)

const CartPage = () => {
    const { cartItems, removeFromCart, getGrandTotal, clearCart } = useCart();
    const navigate = useNavigate();
    
    // State untuk Form Checkout
    const [loading, setLoading] = useState(false);
    const [tableNumber, setTableNumber] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash'); // Default Cash

    // Hitung Total
    const totalAmount = getGrandTotal();

    // Fungsi Kirim Order ke Backend
    const handleCheckout = async () => {
        // 1. Validasi Input
        if (!tableNumber) {
            toast.error("Mohon isi Nomor Meja!");
            return;
        }
        if (cartItems.length === 0) {
            toast.error("Keranjang kosong!");
            return;
        }

        setLoading(true);

        try {
            // 2. Susun Data sesuai Format Database Backend (Skenario B)
            const payload = {
                table_number: tableNumber,
                customer_name: customerName || 'Pelanggan',
                total_amount: totalAmount,
                payment_method: paymentMethod,
                payment_status: 'pending', // Default
                order_status: 'pending',   // Default
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.basePrice, // Kirim harga dasar (backend hitung ulang/simpan snapshot)
                    notes: item.notes,
                    // Mapping varian agar sesuai ekspektasi backend
                    variants: item.selectedVariants.map(v => ({
                        name: v.name,
                        price: v.extraPrice
                    }))
                }))
            };

            // 3. Tembak API POST /order
            const response = await api.post('/order', payload);

            // 4. Jika Sukses
            toast.success("Pesanan Berhasil Dibuat!");
            clearCart(); // Kosongkan keranjang
            
            // Arahkan ke Halaman Sukses (bawa ID order untuk cetak nota nanti)
            navigate(`/success/${response.data.data.id}`, { 
                state: { order: response.data.data } 
            });

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Gagal membuat pesanan");
        } finally {
            setLoading(false);
        }
    };

    // Tampilan jika keranjang kosong
    if (cartItems.length === 0) {
        return (
            <Container className="text-center py-5 mt-5">
                <h3>Keranjang Kosong 😢</h3>
                <p>Belum ada menu yang dipilih.</p>
                <Button variant="danger" onClick={() => navigate('/')}>
                    <FaArrowLeft className="me-2"/> Kembali ke Menu
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-4 mb-5">
            <h4 className="fw-bold mb-4">Konfirmasi Pesanan</h4>

            {/* 1. Daftar Item */}
            <Card className="shadow-sm border-0 mb-4">
                <ListGroup variant="flush">
                    {cartItems.map((item, index) => (
                        <ListGroup.Item key={index} className="py-3">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fw-bold">{item.name}</div>
                                    <div className="small text-muted">
                                        {item.quantity} x Rp {parseInt(item.basePrice).toLocaleString()}
                                    </div>
                                    
                                    {/* Tampilkan Varian jika ada */}
                                    {item.selectedVariants.length > 0 && (
                                        <div className="small text-info">
                                            + {item.selectedVariants.map(v => v.name).join(', ')}
                                        </div>
                                    )}

                                    {/* Tampilkan Catatan */}
                                    {item.notes && (
                                        <div className="small text-warning fst-italic">
                                            "{item.notes}"
                                        </div>
                                    )}
                                </div>
                                <div className="text-end">
                                    <div className="fw-bold mb-2">
                                        Rp {item.totalPriceItem.toLocaleString()}
                                    </div>
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => removeFromCart(index)}
                                    >
                                        <FaTrash />
                                    </Button>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                <Card.Footer className="bg-white text-end py-3">
                    <small>Total Bayar:</small>
                    <h5 className="fw-bold text-warmindo">Rp {totalAmount.toLocaleString()}</h5>
                </Card.Footer>
            </Card>

            {/* 2. Form Informasi Pesanan */}
            <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                    <h6 className="fw-bold mb-3">Informasi Meja</h6>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nomor Meja <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Contoh: 5" 
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Nama Pemesan (Opsional)</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Nama Anda" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Metode Pembayaran</Form.Label>
                            <Form.Select 
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="cash">Tunai (Bayar di Kasir)</option>
                                <option value="qris">QRIS (Scan Barcode)</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Card.Body>
            </Card>

            {/* 3. Tombol Aksi */}
            <div className="d-grid gap-2">
                <Button 
                    variant="danger" 
                    size="lg" 
                    onClick={handleCheckout}
                    disabled={loading}
                >
                    {loading ? <Spinner size="sm" animation="border" /> : `Pesan Sekarang - Rp ${totalAmount.toLocaleString()}`}
                </Button>
                <Button variant="outline-secondary" onClick={() => navigate('/')}>
                    Tambah Menu Lain
                </Button>
            </div>
        </Container>
    );
};

export default CartPage;