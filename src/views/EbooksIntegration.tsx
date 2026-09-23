// Ebooks Integration — Conexión con Firebase para Recursos y Literatura
// Maneja Firestore, Storage, y Stripe Checkout
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';

interface Product {
  id: string;
  title: string;
  author: string;
  format: string;
  price: number;
  desc: string;
  spine: string;
  inCart?: boolean;
}

interface DocItem {
  id: string;
  title: string;
  author: string;
  format: string;
  spine: string;
  downloadUrl?: string;
  createdAt?: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

/**
 * Hook para manejar carrito en Firestore (sincronizado entre dispositivos)
 */
export function useShoppingCart(userId: string) {
  const [cart, setCart] = useState<Map<string, CartItem>>(new Map());
  const [syncing, setSyncing] = useState(false);

  // Cargar carrito desde Firestore
  useEffect(() => {
    if (!userId) return;
    loadCart();
  }, [userId]);

  const loadCart = async () => {
    try {
      setSyncing(true);
      const cartData = await api<Record<string, CartItem>>('GET', `/store/cart/${userId}`);
      if (cartData) {
        setCart(new Map(Object.entries(cartData)));
      }
    } catch (err) {
      console.error('Error cargando carrito:', err);
    } finally {
      setSyncing(false);
    }
  };

  const updateCart = async (productId: string, quantity: number) => {
    const newCart = new Map(cart);
    if (quantity <= 0) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, { ...cart.get(productId)!, quantity });
    }
    setCart(newCart);

    // Sincronizar con Firebase
    try {
      await api('PUT', `/store/cart/${userId}`, Object.fromEntries(newCart));
    } catch (err) {
      console.error('Error actualizando carrito:', err);
    }
  };

  const checkout = async () => {
    try {
      setSyncing(true);
      const response = await api<{ sessionId: string }>('POST', `/payments/create-checkout-session`, {
        cartItems: Object.fromEntries(cart),
      });

      // Redirigir a Stripe Checkout
      if (response?.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${response.sessionId}`;
      }
    } catch (err) {
      console.error('Error en checkout:', err);
    } finally {
      setSyncing(false);
    }
  };

  return {
    cart,
    updateCart,
    checkout,
    syncing,
    total: Array.from(cart.values()).reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

/**
 * Hook para manejar documentos del instructor en Firestore + Storage
 */
export function useInstructorDocuments(userId: string) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadDocuments();
  }, [userId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docsData = await api<DocItem[]>('GET', `/documents/instructor/${userId}`);
      setDocs(docsData || []);
    } catch (err) {
      console.error('Error cargando documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (data: {
    title: string;
    body?: string;
    file?: File;
    cover?: File;
    format: 'PDF' | 'Texto' | 'Slides';
    dest: 'libros' | 'tienda';
    price?: number;
  }) => {
    try {
      setLoading(true);

      // Si hay archivo, subirlo a Storage primero
      let fileUrl = '';
      if (data.file) {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('docId', Date.now().toString());

        // Usar endpoint que maneja multipart
        const uploadResponse = await fetch('/api/v1/documents/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${await auth?.currentUser?.getIdToken()}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('Error subiendo archivo');
        const uploadData = await uploadResponse.json();
        fileUrl = uploadData.url;
      }

      // Crear documento en Firestore
      const newDoc = await api<DocItem>('POST', '/documents/create', {
        title: data.title,
        body: data.body || '',
        fileUrl,
        format: data.format,
        dest: data.dest,
        price: data.price || 0,
      });

      setDocs([...docs, newDoc]);
      return newDoc;
    } catch (err) {
      console.error('Error subiendo documento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDocument = async (docId: string, updates: Partial<DocItem>) => {
    try {
      setLoading(true);
      const updated = await api<DocItem>('PUT', `/documents/${docId}`, updates);
      setDocs(docs.map((d) => (d.id === docId ? updated : d)));
      return updated;
    } catch (err) {
      console.error('Error actualizando documento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    try {
      setLoading(true);
      await api('DELETE', `/documents/${docId}`);
      setDocs(docs.filter((d) => d.id !== docId));
    } catch (err) {
      console.error('Error eliminando documento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    docs,
    loading,
    uploadDocument,
    updateDocument,
    deleteDocument,
    refresh: loadDocuments,
  };
}

/**
 * Hook para cargar productos de la tienda desde Firestore
 */
export function useStoreProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await api<Product[]>('GET', '/store/products');
      setProducts(productsData || getDefaultProducts());
    } catch (err) {
      console.error('Error cargando productos:', err);
      setProducts(getDefaultProducts());
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, refresh: loadProducts };
}

function getDefaultProducts(): Product[] {
  return [
    {
      id: 'p1',
      title: 'Arm Roll: Técnica Avanzada',
      author: 'Prof. García',
      format: 'PDF',
      price: 14.99,
      desc: 'Guía completa sobre la técnica del arm roll con ejercicios paso a paso.',
      spine: '#ff2d95',
    },
    {
      id: 'p2',
      title: 'Historia del Waacking',
      author: 'Historiador López',
      format: 'Epub',
      price: 9.99,
      desc: 'Recorrido histórico desde los orígenes hasta la actualidad.',
      spine: '#a855f7',
    },
    {
      id: 'p3',
      title: 'Anatomía del Movimiento',
      author: 'Dr. Martínez',
      format: 'PDF',
      price: 19.99,
      desc: 'Análisis biomecánico de cada movimiento del waacking.',
      spine: '#2ed9ff',
    },
    {
      id: 'p4',
      title: 'Coreografía Nivel Avanzado',
      author: 'Coreógrafa Silva',
      format: 'Video',
      price: 24.99,
      desc: 'Video tutorial de una coreografía profesional completa.',
      spine: '#39ff88',
    },
  ];
}
