import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });
            
            // Simpan Token
            localStorage.setItem('token', response.data.token);
            
            // Redirect ke Dapur
            navigate('/kitchen');
        } catch (err) {
            setError(err.response?.data?.error || 'Login Gagal');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card className="shadow p-4" style={{ width: '400px' }}>
                <h3 className="text-center fw-bold text-warmindo mb-4">Staff Login</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </Form.Group>
                    <Button variant="danger" type="submit" className="w-100">
                        Masuk Dashboard
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default LoginPage;