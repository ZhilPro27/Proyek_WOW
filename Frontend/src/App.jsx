import React, { useState } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Row, Col, Badge } from 'react-bootstrap';
import { Toaster } from 'react-hot-toast';
import { FaShoppingCart, FaUtensils } from 'react-icons/fa';
import { useCart } from './context/CartContext'; 
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartPage from './pages/CartPage'; // <--- IMPORT HALAMAN BARU
import { useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import KitchenPage from './pages/KitchenPage';
import SuccessPage from './pages/SuccessPage';

// --- Komponen Dummy Halaman Menu ---
const Home = () => {
  const navigate = useNavigate(); // <--- Inisialisasi hook
  const { cartItems } = useCart(); // Ambil data cart untuk badge navbar
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // Contoh data menu (nanti kita ambil dari API)
  const products = [
    { 
        id: 1, 
        name: 'Indomie Goreng Spesial', 
        basePrice: 12000, 
        description: 'Indomie goreng lengkap dengan telur dan sayur.',
        imageUrl: 'https://images.unsplash.com/photo-1626804475297-411d8c6b7672?auto=format&fit=crop&q=80&w=300',
        variants: [
            { id: 101, name: 'Level 1-3 (Gratis)', extraPrice: 0 },
            { id: 102, name: 'Level 5 (+1k)', extraPrice: 1000 },
            { id: 103, name: 'Extra Telur (+3k)', extraPrice: 3000 }
        ]
    },
    { 
        id: 2, 
        name: 'Es Teh Manis Jumbo', 
        basePrice: 5000, 
        description: 'Teh manis dingin ukuran jumbo segernya pol.',
        variants: [] // Tanpa varian
    },
    { 
        id: 3, 
        name: 'Roti Bakar Coklat', 
        basePrice: 15000, 
        description: 'Roti bakar tebal dengan taburan coklat melimpah.',
        imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=300',
        variants: [
            { id: 201, name: 'Extra Keju', extraPrice: 4000 }
        ]
    },
  ];

  const handleShowProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
      <>
        {/* 1. Navbar */}
        <Navbar bg="white" sticky="top" className="shadow-sm border-bottom py-2">
          <Container>
            <Navbar.Brand href="#" className="text-warmindo fw-bold d-flex align-items-center">
              <FaUtensils className="me-2" /> W.O.W
            </Navbar.Brand>
            <Nav className="ms-auto">
              <Button 
                variant="danger" 
                className="position-relative btn-sm rounded-circle p-2"
                onClick={() => navigate('/cart')} // <--- TAMBAHKAN ONCLICK INI
            >
                <FaShoppingCart />
                {cartItems.length > 0 && (
                  <Badge bg="warning" text="dark" className="position-absolute top-0 start-100 translate-middle rounded-circle border border-light">
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Nav>
          </Container>
        </Navbar>

        {/* 2. List Menu */}
        <Container className="py-4 mb-5">
          <h5 className="fw-bold mb-3 border-start border-4 border-danger ps-2">Daftar Menu</h5>
          <Row>
            {products.map((item) => (
              <Col xs={6} md={4} className="mb-3 px-2" key={item.id}>
                {/* Panggil Komponen Card */}
                <ProductCard product={item} onAddClick={handleShowProduct} />
              </Col>
            ))}
          </Row>
        </Container>

        {/* 3. Modal Varian (Dipanggil sekali saja, datanya dinamis) */}
        <ProductModal 
          show={showModal} 
          onHide={() => setShowModal(false)} 
          product={selectedProduct} 
        />
      </>
    );
  };

  // ... (Login & App component tetap sama, pastikan CartProvider di main.jsx sudah terpasang)
  const Login = () => <Container className="mt-5"><h1>Halaman Login</h1></Container>;

  function App() {
    return (
      <BrowserRouter>
        <Toaster position="top-center" />
        <div className="min-h-screen bg-light max-w-md mx-auto shadow-sm border-x">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/success/:id" element={<SuccessPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    );
}

export default App;