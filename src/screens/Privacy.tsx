import { useEffect, type CSSProperties, type ReactNode } from 'react';

// Política de privacidad pública (/privacidad). No requiere sesión.
// Los textos entre [corchetes] son datos legales que debe completar la titularidad de Waack On.
const CONTACT = 'administrador@waack-on.com';
const UPDATED = '20 de septiembre de 2026';

const wrap: CSSProperties = { minHeight: '100vh', background: 'var(--ground)', color: 'var(--ink)', fontFamily: 'Geist,system-ui,sans-serif', padding: '48px 20px 80px' };
const box: CSSProperties = { maxWidth: 820, margin: '0 auto' };
const card: CSSProperties = { border: '1px solid var(--hair)', background: 'var(--glass)', backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)', boxShadow: 'var(--lg-edge), var(--lg-lift)', borderRadius: 22, padding: '28px 30px', marginTop: 18 };
const h2: CSSProperties = { margin: '0 0 12px', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' };
const p: CSSProperties = { margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-2)' };
const li: CSSProperties = { margin: '0 0 8px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' };
const todo: CSSProperties = { background: 'rgba(245,197,24,.18)', borderRadius: 4, padding: '0 4px', color: 'var(--ink)' };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontFamily: "'Geist Mono',monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-2)', borderBottom: '1px solid var(--hair)', verticalAlign: 'top' };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', borderBottom: '1px solid var(--hair-soft)', verticalAlign: 'top' };

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section style={card} id={`s${n}`}>
      <h2 style={h2}>{n}. {title}</h2>
      {children}
    </section>
  );
}

