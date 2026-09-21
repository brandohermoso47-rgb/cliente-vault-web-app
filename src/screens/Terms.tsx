// Términos de servicio globales (/terminos, /terminos?lang=en). No requiere sesión.
// Texto entre [[dobles corchetes]] = dato legal que debe completar la titularidad de Waack On.
import LegalPage, { type Doc } from './LegalPage';

const ES: Doc = {
  title: 'Términos de servicio',
  updated: 'Versión 2026-09-21 · Última actualización: 21 de septiembre de 2026',
  intro: 'Estos términos regulan el uso de Waack On, una plataforma global de entrenamiento y comunidad de baile disponible en waack-on.com. Al crear una cuenta o usar el servicio aceptas estos términos y nuestra Política de privacidad. Si no estás de acuerdo, no uses Waack On.',
  back: '← Volver a Waack On',
  copy: '© Waack On',
  home: 'Volver al inicio',
  sections: [
    { title: 'Quiénes somos y cómo contactarnos', blocks: [
      { t: 'p', x: 'El servicio lo presta [[razón social o nombre del titular]], NIF/CIF/Tax ID [[número]], con domicilio en [[dirección postal, país]] («Waack On», «nosotros»). Para cualquier consulta escríbenos a {mail}.' } ] },
    { title: 'El servicio', blocks: [
      { t: 'p', x: 'Waack On ofrece clases y cursos grabados, transmisiones en vivo, un laboratorio de práctica, reels, podcasts, manuales y un espacio de comunidad (muro, retos, chats, batallas y ranking). Algunas funciones pueden estar en desarrollo o cambiar con el tiempo; podemos añadir, modificar o retirar funciones, avisándote con antelación razonable cuando el cambio te afecte de forma importante.' } ] },
    { title: 'Tu cuenta', blocks: [
      { t: 'ul', x: [
        '**Edad mínima:** debes tener al menos **13 años**, o la edad mínima de consentimiento digital de tu país si es mayor (por ejemplo, 14 en España o hasta 16 en varios países de la UE). Si eres menor, necesitas el consentimiento de tu madre, padre o tutor legal.',
        '**Datos veraces:** debes dar información exacta y mantenerla actualizada.',
        '**Seguridad:** eres responsable de tu contraseña y de lo que ocurra desde tu cuenta. Avísanos de inmediato si sospechas un uso no autorizado.',
        '**Una persona, una cuenta:** no puedes compartir tu cuenta ni suplantar a otra persona.',
        '**Correo verificado:** para pagar suscripciones, solicitar una cuenta profesional o cobrar debes verificar tu correo electrónico.' ] } ] },
    { title: 'Tipos de cuenta', blocks: [
      { t: 'ul', x: [
        '**Usuario:** entrena, participa en la comunidad y se suscribe a planes. Registro abierto para cualquier persona.',
        '**Instructor/a** y **Estudio o academia:** publican clases, cursos y lives. Estas cuentas se crean como usuario y requieren la **aprobación manual** de Waack On tras una solicitud. Podemos aprobarla, rechazarla o revocarla si dejas de cumplir estos términos.',
        'Los instructores y estudios son **profesionales independientes**: no son empleados, socios ni representantes de Waack On.' ] } ] },
    { title: 'Suscripciones, precios y pagos', blocks: [
      { t: 'ul', x: [
        'Los pagos los procesa un **proveedor de pagos externo**; los medios de pago disponibles dependen de tu país y moneda. No almacenamos los datos completos de tu tarjeta.',
        'Los precios se muestran antes de pagar, en tu moneda cuando es posible, e incluyen o añaden los impuestos aplicables según tu país.',
        'Las suscripciones **se renuevan automáticamente** cada mes o año hasta que las canceles. Puedes cancelar cuando quieras desde **Mi cuenta → Gestionar suscripciones**; mantendrás el acceso hasta el final del periodo ya pagado.',
        'Si un cobro falla, podemos reintentarlo y, si no se resuelve, suspender el acceso al contenido de pago.',
        'Si cambiamos un precio, te avisaremos con antelación suficiente y el cambio se aplicará en tu siguiente renovación; podrás cancelar antes.' ] } ] },
    { title: 'Desistimiento y reembolsos', blocks: [
      { t: 'p', x: 'Puedes solicitar un reembolso de tu primera suscripción en los primeros [[número]] días si aún no has usado el contenido de pago de forma sustancial. Para contenido digital y servicios con acceso inmediato, al contratar aceptas que empecemos a prestarlo enseguida y, cuando la ley de tu país lo permita, reconoces que pierdes el derecho de desistimiento una vez iniciada la prestación. Fuera de esos casos no se emiten reembolsos parciales por periodos ya iniciados.' },
      { t: 'p', x: '**Nada de lo anterior limita los derechos que la ley imperativa de tu país reconozca a los consumidores** (por ejemplo, el derecho de desistimiento de 14 días en la UE y el Reino Unido, salvo la excepción legal para contenido digital ya iniciado con tu consentimiento). Solicita reembolsos escribiendo a {mail}.' } ] },
    { title: 'Instructores y estudios: cobros', blocks: [
      { t: 'ul', x: [
        'Los cobros se gestionan con **Stripe Connect**: para recibir dinero debes completar el alta de Stripe con tus datos fiscales y bancarios, en tu país.',
        'Waack On retiene una comisión del [[porcentaje]] % sobre cada suscripción a tu perfil; el resto se te transfiere según las condiciones de Stripe.',
        'Eres responsable de tus **impuestos** (renta, IVA/GST u otros) y de emitir las facturas que la ley te exija.',
        'Garantizas que tienes todos los derechos sobre lo que publicas, incluidos los derechos de imagen, de voz y de música, y que tu contenido no infringe la ley ni derechos de terceros.' ] } ] },
    { title: 'Tu contenido', blocks: [
      { t: 'p', x: 'Conservas la **propiedad** de las fotos, videos, textos y demás contenido que subes o publicas. Nos concedes una licencia mundial, no exclusiva, gratuita y limitada para alojarlo, reproducirlo, adaptarlo técnicamente (por ejemplo, redimensionarlo) y mostrarlo **dentro de Waack On** a las personas a las que decidas mostrarlo, y para promocionar la plataforma con capturas de contenido público. La licencia termina cuando borras el contenido o tu cuenta, salvo copias de seguridad temporales y lo que ya se hubiera compartido.' },
      { t: 'p', x: '**Música:** no subas ni transmitas música, coreografías o videos de terceros sin la licencia necesaria. Eres responsable de los derechos de lo que publicas.' } ] },
    { title: 'Contenido de Waack On y propiedad intelectual', blocks: [
      { t: 'p', x: 'Las clases, cursos, manuales, diseños, marcas y software de Waack On y de sus instructores están protegidos por derechos de autor y otros derechos. Te damos una licencia **personal, limitada, revocable e intransferible** para verlos y usarlos para tu entrenamiento. No puedes copiarlos, grabarlos, redistribuirlos, venderlos, compartir tu acceso ni eludir los sistemas de acceso de pago.' } ] },
    { title: 'Uso aceptable', blocks: [
      { t: 'p', x: 'Está prohibido:' },
      { t: 'ul', x: [
        'acosar, amenazar, discriminar o promover el odio o la violencia;',
        'publicar contenido sexual explícito, violento o que ponga en riesgo a menores;',
        'suplantar identidades, engañar, hacer spam o cometer fraude;',
        'subir malware o intentar acceder sin permiso a cuentas, sistemas o datos;',
        'extraer datos de forma masiva (scraping), hacer ingeniería inversa o sobrecargar el servicio;',
        'compartir contenido de pago fuera de la plataforma;',
        'usar Waack On para actividades ilegales.' ] },
      { t: 'p', x: 'En batallas, retos y chats esperamos respeto entre bailarines. Podemos moderar, ocultar o eliminar contenido y limitar funciones.' } ] },
    { title: 'Directos y grabaciones', blocks: [
      { t: 'p', x: 'Las clases en vivo pueden **grabarse** y ofrecerse después bajo demanda. Al participar con cámara, micrófono o chat aceptas que tu imagen, voz y mensajes puedan aparecer en esa grabación. No grabes ni retransmitas las clases de otros sin permiso por escrito.' } ] },
    { title: 'Salud y actividad física', blocks: [
      { t: 'p', x: 'El baile y el entrenamiento físico implican **riesgo de lesión**. Waack On y sus instructores no prestan asesoramiento médico. Consulta a un profesional de la salud antes de empezar si tienes dudas sobre tu condición física, calienta y estira, entrena dentro de tus límites y para si sientes dolor. Participas bajo tu propia responsabilidad, sin perjuicio de los derechos que la ley te reconozca.' } ] },
    { title: 'Funciones de inteligencia artificial', blocks: [
      { t: 'p', x: 'Cuando estén disponibles, las funciones de análisis de postura y recomendaciones con IA serán **opcionales**, se activarán solo con tu consentimiento y ofrecen orientación general de entrenamiento: **no son un diagnóstico ni asesoramiento médico** y pueden contener errores. Su tratamiento de datos se explica en la Política de privacidad.' } ] },
    { title: 'Derechos de autor y retirada de contenido', blocks: [
      { t: 'p', x: 'Si crees que algo publicado en Waack On infringe tus derechos, escribe a {mail} con: quién eres, qué obra es tuya, dónde está el contenido (enlace) y una declaración de buena fe de que no está autorizado. Retiraremos el contenido que infrinja derechos y, si el autor lo disputa, podrá enviar una contranotificación. Suspenderemos las cuentas de infractores reincidentes.' } ] },
    { title: 'Suspensión y cancelación', blocks: [
      { t: 'ul', x: [
        '**Tú** puedes dejar de usar Waack On y pedir la eliminación de tu cuenta en cualquier momento escribiendo a {mail}. Cancela antes tus suscripciones activas.',
        '**Nosotros** podemos suspender o cerrar tu cuenta si incumples estos términos, por seguridad o por obligación legal, avisándote cuando sea posible y explicando el motivo.',
        'Al cerrar la cuenta pierdes el acceso al contenido de pago. Conservaremos solo lo que la ley nos obligue a guardar (por ejemplo, registros de facturación).' ] } ] },
    { title: 'Garantías y limitación de responsabilidad', blocks: [
      { t: 'p', x: 'Waack On se ofrece «tal cual» y «según disponibilidad»: no garantizamos que funcione sin interrupciones ni errores, ni que el contenido satisfaga un resultado concreto. En la máxima medida permitida por la ley, no respondemos de daños indirectos, pérdida de beneficios o de datos, ni de lo que hagan otros usuarios o instructores, y nuestra responsabilidad total frente a ti se limita a lo que hayas pagado a Waack On en los **12 meses** anteriores.' },
      { t: 'p', x: '**Esto no excluye ni limita** la responsabilidad que no pueda excluirse por ley, como la derivada de dolo o negligencia grave, del fallecimiento o daños personales causados por nuestra negligencia, ni los derechos irrenunciables de los consumidores de tu país.' } ] },
    { title: 'Ley aplicable y resolución de conflictos', blocks: [
      { t: 'p', x: 'Estos términos se rigen por las leyes de [[país o jurisdicción]], sin perjuicio de las normas imperativas de protección al consumidor de tu país de residencia. Intentaremos resolver cualquier conflicto de buena fe escribiéndonos primero a {mail}. Si no hay acuerdo, los tribunales de [[ciudad y país]] serán competentes, salvo que la ley te permita acudir a los de tu domicilio.' } ] },
    { title: 'Cambios y disposiciones generales', blocks: [
      { t: 'p', x: 'Podemos actualizar estos términos. Publicaremos la versión vigente con su fecha y, si el cambio es importante, te avisaremos por correo o dentro de la app con al menos **30 días** de antelación; si sigues usando el servicio tras esa fecha, se entenderá que lo aceptas, y si no estás de acuerdo podrás cancelar tu cuenta. Si una cláusula fuera inválida, el resto seguirá vigente. No podemos ceder estos términos sin avisarte, y tú no puedes cederlos sin nuestro permiso. Publicamos estos términos en español e inglés; si hubiera diferencias, prevalece la versión en [[español / inglés]].' } ] },
  ],
};

