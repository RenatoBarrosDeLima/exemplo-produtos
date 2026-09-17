import { Routes, Route } from 'react-router-dom';
import { ProductList } from './pages/ProductList';
import { ProductEditor } from './pages/ProductEditor';
import { ProductPage } from './pages/ProductPage';
import { UserList } from './pages/UserList';
import { UserForm } from './pages/UserForm';

function App() {
  return (
    <Routes>
      {/* Produtos */}
      <Route path="/" element={<ProductList />} />
      <Route path="/products/new" element={<ProductEditor />} />
      <Route path="/products/:id/edit" element={<ProductEditor />} />
      <Route path="/products/:slug" element={<ProductPage />} />

      {/* Usuários */}
      <Route path="/users" element={<UserList />} />
      <Route path="/users/new" element={<UserForm />} />
      <Route path="/users/:id/edit" element={<UserForm />} />
    </Routes>
  );
}

export default App;
