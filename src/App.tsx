import { useState } from 'react';
import type { Product } from './types/product';
import { ProductList } from './pages/ProductList';
import { ProductEditor } from './pages/ProductEditor';
import { ProductPage } from './pages/ProductPage';

type View =
  | { page: 'list' }
  | { page: 'editor'; product?: Product }
  | { page: 'view'; product: Product };

function App() {
  const [view, setView] = useState<View>({ page: 'list' });

  if (view.page === 'editor') {
    return (
      <ProductEditor
        initial={view.product}
        onBack={() => setView({ page: 'list' })}
        onSaved={(saved) => setView({ page: 'editor', product: saved })}
      />
    );
  }

  if (view.page === 'view') {
    return (
      <ProductPage
        product={view.product}
        onBack={() => setView({ page: 'list' })}
        onEdit={() => setView({ page: 'editor', product: view.product })}
      />
    );
  }

  return (
    <ProductList
      onNew={() => setView({ page: 'editor' })}
      onEdit={(p) => setView({ page: 'editor', product: p })}
      onView={(p) => setView({ page: 'view', product: p })}
    />
  );
}

export default App;
