import React, { useState } from 'react'; // Hapus useEffect dari import
import { Modal, Button, Form } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductModal = ({ show, onHide, product }) => {
    const { addToCart } = useCart();
    
    // State lokal
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedVariants, setSelectedVariants] = useState([]);

    // --- BAGIAN YANG DIUBAH (HAPUS useEffect LAMA) ---
    // Ganti dengan fungsi ini untuk reset state saat modal dibuka
    const handleReset = () => {
        setQuantity(1);
        setNotes('');
        setSelectedVariants([]);
    };
    // --------------------------------------------------

    if (!product) return null;

    // Hitung Total Harga
    const variantTotal = selectedVariants.reduce((sum, v) => sum + parseFloat(v.extraPrice), 0);
    const finalPrice = (parseFloat(product.basePrice) + variantTotal) * quantity;

    // Handle pilih varian
    const handleVariantChange = (variant, isChecked) => {
        if (isChecked) {
            setSelectedVariants([...selectedVariants, variant]);
        } else {
            setSelectedVariants(selectedVariants.filter(v => v.id !== variant.id));
        }
    };

    const handleSubmit = () => {
        addToCart(product, quantity, notes, selectedVariants);
        toast.success(`Berhasil menambahkan ${product.name}`);
        onHide();
    };

    return (
        // --- TAMBAHKAN prop onShow DI SINI ---
        <Modal 
            show={show} 
            onHide={onHide} 
            onShow={handleReset} // <--- Reset state saat modal muncul
            centered 
            size="sm"
        >
            <Modal.Header closeButton>
                <Modal.Title className="fs-6 fw-bold">{product.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Gambar Kecil */}
                <div className="text-center mb-3">
                    <img 
                        src={product.imageUrl || 'https://via.placeholder.com/150'} 
                        alt={product.name} 
                        className="rounded img-fluid" 
                        style={{ maxHeight: '150px', objectFit: 'cover' }}
                    />
                    <div className="mt-2 fw-bold text-warmindo">
                        Rp {parseFloat(product.basePrice).toLocaleString('id-ID')}
                    </div>
                </div>

                {/* Pilihan Varian */}
                {product.variants && product.variants.length > 0 && (
                    <div className="mb-3">
                        <label className="fw-bold small mb-2">Tambahan / Varian:</label>
                        {product.variants.map((variant) => (
                            <Form.Check 
                                key={variant.id}
                                type="checkbox"
                                id={`variant-${variant.id}`}
                                label={`${variant.name} (+${parseInt(variant.extraPrice).toLocaleString()})`}
                                // Tambahkan checked agar checkbox kereset visualnya juga
                                checked={selectedVariants.some(v => v.id === variant.id)}
                                onChange={(e) => handleVariantChange(variant, e.target.checked)}
                            />
                        ))}
                    </div>
                )}

                {/* Catatan */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small">Catatan Pesanan:</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={2} 
                        placeholder="Cth: Jangan pakai bawang..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    />
                </Form.Group>

                {/* Jumlah (Qty) */}
                <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded">
                    <span className="fw-bold small">Jumlah:</span>
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        >-</Button>
                        <span className="mx-3 fw-bold">{quantity}</span>
                        <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={() => setQuantity(q => q + 1)}
                        >+</Button>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <div className="text-start">
                    <small className="text-muted d-block">Total:</small>
                    <span className="fw-bold text-warmindo">Rp {finalPrice.toLocaleString('id-ID')}</span>
                </div>
                <Button variant="danger" onClick={handleSubmit}>
                    Masuk Keranjang
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductModal;