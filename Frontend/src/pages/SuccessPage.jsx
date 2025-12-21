import React, { useRef, useState, useEffect } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPrint, FaFileDownload, FaHome, FaCheckCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const SuccessPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const receiptRef = useRef(null);

    // --- PERBAIKAN DI SINI ---
    // 1. Ambil data langsung saat inisialisasi state (Lazy Initialization)
    // Jadi tidak perlu setOrder lagi di useEffect
    const [order] = useState(state?.order || null);

    useEffect(() => {
        // 2. Gunakan useEffect HANYA untuk redirect jika data kosong
        if (!order) {
            toast.error("Data pesanan tidak ditemukan (Refresh)");
            navigate('/');
        }
    }, [order, navigate]);
    // -------------------------

    // Cegah render jika order kosong (sedang redirect)
    if (!order) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

    const handleDownloadPDF = async () => {
        const element = receiptRef.current;
        if(!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a6');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Nota-WOW-${order.tableNumber}.pdf`);
            toast.success("Nota berhasil diunduh!");
        } catch (err) {
            console.error(err);
            toast.error("Gagal membuat PDF");
        }
    };

    const handlePrintBluetooth = () => {
        let receiptText = 
`WARMINDO ORDER WAE (W.O.W)
--------------------------------
Meja: ${order.tableNumber}
Tgl : ${new Date(order.createdAt).toLocaleDateString()}
--------------------------------\n`;

        order.orderItems.forEach(item => {
            receiptText += `${item.product.name} x${item.quantity}\n`;
            if(item.variants && item.variants.length > 0){
                item.variants.forEach(v => {
                    receiptText += ` + ${v.variantName}\n`;
                });
            }
            receiptText += `Rp ${(parseFloat(item.priceAtOrder) * item.quantity).toLocaleString()}\n`;
        });

        receiptText += 
`--------------------------------
TOTAL: Rp ${parseInt(order.totalAmount).toLocaleString()}
Metode: ${order.paymentMethod.toUpperCase()}
Status: ${order.paymentStatus.toUpperCase()}
--------------------------------
Terima Kasih!
Simpan struk ini sebagai bukti.
\n\n`;

        const url = 'rawbt:' + encodeURIComponent(receiptText);
        window.location.href = url;
    };

    return (
        <Container className="py-5 mb-5" style={{ maxWidth: '400px' }}>
            <div className="text-center mb-4">
                <FaCheckCircle className="text-success" size={50} />
                <h4 className="fw-bold mt-2">Pesanan Berhasil!</h4>
                <p className="text-muted small">Mohon tunggu, pesanan Anda sedang disiapkan.</p>
            </div>

            <Card className="border-0 shadow-sm mb-4" ref={receiptRef}>
                <Card.Body className="p-4" style={{ backgroundColor: '#fff', fontFamily: 'Courier New, monospace' }}>
                    <div className="text-center mb-3 border-bottom pb-2">
                        <h5 className="fw-bold mb-0">W.O.W</h5>
                        <small>Warmindo Order Wae</small><br/>
                        <small>{new Date(order.createdAt).toLocaleString()}</small>
                    </div>

                    <div className="mb-3">
                        <div className="d-flex justify-content-between fw-bold">
                            <span>Meja {order.tableNumber}</span>
                            <span>#{order.id}</span>
                        </div>
                        <div className="small text-muted">Pemesan: {order.customerName || '-'}</div>
                    </div>

                    <div className="border-bottom border-top py-2 mb-2">
                        {order.orderItems.map((item, idx) => (
                            <div key={idx} className="mb-2">
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>{item.product.name}</span>
                                    <span>x{item.quantity}</span>
                                </div>
                                {item.variants && item.variants.length > 0 && (
                                    <div className="small text-muted ps-2">
                                        {item.variants.map(v => `+ ${v.variantName}`).join(', ')}
                                    </div>
                                )}
                                {item.notes && <div className="small text-muted fst-italic ps-2">"{item.notes}"</div>}
                                <div className="text-end small">
                                    Rp {parseInt(item.priceAtOrder).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between fw-bold fs-5 mt-3">
                        <span>TOTAL</span>
                        <span>Rp {parseInt(order.totalAmount).toLocaleString()}</span>
                    </div>
                    
                    <div className="text-center mt-3 small text-muted">
                        Status Bayar: <span className={order.paymentMethod === 'qris' ? 'text-warning' : 'text-success'}>
                            {order.paymentMethod.toUpperCase()}
                        </span>
                    </div>
                </Card.Body>
            </Card>

            <div className="d-grid gap-2">
                <Button variant="outline-dark" onClick={handleDownloadPDF}>
                    <FaFileDownload className="me-2" /> Download PDF
                </Button>
                
                <Button variant="dark" onClick={handlePrintBluetooth}>
                    <FaPrint className="me-2" /> Cetak (Bluetooth)
                </Button>
                
                <Button variant="danger" className="mt-2" onClick={() => navigate('/')}>
                    <FaHome className="me-2" /> Pesan Lagi
                </Button>
            </div>
        </Container>
    );
};

export default SuccessPage;