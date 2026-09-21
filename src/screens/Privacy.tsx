import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

// Política de privacidad global (/privacidad, /privacidad?lang=en). No requiere sesión.
// Texto entre [[dobles corchetes]] = dato legal que debe completar la titularidad de Waack On.
// Formato en los textos: **negrita**, {mail} = correo de contacto, [[pendiente]].
const CONTACT = 'administrador@waack-on.com';

type Block = { t: 'p'; x: string } | { t: 'ul'; x: string[] } | { t: 'table'; head: string[]; rows: string[][] };
type Sec = { title: string; blocks: Block[] };
type Doc = { title: string; updated: string; intro: string; back: string; copy: string; home: string; sections: Sec[] };

const ES: Doc = {
  title: 'Política de privacidad',
  updated: 'Última actualización: 20 de septiembre de 2026',
  intro: 'Waack On es una plataforma global de entrenamiento y comunidad de baile, disponible para personas de todo el mundo. Esta página explica qué datos personales tratamos, para qué, con quién los compartimos y qué derechos tienes según el lugar donde vivas.',
  back: '← Volver a Waack On',
  copy: '© Waack On',
  home: 'Volver al inicio',
  sections: [
    { title: 'Quién es el responsable', blocks: [
      { t: 'p', x: 'El responsable del tratamiento es [[razón social o nombre del titular]], NIF/CIF/Tax ID [[número]], con domicilio en [[dirección postal, país]] («Waack On»). Representante en la UE/Reino Unido, si aplica: [[nombre y dirección]].' },
      { t: 'p', x: 'Para cualquier duda o para ejercer tus derechos escríbenos a {mail}.' } ] },
    { title: 'Qué datos tratamos', blocks: [
      { t: 'table', head: ['Categoría', 'Datos', 'Origen'], rows: [
        ['**Cuenta**', 'Correo electrónico y contraseña (cifrada en Firebase Authentication; nosotros nunca la vemos). Si entras con Google, recibimos tu nombre, correo y foto de tu cuenta de Google.', 'Tú, o tu cuenta de Google'],
        ['**Perfil**', 'Nombre, nombre de usuario, país, biografía, foto de perfil, rol (usuario, instructor, estudio o administrador) y fecha de alta.', 'Tú'],
        ['**Tus archivos**', 'Las fotos y videos que subes a tu almacenamiento personal, con su nombre, tamaño y fecha.', 'Tú'],
        ['**Solicitud de instructor o estudio/academia**', 'Tipo de cuenta, nombre artístico o del estudio, persona de contacto, país, ciudad, estilos, web o redes, descripción y estado de la solicitud.', 'Tú'],
        ['**Comunidad**', 'Lo que publiques en el muro, reels, chats y otras áreas comunitarias, y tus interacciones.', 'Tú'],
        ['**Pagos** (cuando estén disponibles)', 'País, moneda, plan contratado, importe, estado y referencia de la operación. Los datos completos de tu tarjeta o cuenta los gestiona el proveedor de pagos, no Waack On.', 'Tú y el proveedor de pagos'],
        ['**Datos técnicos**', 'Dirección IP, tipo de navegador y dispositivo, idioma y fecha y hora de acceso, registrados por la infraestructura que aloja el servicio.', 'Automático'],
      ] },
      { t: 'p', x: 'No recogemos categorías especiales de datos (salud, origen, creencias, etc.). Por favor, no las incluyas en tu biografía ni en tus publicaciones.' } ] },
    { title: 'Para qué los usamos y con qué base legal', blocks: [
      { t: 'ul', x: [
        '**Crear y gestionar tu cuenta**, mantener tu sesión y darte acceso a clases, lives, reels y demás funciones. Base: ejecución del contrato.',
        '**Guardar tu perfil y tus archivos** y mostrar tu perfil a otros usuarios con sesión. Base: ejecución del contrato.',
        '**Revisar tu solicitud** de cuenta de instructor o estudio y, si se aprueba, activar tu perfil profesional. Base: medidas precontractuales a petición tuya.',
        '**Procesar pagos y cumplir obligaciones fiscales** cuando contrates un plan. Base: ejecución del contrato y obligación legal.',
        '**Enviarte correos de servicio**, como restablecer la contraseña. Base: ejecución del contrato.',
        '**Proteger la plataforma**: prevenir abusos, fraude y accesos no autorizados y moderar contenido. Base: interés legítimo.',
        '**Cumplir obligaciones legales** y atender requerimientos de autoridades. Base: obligación legal.' ] },
      { t: 'p', x: 'Las bases indicadas corresponden al RGPD (UE/EEE) y al UK GDPR. En otros países tratamos tus datos con la base que reconozca su ley (consentimiento, necesidad contractual, interés legítimo u obligación legal). **No vendemos tus datos personales ni los compartimos para publicidad de terceros**, y no tomamos decisiones automatizadas que te afecten de forma significativa.' } ] },
    { title: 'Quién puede ver tus datos', blocks: [
      { t: 'ul', x: [
        '**Otros usuarios con sesión iniciada** pueden ver tu perfil: nombre, nombre de usuario, país, biografía, foto y rol. Tu correo no forma parte de tu perfil visible.',
        '**Tus fotos y videos** solo son accesibles para usuarios con sesión iniciada que tengan el enlace del archivo; la lista de tus archivos solo la ves tú. Tú decides qué subes y puedes borrarlo cuando quieras.',
        '**Tu solicitud de instructor o estudio** solo la ven tú y el equipo de administración de Waack On.',
        '**Lo que publiques en áreas comunitarias** será visible para los usuarios de esas áreas. Piénsalo antes de publicar.' ] } ] },
    { title: 'Proveedores y transferencias internacionales', blocks: [
      { t: 'p', x: 'Usamos servicios de **Google LLC** (Firebase Authentication, Cloud Firestore, Cloud Storage y Firebase Hosting) para alojar la web, autenticar usuarios y guardar datos y archivos; Google actúa como encargado del tratamiento. También cargamos tipografías desde Google Fonts, por lo que tu navegador se conecta a servidores de Google y les comunica tu dirección IP.' },
      { t: 'p', x: 'Como Waack On es un servicio global, **tus datos pueden tratarse en Estados Unidos y en otros países** donde operan nuestros proveedores (nuestro almacenamiento de archivos está en la región us-central1). Cuando la ley de tu país lo exige, aplicamos garantías adecuadas: el Marco de Privacidad de Datos UE–EE. UU., las cláusulas contractuales tipo de la Comisión Europea y el anexo del Reino Unido, u otros mecanismos reconocidos por la ley aplicable. Fuera de estos proveedores, los procesadores de pago y las obligaciones legales, no cedemos tus datos a terceros.' } ] },
    { title: 'Pagos y medios de pago', blocks: [
      { t: 'p', x: 'Cuando actives un plan de pago, el cobro lo procesará un proveedor de pagos externo certificado PCI DSS, que mostrará los medios de pago disponibles **según tu país y tu moneda** (por ejemplo, tarjetas, billeteras digitales, transferencias bancarias y métodos locales). Waack On **no almacena los datos completos de tu tarjeta ni tus credenciales bancarias**: solo recibimos la confirmación del pago, el importe, la moneda, tu país y una referencia de la operación.' },
      { t: 'p', x: 'Los impuestos aplicables (IVA, GST, sales tax u otros) se calculan según tu país y se muestran antes de pagar. Conservamos facturas y registros de pago durante los plazos que exijan las normas fiscales y contables.' } ] },
    { title: 'Cuánto tiempo los conservamos', blocks: [
      { t: 'ul', x: [
        'Datos de cuenta, perfil y archivos: **mientras tu cuenta esté activa**.',
        'Cuando pidas eliminar tu cuenta, borraremos tus datos y archivos en el plazo máximo de 30 días, salvo lo que debamos conservar por obligación legal (por ejemplo, registros de facturación).',
        'Solicitudes de instructor o estudio rechazadas: se eliminan cuando dejen de ser necesarias.',
        'Registros técnicos: el tiempo que establezca el proveedor de infraestructura.' ] } ] },
    { title: 'Tus derechos, según dónde vivas', blocks: [
      { t: 'p', x: 'Escríbenos a {mail} para ejercer tus derechos. Los atendemos en el plazo que fije tu ley local y, en todo caso, en un máximo de 30 días. Puedes editar gran parte de tus datos y borrar tus archivos tú mismo desde **Mi cuenta**. Estos son los derechos principales por región; si tu país no aparece, respetaremos los que reconozca su ley:' },
      { t: 'table', head: ['Región / ley', 'Derechos principales', 'Autoridad ante la que reclamar'], rows: [
        ['**Unión Europea y EEE** (RGPD)', 'Acceso, rectificación, supresión, limitación, portabilidad, oposición y retirar el consentimiento.', 'Autoridad de protección de datos de tu país (p. ej., AEPD en España, CNIL en Francia).'],
        ['**Reino Unido** (UK GDPR)', 'Los mismos que el RGPD.', 'Information Commissioner’s Office (ICO).'],
        ['**EE. UU. – California** (CCPA/CPRA) y otros estados', 'Saber qué datos tenemos, acceder, corregir, eliminar, no ser discriminado y optar por no vender o compartir datos (no los vendemos ni compartimos).', 'California Privacy Protection Agency o el fiscal general de tu estado.'],
        ['**Brasil** (LGPD)', 'Confirmación y acceso, corrección, anonimización, bloqueo o eliminación, portabilidad, información sobre compartición y revocar el consentimiento.', 'Autoridade Nacional de Proteção de Dados (ANPD).'],
        ['**México** (LFPDPPP)', 'Derechos ARCO: acceso, rectificación, cancelación y oposición.', 'Autoridad de protección de datos personales de México.'],
        ['**Colombia** (Ley 1581 de 2012)', 'Conocer, actualizar, rectificar y suprimir tus datos y revocar la autorización.', 'Superintendencia de Industria y Comercio (SIC).'],
        ['**Argentina** (Ley 25.326)', 'Acceso, rectificación y supresión.', 'Agencia de Acceso a la Información Pública (AAIP).'],
        ['**Chile, Perú, Uruguay y resto de Latinoamérica**', 'Acceso, rectificación, cancelación/supresión y oposición, según la ley local.', 'Autoridad nacional de protección de datos de tu país.'],
        ['**Canadá** (PIPEDA) y **Australia** (Privacy Act)', 'Acceso y corrección de tus datos y presentar quejas.', 'Office of the Privacy Commissioner (Canadá) / OAIC (Australia).'],
        ['**Resto del mundo**', 'Los derechos que reconozca la ley de tu país.', 'La autoridad de protección de datos de tu país.'],
      ] } ] },
    { title: 'Cookies y almacenamiento local', blocks: [
      { t: 'p', x: 'Solo usamos almacenamiento técnico necesario del navegador, por ejemplo para mantener tu sesión iniciada a través de Firebase. No usamos cookies de publicidad ni de analítica de terceros. Puedes borrar estos datos desde tu navegador, pero tendrás que volver a iniciar sesión.' } ] },
    { title: 'Seguridad', blocks: [
      { t: 'p', x: 'Protegemos tus datos con conexión cifrada (HTTPS), contraseñas cifradas, reglas de acceso que limitan qué puede leer y escribir cada usuario y roles con permisos diferenciados. Ningún sistema es infalible: usa una contraseña única y robusta y avísanos si detectas un uso indebido de tu cuenta. Si ocurre una brecha que te afecte, te lo notificaremos y avisaremos a las autoridades cuando la ley lo exija.' } ] },
    { title: 'Menores de edad', blocks: [
      { t: 'p', x: 'Waack On no está dirigido a menores de **13 años**, ni a menores de la edad mínima de consentimiento digital de su país cuando sea mayor (por ejemplo, 14 en España o hasta 16 en varios países de la UE), salvo que cuenten con el consentimiento de su madre, padre o tutor legal. Si detectamos una cuenta de un menor sin autorización, la eliminaremos.' } ] },
    { title: 'Idiomas y cambios en esta política', blocks: [
      { t: 'p', x: 'Publicamos esta política en español e inglés. Si hubiera diferencias entre versiones, prevalece la versión en [[español / inglés]]. Podemos actualizarla para reflejar cambios en el servicio o en la ley; publicaremos la versión vigente con su fecha y, si el cambio es importante, te avisaremos por correo o dentro de la app.' } ] },
  ],
};

