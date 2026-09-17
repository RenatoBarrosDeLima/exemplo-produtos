import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { ProductList } from './pages/ProductList';
import { ProductEditor } from './pages/ProductEditor';
import { ProductPage } from './pages/ProductPage';
import { UserList } from './pages/UserList';
import { UserForm } from './pages/UserForm';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Produtos — listagem e visualização são públicas */}
        <Route path="/" element={<ProductList />} />
        <Route path="/products/:slug" element={<ProductPage />} />

        {/* Produtos — criar e editar exigem login */}
        <Route path="/products/new" element={<PrivateRoute><ProductEditor /></PrivateRoute>} />
        <Route path="/products/:id/edit" element={<PrivateRoute><ProductEditor /></PrivateRoute>} />

        {/* Usuários — exigem login */}
        <Route path="/users" element={<PrivateRoute><UserList /></PrivateRoute>} />
        <Route path="/users/new" element={<PrivateRoute><UserForm /></PrivateRoute>} />
        <Route path="/users/:id/edit" element={<PrivateRoute><UserForm /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
