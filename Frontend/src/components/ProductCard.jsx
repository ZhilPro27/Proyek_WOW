import React from 'react';
import { Card, Button } from 'react-bootstrap';

const ProductCard = ({ product, onAddClick }) => {
    return (
        <Card className="h-100 shadow-sm border-0 overflow-hidden">
            {/* Gambar */}
            <div style={{ height: '140px', overflow: 'hidden' }}>
                <Card.Img 
                    variant="top" 
                    src={product.imageUrl || 'https://via.placeholder.com/150'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            
            <Card.Body className="d-flex flex-column p-3">
                <Card.Title className="fs-6 fw-bold mb-1 text-truncate">
                    {product.name}
                </Card.Title>
                
                {/* Deskripsi Singkat */}
                <Card.Text className="text-muted small mb-3 text-truncate">
                    {product.description || 'Menu lezat khas Warmindo W.O.W'}
                </Card.Text>

                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-warmindo">
                        Rp {parseInt(product.basePrice).toLocaleString('id-ID')}
                    </span>
                    <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => onAddClick(product)}
                    >
                        + Tambah
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;