const EN: Doc = {
  title: 'Privacy Policy',
  updated: 'Last updated: September 20, 2026',
  intro: 'Waack On is a global dance training and community platform available to people worldwide. This page explains what personal data we process, why, who we share it with, and what rights you have depending on where you live.',
  back: '← Back to Waack On',
  copy: '© Waack On',
  home: 'Back to home',
  sections: [
    { title: 'Who is responsible', blocks: [
      { t: 'p', x: 'The data controller is [[legal name or owner]], Tax ID [[number]], located at [[postal address, country]] (“Waack On”). EU/UK representative, if applicable: [[name and address]].' },
      { t: 'p', x: 'For any question or to exercise your rights, write to us at {mail}.' } ] },
    { title: 'What data we process', blocks: [
      { t: 'table', head: ['Category', 'Data', 'Source'], rows: [
        ['**Account**', 'Email address and password (encrypted in Firebase Authentication; we never see it). If you sign in with Google, we receive your name, email and photo from your Google account.', 'You, or your Google account'],
        ['**Profile**', 'Name, username, country, bio, profile photo, role (user, instructor, studio or administrator) and sign-up date.', 'You'],
        ['**Your files**', 'The photos and videos you upload to your personal storage, with their name, size and date.', 'You'],
        ['**Instructor or studio/academy application**', 'Account type, stage or studio name, contact person, country, city, styles, website or social links, description and application status.', 'You'],
        ['**Community**', 'What you post on the wall, reels, chats and other community areas, and your interactions.', 'You'],
        ['**Payments** (when available)', 'Country, currency, plan, amount, status and transaction reference. Your full card or account details are handled by the payment provider, not by Waack On.', 'You and the payment provider'],
        ['**Technical data**', 'IP address, browser and device type, language, and access date and time, logged by the infrastructure that hosts the service.', 'Automatic'],
      ] },
      { t: 'p', x: 'We do not collect special categories of data (health, origin, beliefs, etc.). Please do not include them in your bio or posts.' } ] },
    { title: 'Why we use it and on what legal basis', blocks: [
      { t: 'ul', x: [
        '**Create and manage your account**, keep you signed in and give you access to classes, lives, reels and other features. Basis: performance of a contract.',
        '**Store your profile and files** and show your profile to other signed-in users. Basis: performance of a contract.',
        '**Review your application** for an instructor or studio account and, if approved, activate your professional profile. Basis: pre-contractual steps at your request.',
        '**Process payments and meet tax obligations** when you buy a plan. Basis: performance of a contract and legal obligation.',
        '**Send you service emails**, such as password resets. Basis: performance of a contract.',
        '**Protect the platform**: prevent abuse, fraud and unauthorized access, and moderate content. Basis: legitimate interests.',
        '**Comply with legal obligations** and respond to requests from authorities. Basis: legal obligation.' ] },
      { t: 'p', x: 'The bases above refer to the GDPR (EU/EEA) and the UK GDPR. In other countries we process your data on the basis recognized by local law (consent, contractual necessity, legitimate interests or legal obligation). **We do not sell your personal data or share it for third-party advertising**, and we do not make automated decisions that significantly affect you.' } ] },
    { title: 'Who can see your data', blocks: [
      { t: 'ul', x: [
        '**Other signed-in users** can see your profile: name, username, country, bio, photo and role. Your email is not part of your visible profile.',
        '**Your photos and videos** are only accessible to signed-in users who have the file link; only you can see the list of your files. You decide what to upload and can delete it at any time.',
        '**Your instructor or studio application** is only visible to you and the Waack On administration team.',
        '**What you post in community areas** will be visible to users of those areas. Think before you post.' ] } ] },
    { title: 'Providers and international transfers', blocks: [
      { t: 'p', x: 'We use **Google LLC** services (Firebase Authentication, Cloud Firestore, Cloud Storage and Firebase Hosting) to host the site, authenticate users and store data and files; Google acts as our processor. We also load fonts from Google Fonts, so your browser connects to Google servers and shares your IP address with them.' },
      { t: 'p', x: 'Because Waack On is a global service, **your data may be processed in the United States and in other countries** where our providers operate (our file storage is in the us-central1 region). Where your country’s law requires it, we apply appropriate safeguards: the EU–US Data Privacy Framework, the European Commission’s standard contractual clauses and the UK addendum, or other mechanisms recognized by applicable law. Apart from these providers, payment processors and legal obligations, we do not disclose your data to third parties.' } ] },
    { title: 'Payments and payment methods', blocks: [
      { t: 'p', x: 'When you activate a paid plan, the charge will be processed by an external PCI DSS-certified payment provider, which will show the payment methods available **for your country and currency** (for example, cards, digital wallets, bank transfers and local methods). Waack On **does not store your full card details or bank credentials**: we only receive the payment confirmation, amount, currency, your country and a transaction reference.' },
      { t: 'p', x: 'Applicable taxes (VAT, GST, sales tax or others) are calculated based on your country and shown before you pay. We keep invoices and payment records for the periods required by tax and accounting rules.' } ] },
    { title: 'How long we keep it', blocks: [
      { t: 'ul', x: [
        'Account, profile and file data: **while your account is active**.',
        'When you ask us to delete your account, we will delete your data and files within 30 days, except what we must keep for legal reasons (for example, billing records).',
        'Rejected instructor or studio applications are deleted when no longer needed.',
        'Technical logs: for the period set by the infrastructure provider.' ] } ] },
    { title: 'Your rights, depending on where you live', blocks: [
      { t: 'p', x: 'Write to {mail} to exercise your rights. We respond within the time set by your local law and, in any case, within 30 days. You can edit much of your data and delete your files yourself from **My account**. These are the main rights by region; if your country is not listed, we will respect the rights its law recognizes:' },
      { t: 'table', head: ['Region / law', 'Main rights', 'Authority to complain to'], rows: [
        ['**European Union and EEA** (GDPR)', 'Access, rectification, erasure, restriction, portability, objection and withdrawal of consent.', 'Your country’s data protection authority (e.g., AEPD in Spain, CNIL in France).'],
        ['**United Kingdom** (UK GDPR)', 'The same as the GDPR.', 'Information Commissioner’s Office (ICO).'],
        ['**United States – California** (CCPA/CPRA) and other states', 'Know what data we hold, access, correct, delete, non-discrimination, and opt out of the sale or sharing of data (we neither sell nor share it).', 'California Privacy Protection Agency or your state attorney general.'],
        ['**Brazil** (LGPD)', 'Confirmation and access, correction, anonymization, blocking or deletion, portability, information about sharing, and revoking consent.', 'Autoridade Nacional de Proteção de Dados (ANPD).'],
        ['**Mexico** (LFPDPPP)', 'ARCO rights: access, rectification, cancellation and objection.', 'Mexico’s personal data protection authority.'],
        ['**Colombia** (Law 1581 of 2012)', 'Know, update, rectify and delete your data and revoke authorization.', 'Superintendencia de Industria y Comercio (SIC).'],
        ['**Argentina** (Law 25.326)', 'Access, rectification and deletion.', 'Agencia de Acceso a la Información Pública (AAIP).'],
        ['**Chile, Peru, Uruguay and the rest of Latin America**', 'Access, rectification, cancellation/deletion and objection, under local law.', 'Your country’s national data protection authority.'],
        ['**Canada** (PIPEDA) and **Australia** (Privacy Act)', 'Access to and correction of your data, and the right to complain.', 'Office of the Privacy Commissioner (Canada) / OAIC (Australia).'],
        ['**Rest of the world**', 'The rights recognized by your country’s law.', 'Your country’s data protection authority.'],
      ] } ] },
    { title: 'Cookies and local storage', blocks: [
      { t: 'p', x: 'We only use technical browser storage that is necessary, for example to keep you signed in through Firebase. We do not use advertising or third-party analytics cookies. You can clear this data from your browser, but you will need to sign in again.' } ] },
    { title: 'Security', blocks: [
      { t: 'p', x: 'We protect your data with encrypted connections (HTTPS), encrypted passwords, access rules that limit what each user can read and write, and roles with separate permissions. No system is infallible: use a unique, strong password and let us know if you notice misuse of your account. If a breach affects you, we will notify you and the authorities where the law requires it.' } ] },
    { title: 'Minors', blocks: [
      { t: 'p', x: 'Waack On is not directed at children under **13**, nor at those under their country’s digital age of consent where it is higher (for example, 14 in Spain or up to 16 in several EU countries), unless they have the consent of a parent or legal guardian. If we find an account of a minor without authorization, we will delete it.' } ] },
    { title: 'Languages and changes to this policy', blocks: [
      { t: 'p', x: 'We publish this policy in Spanish and English. If the versions differ, the [[Spanish / English]] version prevails. We may update it to reflect changes in the service or the law; we will publish the current version with its date and, if the change is important, notify you by email or in the app.' } ] },
  ],
};

