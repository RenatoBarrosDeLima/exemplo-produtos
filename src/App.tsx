import { Routes, Route } from 'react-router-dom';
import { ProductList } from './pages/ProductList';
import { ProductEditor } from './pages/ProductEditor';
import { ProductPage } from './pages/ProductPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/products/new" element={<ProductEditor />} />
      <Route path="/products/:id/edit" element={<ProductEditor />} />
      <Route path="/products/:slug" element={<ProductPage />} />
    </Routes>
  );
}

export default App;
