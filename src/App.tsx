import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/auth-context';
import { Login } from './pages/login';
import { Products } from './pages/products';
import { ProtectedRoute } from './components/protected-route';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <Products />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/products" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;