export default function Privacy() {
  useEffect(() => {
    document.title = 'Política de privacidad · Waack On';
    const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    window.scrollTo(0, 0);
  }, []);

  const mail = <a href={`mailto:${CONTACT}`} style={{ color: 'var(--pink)' }}>{CONTACT}</a>;

  return (
    <div style={wrap}>
      <div style={box}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
          <img src="/uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={{ width: 54, height: 54, objectFit: 'contain' }} />
          <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>← Volver a Waack On</span>
        </a>

        <h1 style={{ margin: '26px 0 8px', fontSize: 34, fontWeight: 800, letterSpacing: '-.02em' }}>Política de privacidad</h1>
        <p style={{ ...p, marginBottom: 0 }}>Última actualización: {UPDATED}</p>
        <p style={{ ...p, marginTop: 14 }}>
          En Waack On nos importa tu privacidad. Esta página explica, en lenguaje claro, qué datos personales tratamos cuando usas
          waack-on.com, para qué los usamos, con quién los compartimos y qué derechos tienes.
        </p>

        <Section n={1} title="Quién es el responsable">
          <p style={p}>El responsable del tratamiento de tus datos es <span style={todo}>[razón social o nombre del titular]</span>, con NIF/CIF <span style={todo}>[NIF]</span> y domicilio en <span style={todo}>[dirección postal]</span> (en adelante, «Waack On»).</p>
          <p style={{ ...p, marginBottom: 0 }}>Para cualquier duda o para ejercer tus derechos escríbenos a {mail}.</p>
        </Section>

        <Section n={2} title="Qué datos tratamos">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={th}>Categoría</th><th style={th}>Datos</th><th style={th}>Origen</th></tr>
            </thead>
            <tbody>
              <tr><td style={td}><b>Cuenta</b></td><td style={td}>Correo electrónico y contraseña. La contraseña se guarda cifrada en Firebase Authentication; nosotros nunca la vemos. Si entras con Google, recibimos tu nombre, correo y foto de tu cuenta de Google.</td><td style={td}>Tú, o tu cuenta de Google</td></tr>
              <tr><td style={td}><b>Perfil</b></td><td style={td}>Nombre, nombre de usuario, país, biografía, foto de perfil, rol (usuario, instructor, estudio o administrador) y fecha de alta.</td><td style={td}>Tú</td></tr>
              <tr><td style={td}><b>Tus archivos</b></td><td style={td}>Las fotos y videos que subes a tu almacenamiento personal, con su nombre, tamaño y fecha.</td><td style={td}>Tú</td></tr>
              <tr><td style={td}><b>Solicitud de instructor o estudio</b></td><td style={td}>Tipo de cuenta, nombre artístico o del estudio, persona de contacto, país, ciudad, estilos, web o Instagram, descripción y estado de la solicitud.</td><td style={td}>Tú</td></tr>
              <tr><td style={td}><b>Comunidad</b></td><td style={td}>El contenido que publiques en el muro, reels, chats y otras áreas comunitarias, y tus interacciones.</td><td style={td}>Tú</td></tr>
              <tr><td style={td}><b>Datos técnicos</b></td><td style={td}>Dirección IP, tipo de navegador, dispositivo y fecha y hora de acceso, registrados por la infraestructura que aloja el servicio.</td><td style={td}>Automático</td></tr>
            </tbody>
          </table>
          <p style={{ ...p, marginTop: 14, marginBottom: 0 }}>No recogemos datos de pago en esta web ni categorías especiales de datos. Por favor, no las incluyas en tu biografía ni en tus publicaciones.</p>
        </Section>

        <Section n={3} title="Para qué los usamos y con qué base legal">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={li}><b>Crear y gestionar tu cuenta</b>, mantener tu sesión y darte acceso a las clases, lives, reels y demás funciones. <i>Base: ejecución del contrato (art. 6.1.b RGPD).</i></li>
            <li style={li}><b>Guardar tu perfil y tus archivos</b> y mostrar tu perfil a otros usuarios con sesión. <i>Base: ejecución del contrato.</i></li>
            <li style={li}><b>Revisar tu solicitud</b> de cuenta de instructor o estudio y, si se aprueba, activar tu perfil profesional. <i>Base: aplicación de medidas precontractuales a petición tuya (art. 6.1.b).</i></li>
            <li style={li}><b>Enviarte correos de servicio</b>, como el de restablecer tu contraseña. <i>Base: ejecución del contrato.</i></li>
            <li style={li}><b>Proteger la plataforma</b>: prevenir abusos, fraude y accesos no autorizados y moderar contenido. <i>Base: interés legítimo (art. 6.1.f).</i></li>
            <li style={li}><b>Cumplir obligaciones legales</b> y atender requerimientos de autoridades. <i>Base: obligación legal (art. 6.1.c).</i></li>
          </ul>
          <p style={{ ...p, marginTop: 12, marginBottom: 0 }}>No vendemos tus datos ni los usamos para publicidad de terceros, y no tomamos decisiones automatizadas que te afecten de forma significativa.</p>
        </Section>

        <Section n={4} title="Quién puede ver tus datos">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={li}><b>Otros usuarios con sesión iniciada</b> pueden ver tu perfil: nombre, nombre de usuario, país, biografía, foto y rol. Tu correo no forma parte de tu perfil visible.</li>
            <li style={li}><b>Tus fotos y videos</b> solo son accesibles para usuarios con sesión iniciada que dispongan del enlace del archivo; la lista de tus archivos solo la ves tú. Tú decides qué subes y puedes borrarlo cuando quieras.</li>
            <li style={li}><b>Tu solicitud de instructor o estudio</b> solo la ven tú y el equipo de administración de Waack On.</li>
            <li style={li}><b>Lo que publiques en áreas comunitarias</b> será visible para los usuarios de esas áreas. Piénsalo antes de publicar.</li>
          </ul>
        </Section>

        <Section n={5} title="Con qué proveedores compartimos datos">
          <p style={p}>Usamos servicios de <b>Google LLC</b> (Firebase Authentication, Cloud Firestore, Cloud Storage y Firebase Hosting) para alojar la web, autenticar usuarios y guardar datos y archivos. Google actúa como encargado del tratamiento en nuestro nombre. También cargamos las tipografías desde Google Fonts, lo que implica que tu navegador se conecta a servidores de Google y les comunica tu dirección IP.</p>
          <p style={{ ...p, marginBottom: 0 }}>Los servidores de Google pueden estar fuera del Espacio Económico Europeo (por ejemplo, en Estados Unidos; nuestro almacenamiento de archivos está en la región us-central1). Estas transferencias se amparan en las garantías que ofrece Google, como el Marco de Privacidad de Datos UE–EE. UU. y las cláusulas contractuales tipo de la Comisión Europea. Fuera de estos proveedores y de las obligaciones legales, no cedemos tus datos a terceros.</p>
        </Section>

        <Section n={6} title="Cuánto tiempo los conservamos">
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={li}>Tus datos de cuenta, perfil y archivos, <b>mientras tu cuenta esté activa</b>.</li>
            <li style={li}>Cuando pidas la eliminación de tu cuenta, borraremos tus datos y archivos en el plazo máximo de un mes, salvo lo que debamos conservar bloqueado por obligación legal.</li>
            <li style={li}>Las solicitudes de instructor o estudio rechazadas se eliminan cuando dejen de ser necesarias.</li>
            <li style={li}>Los registros técnicos se conservan el tiempo que establece el proveedor de infraestructura.</li>
          </ul>
        </Section>

        <Section n={7} title="Tus derechos">
          <p style={p}>Puedes ejercer en cualquier momento los derechos de <b>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</b>, y retirar tu consentimiento cuando sea la base del tratamiento, escribiendo a {mail}. Responderemos en el plazo máximo de un mes. Puedes editar gran parte de tus datos y borrar tus archivos tú mismo desde <b>Mi cuenta</b>.</p>
          <p style={{ ...p, marginBottom: 0 }}>Si crees que no hemos tratado tus datos correctamente, puedes presentar una reclamación ante la autoridad de protección de datos de tu país; en España, la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pink)' }}>www.aepd.es</a>).</p>
        </Section>

        <Section n={8} title="Cookies y almacenamiento local">
          <p style={{ ...p, marginBottom: 0 }}>Solo usamos almacenamiento técnico necesario del navegador, por ejemplo para mantener tu sesión iniciada a través de Firebase. No usamos cookies de publicidad ni de analítica de terceros. Puedes borrar estos datos desde tu navegador, pero tendrás que volver a iniciar sesión.</p>
        </Section>

        <Section n={9} title="Seguridad">
          <p style={{ ...p, marginBottom: 0 }}>Protegemos tus datos con conexión cifrada (HTTPS), contraseñas cifradas, reglas de acceso que limitan qué puede leer y escribir cada usuario y roles con permisos diferenciados. Ningún sistema es infalible: usa una contraseña única y robusta y avísanos si detectas un uso indebido de tu cuenta.</p>
        </Section>

        <Section n={10} title="Menores de edad">
          <p style={{ ...p, marginBottom: 0 }}>Waack On no está dirigido a menores de <span style={todo}>[14]</span> años. Si eres menor de esa edad, no crees una cuenta sin el consentimiento de tu madre, padre o tutor legal. Si detectamos una cuenta de un menor sin autorización, la eliminaremos.</p>
        </Section>

        <Section n={11} title="Cambios en esta política">
          <p style={{ ...p, marginBottom: 0 }}>Podemos actualizar esta política para reflejar cambios en el servicio o en la ley. Publicaremos la versión vigente en esta página con su fecha de actualización y, si el cambio es importante, te lo avisaremos por correo o dentro de la app.</p>
        </Section>

        <p style={{ ...p, marginTop: 26, textAlign: 'center', fontSize: 12.5 }}>© Waack On · <a href="/" style={{ color: 'var(--pink)' }}>Volver al inicio</a></p>
      </div>
    </div>
  );
}