const DOCS: Record<'es' | 'en', Doc> = { es: ES, en: EN };

const wrap: CSSProperties = { minHeight: '100vh', background: 'var(--ground)', color: 'var(--ink)', fontFamily: 'Geist,system-ui,sans-serif', padding: '48px 20px 80px' };
const box: CSSProperties = { maxWidth: 860, margin: '0 auto' };
const card: CSSProperties = { border: '1px solid var(--hair)', background: 'var(--glass)', backdropFilter: 'var(--lg-blur)', WebkitBackdropFilter: 'var(--lg-blur)', boxShadow: 'var(--lg-edge), var(--lg-lift)', borderRadius: 22, padding: '28px 30px', marginTop: 18 };
const h2: CSSProperties = { margin: '0 0 12px', fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' };
const pStyle: CSSProperties = { margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-2)' };
const liStyle: CSSProperties = { margin: '0 0 8px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-2)' };
const todo: CSSProperties = { background: 'rgba(245,197,24,.18)', borderRadius: 4, padding: '0 4px', color: 'var(--ink)' };
const th: CSSProperties = { textAlign: 'left', padding: '10px 12px', fontFamily: "'Geist Mono',monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-2)', borderBottom: '1px solid var(--hair)', verticalAlign: 'top' };
const td: CSSProperties = { padding: '10px 12px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)', borderBottom: '1px solid var(--hair-soft)', verticalAlign: 'top' };

// **negrita**, {mail}, [[pendiente]]
function rich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\{mail\}|\[\[[^\]]+\]\])/g).filter(Boolean).map((part, i) => {
    if (part === '{mail}') return <a key={i} href={`mailto:${CONTACT}`} style={{ color: 'var(--pink)' }}>{CONTACT}</a>;
    if (part.startsWith('**')) return <b key={i} style={{ color: 'var(--ink)' }}>{part.slice(2, -2)}</b>;
    if (part.startsWith('[[')) return <span key={i} style={todo}>[{part.slice(2, -2)}]</span>;
    return part;
  });
}