const EN: Doc = {
  title: 'Terms of Service',
  updated: 'Version 2026-09-21 · Last updated: September 21, 2026',
  intro: 'These terms govern your use of Waack On, a global dance training and community platform available at waack-on.com. By creating an account or using the service you agree to these terms and to our Privacy Policy. If you do not agree, do not use Waack On.',
  back: '← Back to Waack On',
  copy: '© Waack On',
  home: 'Back to home',
  sections: [
    { title: 'Who we are and how to reach us', blocks: [
      { t: 'p', x: 'The service is provided by [[legal name or owner]], Tax ID [[number]], located at [[postal address, country]] (“Waack On”, “we”). For any question write to us at {mail}.' } ] },
    { title: 'The service', blocks: [
      { t: 'p', x: 'Waack On offers recorded classes and courses, live streams, a practice lab, reels, podcasts, manuals and a community space (wall, challenges, chats, battles and rankings). Some features may be in development or change over time; we may add, modify or remove features, giving reasonable notice when a change significantly affects you.' } ] },
    { title: 'Your account', blocks: [
      { t: 'ul', x: [
        '**Minimum age:** you must be at least **13**, or your country’s digital age of consent if higher (for example, 14 in Spain or up to 16 in several EU countries). If you are a minor, you need the consent of a parent or legal guardian.',
        '**Accurate information:** you must provide accurate details and keep them up to date.',
        '**Security:** you are responsible for your password and for activity on your account. Tell us immediately if you suspect unauthorized use.',
        '**One person, one account:** you may not share your account or impersonate anyone.',
        '**Verified email:** to pay for subscriptions, apply for a professional account or get paid, you must verify your email address.' ] } ] },
    { title: 'Account types', blocks: [
      { t: 'ul', x: [
        '**User:** trains, takes part in the community and subscribes to plans. Open registration for anyone.',
        '**Instructor** and **Studio or academy:** publish classes, courses and lives. These accounts start as a user and require the **manual approval** of Waack On after an application. We may approve, reject or revoke it if you stop complying with these terms.',
        'Instructors and studios are **independent professionals**: they are not employees, partners or representatives of Waack On.' ] } ] },
    { title: 'Subscriptions, prices and payments', blocks: [
      { t: 'ul', x: [
        'Payments are processed by an **external payment provider**; the available payment methods depend on your country and currency. We do not store your full card details.',
        'Prices are shown before you pay, in your currency where possible, and include or add applicable taxes based on your country.',
        'Subscriptions **renew automatically** each month or year until you cancel. You can cancel at any time from **My account → Manage subscriptions**; you keep access until the end of the period already paid.',
        'If a charge fails, we may retry it and, if unresolved, suspend access to paid content.',
        'If we change a price, we will give you enough notice and the change applies at your next renewal; you can cancel before then.' ] } ] },
    { title: 'Withdrawal and refunds', blocks: [
      { t: 'p', x: 'You may request a refund of your first subscription within the first [[number]] days if you have not substantially used the paid content. For digital content and services with immediate access, by purchasing you agree that we begin providing it right away and, where your country’s law allows, you acknowledge that you lose the right of withdrawal once performance has started. Outside those cases, no partial refunds are given for periods already started.' },
      { t: 'p', x: '**Nothing above limits the rights that mandatory consumer law in your country gives you** (for example, the 14-day right of withdrawal in the EU and UK, subject to the legal exception for digital content already started with your consent). Request refunds by writing to {mail}.' } ] },
    { title: 'Instructors and studios: payouts', blocks: [
      { t: 'ul', x: [
        'Payouts are handled through **Stripe Connect**: to receive money you must complete Stripe onboarding with your tax and bank details, in your country.',
        'Waack On keeps a commission of [[percentage]] % on each subscription to your profile; the rest is transferred to you under Stripe’s terms.',
        'You are responsible for your **taxes** (income, VAT/GST or others) and for issuing any invoices the law requires.',
        'You warrant that you hold all rights to what you publish, including image, voice and music rights, and that your content does not infringe the law or third-party rights.' ] } ] },
    { title: 'Your content', blocks: [
      { t: 'p', x: 'You keep **ownership** of the photos, videos, text and other content you upload or post. You grant us a worldwide, non-exclusive, royalty-free, limited license to host, reproduce, technically adapt (for example, resize) and display it **within Waack On** to the people you choose to show it to, and to promote the platform using captures of public content. The license ends when you delete the content or your account, except temporary backups and anything already shared.' },
      { t: 'p', x: '**Music:** do not upload or stream third-party music, choreography or videos without the necessary license. You are responsible for the rights to what you publish.' } ] },
    { title: 'Waack On content and intellectual property', blocks: [
      { t: 'p', x: 'The classes, courses, manuals, designs, trademarks and software of Waack On and its instructors are protected by copyright and other rights. We grant you a **personal, limited, revocable, non-transferable** license to view and use them for your own training. You may not copy, record, redistribute, sell them, share your access or bypass the paid-access systems.' } ] },
    { title: 'Acceptable use', blocks: [
      { t: 'p', x: 'The following is prohibited:' },
      { t: 'ul', x: [
        'harassing, threatening, discriminating against or promoting hatred or violence;',
        'posting sexually explicit or violent content, or content that endangers minors;',
        'impersonating others, deceiving, spamming or committing fraud;',
        'uploading malware or trying to access accounts, systems or data without permission;',
        'mass data extraction (scraping), reverse engineering or overloading the service;',
        'sharing paid content outside the platform;',
        'using Waack On for illegal activities.' ] },
      { t: 'p', x: 'In battles, challenges and chats we expect respect among dancers. We may moderate, hide or remove content and limit features.' } ] },
    { title: 'Live streams and recordings', blocks: [
      { t: 'p', x: 'Live classes may be **recorded** and later offered on demand. By taking part with camera, microphone or chat you accept that your image, voice and messages may appear in that recording. Do not record or rebroadcast others’ classes without written permission.' } ] },
    { title: 'Health and physical activity', blocks: [
      { t: 'p', x: 'Dance and physical training involve a **risk of injury**. Waack On and its instructors do not provide medical advice. Consult a health professional before starting if you have doubts about your fitness, warm up and stretch, train within your limits and stop if you feel pain. You take part at your own responsibility, without prejudice to the rights the law gives you.' } ] },
    { title: 'Artificial intelligence features', blocks: [
      { t: 'p', x: 'When available, AI posture analysis and recommendations will be **optional**, will only be enabled with your consent and offer general training guidance: they are **not a diagnosis or medical advice** and may contain errors. How data is processed is explained in the Privacy Policy.' } ] },
    { title: 'Copyright and takedowns', blocks: [
      { t: 'p', x: 'If you believe something posted on Waack On infringes your rights, write to {mail} with: who you are, which work is yours, where the content is (link) and a good-faith statement that it is not authorized. We will remove infringing content and, if the author disputes it, they may submit a counter-notice. We will suspend repeat infringers’ accounts.' } ] },
    { title: 'Suspension and termination', blocks: [
      { t: 'ul', x: [
        '**You** may stop using Waack On and ask for your account to be deleted at any time by writing to {mail}. Cancel your active subscriptions first.',
        '**We** may suspend or close your account if you breach these terms, for security reasons or by legal obligation, notifying you where possible and explaining why.',
        'When your account closes you lose access to paid content. We will keep only what the law requires us to keep (for example, billing records).' ] } ] },
    { title: 'Warranties and limitation of liability', blocks: [
      { t: 'p', x: 'Waack On is provided “as is” and “as available”: we do not guarantee it will run without interruption or errors, or that the content will deliver a specific result. To the fullest extent permitted by law, we are not liable for indirect damages, loss of profits or data, or for what other users or instructors do, and our total liability to you is limited to what you have paid to Waack On in the preceding **12 months**.' },
      { t: 'p', x: '**This does not exclude or limit** liability that cannot be excluded by law, such as liability for intent or gross negligence, death or personal injury caused by our negligence, or the non-waivable rights of consumers in your country.' } ] },
    { title: 'Governing law and dispute resolution', blocks: [
      { t: 'p', x: 'These terms are governed by the laws of [[country or jurisdiction]], without prejudice to the mandatory consumer-protection rules of your country of residence. We will try to resolve any dispute in good faith by writing to {mail} first. If no agreement is reached, the courts of [[city and country]] will have jurisdiction, unless the law lets you go to the courts of your place of residence.' } ] },
    { title: 'Changes and general provisions', blocks: [
      { t: 'p', x: 'We may update these terms. We will publish the current version with its date and, if the change is important, notify you by email or in the app at least **30 days** in advance; if you keep using the service after that date you are deemed to accept it, and if you disagree you may cancel your account. If any clause is invalid, the rest remains in force. We may not assign these terms without notifying you, and you may not assign them without our permission. We publish these terms in Spanish and English; if the versions differ, the [[Spanish / English]] version prevails.' } ] },
  ],
};

export default function Terms() {
  return <LegalPage docs={{ es: ES, en: EN }} />;
}
