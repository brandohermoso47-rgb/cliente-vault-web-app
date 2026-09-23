// Ebooks.tsx — Recursos y Literatura (5a + 6a) con Firebase Integration
// Tienda Premium + Gestor de contenido para instructores
import { Fragment, useState, useEffect } from 'react';
import { cx, pc, sty } from '../lib/dc';
import { api } from '../lib/api';
import { auth } from '../lib/firebase';
import { useShoppingCart, useInstructorDocuments, useStoreProducts } from './EbooksIntegration';

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
}

export default function Ebooks({ v }: { v: any }) {
  const user = auth?.currentUser;
  const userId = user?.uid || '';
  const isInstructor = v?.isInstructor || false; // Viene de la app shell

  const [role, setRole] = useState<'student' | 'instructor'>(isInstructor ? 'instructor' : 'student');
  const [tab, setTab] = useState<'store' | 'libros' | 'gestion'>('store');
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'pdf' | 'write' | 'slides'>('pdf');

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    file: null as File | null,
    cover: null as File | null,
    price: '',
    dest: 'libros' as 'libros' | 'tienda',
  });

  const [toast, setToast] = useState('');

  // Hooks de Firebase
  const { products, loading: productsLoading } = useStoreProducts();
  const { cart, updateCart, checkout, syncing: cartSyncing, total } = useShoppingCart(userId);
  const { docs, loading: docsLoading, uploadDocument, updateDocument } = useInstructorDocuments(userId);

  // Actualizar productos con estado del carrito
  const productsWithCart = products.map((p) => ({
    ...p,
    inCart: cart.has(p.id),
  }));

  const filteredProducts = productsWithCart.filter((p) => {
    if (filters.size === 0) return true;
    return filters.has(p.format.toLowerCase());
  });

  const handleToggleCart = async (productId: string) => {
    if (cart.has(productId)) {
      updateCart(productId, 0); // Remover
    } else {
      updateCart(productId, 1); // Agregar
    }
  };

  const handleToggleFilter = (format: string) => {
    const newFilters = new Set(filters);
    if (newFilters.has(format)) {
      newFilters.delete(format);
    } else {
      newFilters.add(format);
    }
    setFilters(newFilters);
  };

  const validateForm = (): string | null => {
    if (formData.title.trim().length < 4) return 'El título debe tener al menos 4 caracteres.';
    if (uploadMode === 'write' && formData.body.trim().length < 80) {
      return 'El contenido debe tener al menos 80 caracteres.';
    }
    if (uploadMode !== 'write' && !formData.file) {
      return 'Debes subir un archivo.';
    }
    if (formData.dest === 'tienda' && !formData.price) {
      return 'Debes indicar un precio para la tienda.';
    }
    return null;
  };

  const handlePublish = async () => {
    const error = validateForm();
    if (error) {
      setToast(error);
      setTimeout(() => setToast(''), 4000);
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadDocument({
        title: formData.title,
        body: formData.body,
        file: formData.file || undefined,
        cover: formData.cover || undefined,
        format: uploadMode === 'pdf' ? 'PDF' : uploadMode === 'write' ? 'Texto' : 'Slides',
        dest: formData.dest,
        price: formData.dest === 'tienda' ? parseFloat(formData.price) : 0,
      });
      setFormData({ title: '', body: '', file: null, cover: null, price: '', dest: 'libros' });
      setToast('✓ Contenido publicado correctamente');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);
      await checkout();
    } catch (err) {
      setToast(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setTimeout(() => setToast(''), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (docId: string) => {
    setEditingDocId(docId);
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingDocId(null);
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#07060c',
        fontFamily: "'Geist', system-ui, sans-serif",
        color: '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Fondo con orbes fluorescentes */}
      <div
        style={{
          position: 'absolute',
          inset: '-12%',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'blur(90px)',
          opacity: 0.8,
        }}
      >
        {[
          { left: '-4%', top: '-6%', w: 640, h: 520, color: '#ff2d95' },
          { left: '32%', top: '-14%', w: 560, h: 480, color: '#a855f7' },
          { right: '-6%', top: '4%', w: 600, h: 520, color: '#2ed9ff' },
          { left: '10%', bottom: '-16%', w: 620, h: 520, color: '#39ff88' },
          { right: '14%', bottom: '-12%', w: 520, h: 460, color: '#ff7a1a' },
        ].map((orb, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: orb.left,
              right: orb.right,
              top: orb.top,
              bottom: orb.bottom,
              width: orb.w,
              height: orb.h,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.color}, rgba(255,255,255,0) 70%)`,
            }}
          />
        ))}
      </div>

      {/* Velo oscurecedor */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(7,6,12,.45), rgba(7,6,12,.76))',
        }}
      />

      {/* Header glassmorphism */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 12,
          paddingRight: 12,
          background: 'linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,.05))',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35), 0 10px 32px -12px rgba(0,0,0,.8)',
          borderBottom: '1px solid rgba(255,255,255,.14)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              font: '900 12.5px/1 Geist, sans-serif',
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              color: '#fff',
            }}
          >
            WAACK ON
          </h1>
          <span style={{ font: '700 11px Geist Mono, monospace', color: 'rgba(255,255,255,.4)' }}>/</span>
          <span
            style={{
              font: '700 11px Geist Mono, monospace',
              color: '#ff5ec4',
              textTransform: 'uppercase',
              textShadow: '0 0 10px rgba(255,45,149,.7)',
            }}
          >
            RECURSOS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
          <span style={{ font: '700 9px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>Ver como</span>
          <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 99, background: 'rgba(0,0,0,.3)', border: '1px solid rgba(255,255,255,.16)' }}>
            {(['student', 'instructor'] as const).map((r) => (
              <div
                key={r}
                onClick={() => setRole(r)}
                style={{
                  cursor: 'pointer',
                  padding: '5px 12px',
                  borderRadius: 99,
                  font: '700 10px Geist Mono, monospace',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  background: role === r ? 'rgba(233,195,73,.24)' : 'transparent',
                  color: role === r ? '#E9C349' : 'rgba(255,255,255,.6)',
                }}
              >
                {r === 'student' ? 'Alumna' : 'Instructor'}
              </div>
            ))}
          </div>

          {/* Carrito */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(233,195,73,.5)', background: 'rgba(233,195,73,.12)' }}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#E9C349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h2l2.4 11h11L21 7H6.2" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></svg>
            <span style={{ font: '700 10px Geist Mono, monospace', color: '#f3dd93' }}>{cart.size}</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div
        style={{
          position: 'relative',
          zIndex: 4,
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Título y tabs */}
        <div
          style={{
            padding: '28px 40px 16px',
            borderBottom: '1px solid rgba(255,255,255,.14)',
            background: 'rgba(7,6,12,.4)',
          }}
        >
          <div style={{ maxWidth: 1120, margin: '0 auto' }}>
            <h2
              style={{
                margin: '0 0 16px',
                font: '700 24px/1.15 Geist, sans-serif',
                textTransform: 'uppercase',
                background: 'linear-gradient(96deg, #E9C349, #ff2d95 34%, #a855f7 58%, #2ed9ff 78%, #39ff88)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              RECURSOS Y LITERATURA
            </h2>
            <p style={{ margin: '0 0 16px', font: '500 11.5px/1.5 Geist, sans-serif', color: 'rgba(255,255,255,.75)' }}>
              Material literario original, historia de la cultura club y guías de anatomía del movimiento.
            </p>

            {/* Tabs */}
            <div
              style={{
                display: 'inline-flex',
                gap: 4,
                padding: 4,
                borderRadius: 99,
                background: 'linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,.16)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,.28)',
              }}
            >
              {role === 'student' && (
                <>
                  {(['store', 'libros'] as const).map((t) => (
                    <div
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 16px',
                        borderRadius: 99,
                        font: '700 11.5px Geist, sans-serif',
                        background: tab === t ? 'rgba(255,45,149,.24)' : 'transparent',
                        color: tab === t ? '#ff5ec4' : 'rgba(255,255,255,.6)',
                        border: tab === t ? '1px solid rgba(255,45,149,.5)' : '1px solid transparent',
                      }}
                    >
                      {t === 'store' ? 'Tienda Premium' : 'Libros de Estudio'}
                    </div>
                  ))}
                </>
              )}
              {role === 'instructor' && (
                <>
                  {(['gestion', 'libros'] as const).map((t) => (
                    <div
                      key={t}
                      onClick={() => setTab(t)}
                      style={{
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 16px',
                        borderRadius: 99,
                        font: '700 11.5px Geist, sans-serif',
                        background: tab === t ? 'rgba(57,255,136,.24)' : 'transparent',
                        color: tab === t ? '#9dffc8' : 'rgba(255,255,255,.6)',
                        border: tab === t ? '1px solid rgba(57,255,136,.5)' : '1px solid transparent',
                      }}
                    >
                      {t === 'gestion' ? 'Subir y Editar' : 'Libros de Estudio'}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ padding: '28px 40px 46px', maxWidth: 1120, margin: '0 auto', width: '100%' }}>
            {/* TAB: TIENDA PREMIUM (Alumna) */}
            {role === 'student' && tab === 'store' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: 24, alignItems: 'start' }}>
                {/* Productos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
                  {/* Filtros */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['pdf', 'epub', 'video'].map((fmt) => (
                      <span
                        key={fmt}
                        onClick={() => handleToggleFilter(fmt)}
                        style={{
                          cursor: 'pointer',
                          font: '700 9.5px Geist Mono, monospace',
                          letterSpacing: '.08em',
                          textTransform: 'uppercase',
                          padding: '5px 12px',
                          borderRadius: 99,
                          border: filters.has(fmt) ? `1px solid #2ed9ff` : '1px solid rgba(255,255,255,.3)',
                          background: filters.has(fmt) ? 'rgba(46,217,255,.2)' : 'transparent',
                          color: filters.has(fmt) ? '#2ed9ff' : 'rgba(255,255,255,.6)',
                        }}
                      >
                        {fmt.toUpperCase()}
                      </span>
                    ))}
                  </div>

                  {/* Grid de productos */}
                  {productsLoading ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,.6)' }}>Cargando productos...</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 20 }}>
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          style={{
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 20,
                            padding: '18px 18px 18px 26px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            background: 'linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04))',
                            backdropFilter: 'blur(26px) saturate(170%)',
                            WebkitBackdropFilter: 'blur(26px) saturate(170%)',
                            border: '1px solid rgba(255,255,255,.16)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.32), 0 24px 44px -22px rgba(0,0,0,.95)',
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 6,
                              background: p.spine,
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                            <span style={{ font: '700 8.5px Geist Mono, monospace', letterSpacing: '.07em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 99, border: '1px solid rgba(255,255,255,.28)', color: '#fff', background: 'rgba(255,255,255,.1)' }}>
                              {p.format}
                            </span>
                            <span style={{ whiteSpace: 'nowrap', font: '700 9.5px Geist Mono, monospace', color: 'rgba(255,255,255,.6)' }}>por {p.author}</span>
                          </div>
                          <h3 style={{ margin: 0, font: '700 16px/1.25 Geist, sans-serif', textTransform: 'uppercase', color: '#fff' }}>
                            {p.title}
                          </h3>
                          <p style={{ margin: 0, font: '500 11.5px/1.55 Geist, sans-serif', color: 'rgba(255,255,255,.76)' }}>{p.desc}</p>
                          <div style={{ marginTop: 6, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                            <span style={{ font: '700 18px Geist, sans-serif', color: '#f3dd93' }}>€{p.price.toFixed(2)}</span>
                            <div
                              onClick={() => handleToggleCart(p.id)}
                              style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '8px 15px',
                                borderRadius: 99,
                                font: '800 10.5px Geist, sans-serif',
                                letterSpacing: '.06em',
                                textTransform: 'uppercase',
                                background: p.inCart ? 'rgba(233,195,73,.24)' : 'transparent',
                                color: p.inCart ? '#E9C349' : '#fff',
                                border: '1px solid rgba(255,255,255,.4)',
                              }}
                            >
                              {p.inCart ? '✓ En carrito' : '+ Agregar'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Carrito lateral */}
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    padding: 20,
                    borderRadius: 20,
                    background: 'linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04))',
                    backdropFilter: 'blur(26px) saturate(170%)',
                    WebkitBackdropFilter: 'blur(26px) saturate(170%)',
                    border: '1px solid rgba(233,195,73,.35)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.32), 0 24px 44px -22px rgba(0,0,0,.95)',
                  }}
                >
                  <span style={{ font: '700 10px Geist Mono, monospace', letterSpacing: '.14em', textTransform: 'uppercase', color: '#E9C349' }}>
                    TU CARRITO
                  </span>
                  {cart.size === 0 ? (
                    <p style={{ margin: 0, font: '500 12px/1.55 Geist, sans-serif', color: 'rgba(255,255,255,.6)' }}>
                      Aún no has añadido nada.
                    </p>
                  ) : (
                    <>
                      {filteredProducts
                        .filter((p) => cart.has(p.id))
                        .map((p) => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.1)' }}>
                            <span style={{ font: '600 12px/1.35 Geist, sans-serif', color: '#fff' }}>{p.title}</span>
                            <span style={{ flex: 'none', font: '700 11px Geist Mono, monospace', color: '#f3dd93' }}>€{p.price.toFixed(2)}</span>
                          </div>
                        ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
                        <span style={{ font: '700 10px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>
                          TOTAL
                        </span>
                        <span style={{ font: '700 22px Geist, sans-serif', color: '#fff' }}>€{total.toFixed(2)}</span>
                      </div>
                      <div
                        onClick={handleCheckout}
                        style={{
                          cursor: cartSyncing || isSubmitting ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          padding: '11px 16px',
                          borderRadius: 99,
                          background: 'linear-gradient(120deg, #E9C349, #ffdd7a 45%, #c8a63f)',
                          border: '1px solid rgba(255,255,255,.45)',
                          boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.7), 0 6px 20px -6px rgba(233,195,73,.9)',
                          font: '800 11px Geist, sans-serif',
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          color: '#1e1707',
                          opacity: cartSyncing || isSubmitting ? 0.6 : 1,
                        }}
                      >
                        {isSubmitting ? 'Procesando...' : 'Pagar'}
                      </div>
                      <span style={{ font: '500 10.5px/1.5 Geist, sans-serif', color: 'rgba(255,255,255,.55)' }}>
                        Los títulos comprados aparecen en Libros de Estudio.
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB: LIBROS DE ESTUDIO (Ambos roles) */}
            {tab === 'libros' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
                {docsLoading ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,.6)' }}>Cargando libros...</div>
                ) : docs.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,.6)' }}>No hay libros disponibles.</div>
                ) : (
                  docs.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 18,
                        padding: '16px 16px 16px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        background: 'linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04))',
                        backdropFilter: 'blur(26px)',
                        WebkitBackdropFilter: 'blur(26px)',
                        border: '1px solid rgba(255,255,255,.16)',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 6,
                          background: d.spine,
                        }}
                      />
                      <span style={{ font: '700 8.5px Geist Mono, monospace', letterSpacing: '.07em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>
                        {d.format}
                      </span>
                      <h3 style={{ margin: 0, font: '700 14px/1.3 Geist, sans-serif', textTransform: 'uppercase', color: '#fff' }}>
                        {d.title}
                      </h3>
                      <span style={{ font: '700 9.5px Geist Mono, monospace', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)' }}>
                        {d.author}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: SUBIR Y EDITAR (Solo Instructor) */}
            {role === 'instructor' && tab === 'gestion' && !isEditing && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 5fr)', gap: 24, alignItems: 'start' }}>
                {/* Formulario de subida */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    padding: 22,
                    borderRadius: 20,
                    background: 'linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04))',
                    backdropFilter: 'blur(26px) saturate(170%)',
                    WebkitBackdropFilter: 'blur(26px) saturate(170%)',
                    border: '1px solid rgba(255,255,255,.16)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.32), 0 24px 44px -22px rgba(0,0,0,.95)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <span style={{ font: '700 16px Geist, sans-serif', textTransform: 'uppercase', color: '#fff' }}>
                      Subir contenido
                    </span>
                    <span style={{ font: '700 8.5px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9dffc8', border: '1px solid rgba(57,255,136,.45)', background: 'rgba(57,255,136,.12)', padding: '3px 9px', borderRadius: 99 }}>
                      Solo instructor
                    </span>
                  </div>

                  {/* Tabs de modo */}
                  <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(0,0,0,.28)', border: '1px solid rgba(255,255,255,.12)' }}>
                    {(['pdf', 'write', 'slides'] as const).map((mode) => (
                      <div
                        key={mode}
                        onClick={() => setUploadMode(mode)}
                        style={{
                          cursor: 'pointer',
                          flex: 1,
                          textAlign: 'center',
                          padding: '8px 10px',
                          borderRadius: 9,
                          font: '700 11px Geist, sans-serif',
                          background: uploadMode === mode ? 'rgba(255,45,149,.24)' : 'transparent',
                          color: uploadMode === mode ? '#ff5ec4' : 'rgba(255,255,255,.6)',
                          border: uploadMode === mode ? '1px solid rgba(255,45,149,.5)' : 'transparent',
                        }}
                      >
                        {mode === 'pdf' ? 'PDF' : mode === 'write' ? 'Escribir' : 'Slides'}
                      </div>
                    ))}
                  </div>

                  {/* Campo de título */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ font: '700 9.5px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>
                      Título
                    </span>
                    <input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej. Arm Roll: guía de técnica"
                      style={{
                        padding: '11px 13px',
                        borderRadius: 11,
                        background: 'rgba(0,0,0,.3)',
                        border: '1px solid rgba(255,255,255,.18)',
                        color: '#fff',
                        font: "500 13px 'Geist', sans-serif",
                        outline: 'none',
                      }}
                    />
                  </label>

                  {/* Modo: Escribir */}
                  {uploadMode === 'write' && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ font: '700 9.5px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>
                        Contenido · {formData.body.length} caracteres
                      </span>
                      <textarea
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        placeholder="Escribe el contenido aquí (mínimo 80 caracteres)…"
                        rows={7}
                        style={{
                          resize: 'vertical',
                          padding: '12px 13px',
                          borderRadius: 11,
                          background: 'rgba(0,0,0,.3)',
                          border: '1px solid rgba(255,255,255,.18)',
                          color: '#fff',
                          font: "400 13px/1.6 'Geist', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </label>
                  )}

                  {/* Modo: Archivo */}
                  {(uploadMode === 'pdf' || uploadMode === 'slides') && (
                    <label
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        padding: '26px 16px',
                        borderRadius: 14,
                        border: `1.5px dashed rgba(46,217,255,.5)`,
                        background: 'rgba(0,0,0,.22)',
                        textAlign: 'center',
                      }}
                    >
                      <input
                        type="file"
                        accept={uploadMode === 'pdf' ? '.pdf' : '.pptx,.odp,.key'}
                        onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                        style={{ display: 'none' }}
                      />
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#2ed9ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 16V4M7 9l5-5 5 5" />
                        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                      </svg>
                      <span style={{ font: '700 12.5px Geist, sans-serif', color: '#fff' }}>
                        {formData.file ? formData.file.name : 'Arrastra o selecciona'}
                      </span>
                      <span style={{ font: '500 10.5px Geist Mono, monospace', color: 'rgba(255,255,255,.55)' }}>
                        {uploadMode === 'pdf' ? 'PDF · máx. 50 MB' : 'PPTX, ODP, KEY · máx. 50 MB'}
                      </span>
                    </label>
                  )}

                  {/* Destino */}
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ font: '700 9.5px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>
                      Publicar en
                    </span>
                    <select
                      value={formData.dest}
                      onChange={(e) => setFormData({ ...formData, dest: e.target.value as 'libros' | 'tienda' })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 11,
                        background: '#1a1722',
                        border: '1px solid rgba(255,255,255,.18)',
                        color: '#fff',
                        font: "500 13px 'Geist', sans-serif",
                      }}
                    >
                      <option value="libros">Libros de Estudio (incluido)</option>
                      <option value="tienda">Tienda Premium (de pago)</option>
                    </select>
                  </label>

                  {/* Precio (si es tienda) */}
                  {formData.dest === 'tienda' && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <span style={{ font: '700 9.5px Geist Mono, monospace', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.65)' }}>
                        Precio (€)
                      </span>
                      <input
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="14,90"
                        style={{
                          width: 140,
                          padding: '11px 13px',
                          borderRadius: 11,
                          background: 'rgba(0,0,0,.3)',
                          border: '1px solid rgba(255,255,255,.18)',
                          color: '#fff',
                          font: "500 13px 'Geist', sans-serif",
                          outline: 'none',
                        }}
                      />
                    </label>
                  )}

                  {/* Errores */}
                  {toast && (
                    <div
                      style={{
                        padding: '10px 13px',
                        borderRadius: 11,
                        background: 'rgba(255,45,149,.14)',
                        border: '1px solid rgba(255,45,149,.5)',
                        font: '600 12px/1.5 Geist, sans-serif',
                        color: '#ffc2e6',
                      }}
                    >
                      {toast}
                    </div>
                  )}

                  {/* Botón publicar */}
                  <div
                    onClick={handlePublish}
                    style={{
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      padding: '12px 16px',
                      borderRadius: 99,
                      background: 'linear-gradient(120deg, #ff2d95, #a855f7)',
                      border: '1px solid rgba(255,255,255,.34)',
                      boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.45), 0 4px 18px -4px rgba(255,45,149,.8)',
                      font: '800 11.5px Geist, sans-serif',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: '#fff',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    {isSubmitting ? 'Publicando...' : 'Publicar'}
                  </div>
                </div>

                {/* Mis documentos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <span style={{ font: '700 10px Geist Mono, monospace', letterSpacing: '.14em', textTransform: 'uppercase', color: '#E9C349' }}>
                    Mis documentos · {docs.length}
                  </span>
                  {docsLoading ? (
                    <div style={{ color: 'rgba(255,255,255,.6)', font: '500 12px Geist' }}>Cargando...</div>
                  ) : (
                    docs.map((d) => (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 14,
                          borderRadius: 16,
                          background: 'linear-gradient(150deg, rgba(255,255,255,.13), rgba(255,255,255,.04))',
                          backdropFilter: 'blur(26px)',
                          WebkitBackdropFilter: 'blur(26px)',
                          border: '1px solid rgba(255,255,255,.16)',
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            alignSelf: 'stretch',
                            borderRadius: 3,
                            background: d.spine,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ font: '700 12.5px/1.3 Geist, sans-serif', textTransform: 'uppercase', color: '#fff' }}>
                            {d.title}
                          </span>
                          <span style={{ font: '700 9px Geist Mono, monospace', letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)' }}>
                            {d.format}
                          </span>
                        </div>
                        <div
                          onClick={() => handleEdit(d.id)}
                          style={{
                            cursor: 'pointer',
                            flex: 'none',
                            padding: '7px 13px',
                            borderRadius: 99,
                            border: '1px solid rgba(233,195,73,.55)',
                            background: 'rgba(233,195,73,.14)',
                            font: '700 10px Geist Mono, monospace',
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            color: '#f3dd93',
                          }}
                        >
                          Editar
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: EDITAR DOCUMENTO (Solo Instructor) */}
            {role === 'instructor' && tab === 'gestion' && isEditing && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  padding: 22,
                  borderRadius: 20,
                  background: 'linear-gradient(150deg, rgba(255,255,255,.14), rgba(255,255,255,.04))',
                  backdropFilter: 'blur(26px) saturate(170%)',
                  WebkitBackdropFilter: 'blur(26px) saturate(170%)',
                  border: '1px solid rgba(255,255,255,.16)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.32), 0 24px 44px -22px rgba(0,0,0,.95)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span
                    onClick={handleCloseEdit}
                    style={{
                      cursor: 'pointer',
                      font: '700 10px Geist Mono, monospace',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,.65)',
                    }}
                  >
                    ← Mis documentos
                  </span>
                  <span
                    style={{
                      font: '700 8.5px Geist Mono, monospace',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: '#7fe9ff',
                      border: '1px solid rgba(46,217,255,.45)',
                      background: 'rgba(46,217,255,.12)',
                      padding: '3px 9px',
                      borderRadius: 99,
                    }}
                  >
                    {docs.find((d) => d.id === editingDocId)?.format || 'PDF'}
                  </span>
                </div>

                <input
                  defaultValue={docs.find((d) => d.id === editingDocId)?.title || ''}
                  style={{
                    padding: '10px 0',
                    background: 'transparent',
                    border: '0',
                    borderBottom: '1px solid rgba(255,255,255,.2)',
                    color: '#fff',
                    font: "700 22px 'Geist', sans-serif",
                    textTransform: 'uppercase',
                    outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', gap: 6 }}>
                  {['B', 'I', 'U', 'Link'].map((tool) => (
                    <span
                      key={tool}
                      onClick={() => {}}
                      style={{
                        cursor: 'pointer',
                        padding: '6px 11px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,.08)',
                        border: '1px solid rgba(255,255,255,.16)',
                        font: '700 11px Geist Mono, monospace',
                        color: '#fff',
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <textarea
                  defaultValue="Contenido del documento editado..."
                  rows={14}
                  style={{
                    resize: 'vertical',
                    padding: '16px 18px',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,.32)',
                    border: '1px solid rgba(255,255,255,.16)',
                    color: '#fff',
                    font: "400 15px/1.75 'Geist', sans-serif",
                    outline: 'none',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <div
                    onClick={handleCloseEdit}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 18px',
                      borderRadius: 99,
                      border: '1px solid rgba(255,255,255,.22)',
                      font: '700 11px Geist, sans-serif',
                      textTransform: 'uppercase',
                      color: '#fff',
                    }}
                  >
                    Cancelar
                  </div>
                  <div
                    onClick={() => {
                      handleCloseEdit();
                      setToast('✓ Cambios guardados');
                      setTimeout(() => setToast(''), 2000);
                    }}
                    style={{
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      padding: '10px 18px',
                      borderRadius: 99,
                      background: 'linear-gradient(120deg, #E9C349, #ffdd7a 45%, #c8a63f)',
                      border: '1px solid rgba(255,255,255,.45)',
                      font: '800 11px Geist, sans-serif',
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: '#1e1707',
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    Guardar cambios
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 24,
              transform: 'translateX(-50%)',
              zIndex: 20,
              padding: '10px 18px',
              borderRadius: 99,
              background: 'rgba(20,18,28,.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(57,255,136,.5)',
              font: '600 12px Geist, sans-serif',
              color: '#9dffc8',
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