function initialLang(): 'es' | 'en' {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' || q === 'es') return q;
  return (navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
}

export default function Privacy() {
  const [lang, setLang] = useState<'es' | 'en'>(initialLang);
  const d = DOCS[lang];

  useEffect(() => {
    const dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, []);
  useEffect(() => {
    document.title = `${d.title} · Waack On`;
    document.documentElement.lang = lang;
  }, [lang, d.title]);

  const pill = (on: boolean): CSSProperties => ({ padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1px solid ' + (on ? 'var(--hair)' : 'transparent'), background: on ? 'var(--glass)' : 'transparent', color: on ? 'var(--ink)' : 'var(--ink-2)' });

  return (
    <div style={wrap}>
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--ink)' }}>
            <img src="/uploads/waack_on_gold_3d_depth.png" alt="Waack On" style={{ width: 54, height: 54, objectFit: 'contain' }} />
            <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>{d.back}</span>
          </a>
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, border: '1px solid var(--hair)', background: 'var(--glass-2)' }} role="group" aria-label="Language">
            <div style={pill(lang === 'es')} onClick={() => setLang('es')}>Español</div>
            <div style={pill(lang === 'en')} onClick={() => setLang('en')}>English</div>
          </div>
        </div>

        <h1 style={{ margin: '26px 0 8px', fontSize: 34, fontWeight: 800, letterSpacing: '-.02em' }}>{d.title}</h1>
        <p style={{ ...pStyle, marginBottom: 0 }}>{d.updated}</p>
        <p style={{ ...pStyle, marginTop: 14 }}>{d.intro}</p>

        {d.sections.map((sec, i) => (
          <section key={i} style={card} id={`s${i + 1}`}>
            <h2 style={h2}>{i + 1}. {sec.title}</h2>
            {sec.blocks.map((b, j) => {
              if (b.t === 'p') return <p key={j} style={pStyle}>{rich(b.x)}</p>;
              if (b.t === 'ul') return <ul key={j} style={{ margin: '0 0 12px', paddingLeft: 20 }}>{b.x.map((x, k) => <li key={k} style={liStyle}>{rich(x)}</li>)}</ul>;
              return (
                <div key={j} style={{ overflowX: 'auto', margin: '0 0 12px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                    <thead><tr>{b.head.map((h, k) => <th key={k} style={th}>{h}</th>)}</tr></thead>
                    <tbody>{b.rows.map((r, k) => <tr key={k}>{r.map((c, m) => <td key={m} style={td}>{rich(c)}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              );
            })}
          </section>
        ))}

        <p style={{ ...pStyle, marginTop: 26, textAlign: 'center', fontSize: 12.5 }}>{d.copy} · <a href="/" style={{ color: 'var(--pink)' }}>{d.home}</a></p>
      </div>
    </div>
  );
}
