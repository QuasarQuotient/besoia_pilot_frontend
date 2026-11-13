import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const messages = {
  en: {
    meta: { title: 'Besoia · Find your shared signal' },
    language: 'Language',
    common: { back: 'Back', next: 'Next', tryAgain: 'Try again', goHome: 'Go to Besoia' },
    stepper: { you: 'You', questions: 'Questions', connect: 'Connect', progress: 'Progress', completed: '(completed)' },
    home: {
      eyebrow: 'A two-minute icebreaker',
      titleBefore: 'Find your ',
      titleEmphasis: 'shared',
      titleAfter: ' signal.',
      intro: 'A quick, low-pressure way to discover what you have in common with someone new.',
      welcomeBack: 'Welcome back,',
      continueConnect: 'Continue to connect',
      continueQuestions: 'Continue the questions',
      startFresh: 'Not you? Start fresh',
      sessionExpired: 'Your last session expired. Enter your name to start a new one.',
      nameLabel: 'What should we call you?',
      namePlaceholder: 'Your first name',
      gettingReady: 'Getting ready…',
      start: 'Start the questions',
      privacy: 'No email, no password. Your session lasts 24 hours.',
      steps: [
        { title: 'Say hi', body: 'Just your first name. No sign-up.' },
        { title: 'A few quick picks', body: 'Tap what feels most like you.' },
        { title: 'Swap codes', body: 'Scan each other and compare.' }
      ]
    },
    quiz: {
      eyebrow: 'A few small choices',
      title: 'No right answers.',
      progress: 'Questions answered',
      questionOf: 'Question {n} of {total}',
      jump: 'Jump to question',
      jumpItem: 'Question {n}',
      answered: ', answered',
      backToStart: 'Back to start',
      previous: 'Previous question',
      saving: 'Saving your answers…',
      seeQr: 'See my QR code',
      answerMore: 'Answer {count} more'
    },
    match: {
      eyebrow: 'Almost there, {name}',
      title: 'Swap your signal.',
      intro: "One of you shows a code, the other scans it. You'll both see the result at the same time.",
      tabs: 'Connect method',
      showTab: 'My code',
      scanTab: 'Scan theirs',
      holdUp: 'Hold your phone up so they can scan this. It refreshes every 30 seconds, so old photos of it stop working.',
      qrError: "Can't refresh your code. Check your connection; retrying…",
      waiting: 'Waiting for them to scan…',
      comparing: 'Comparing answers…',
      scanAgain: 'Scan again',
      connections: 'Your connections',
      connectionsHint: 'Tap someone to see your result again.',
      justNow: 'just now',
      connected: 'Connected',
      inCommon: '{count} in common',
      empty: 'No connections yet',
      emptyHint: "Swap codes with someone nearby and they'll show up here.",
      editPrompt: 'Want to change a pick?',
      editLink: 'Edit your answers'
    },
    qr: { label: 'QR code for {name}', you: 'you' },
    scanner: { starting: 'Starting camera…', point: 'Point at their QR code', unavailable: 'Camera unavailable.' },
    result: {
      newConnection: 'New connection',
      yourConnection: 'Your connection',
      title: 'You & {name}',
      yourFriend: 'your friend',
      bothPicked: 'You both picked · {count} of {total}',
      noneShared: 'No identical picks, so you have plenty to talk about.',
      startWith: 'Start with this',
      done: 'Done',
      twins: 'Practically twins',
      strong: 'Strong signal',
      some: 'Some common ground',
      opposites: 'Opposites attract'
    },
    reports: {
      eyebrow: 'Pilot data',
      title: 'Reports',
      waking: 'Waking up the server…',
      preparing: 'Preparing the report…',
      downloaded: 'Downloaded {file}',
      again: 'Download again',
      forget: 'Forget passcode on this device',
      passcode: 'Passcode',
      download: 'Download report'
    },
    content: {
      eyebrow: 'Pilot settings',
      title: 'Questions & icebreakers',
      intro: 'Upload a JSON file to change the questions or icebreakers people see. Start from the example template or from the current set.',
      loading: 'Loading the current content…',
      unlock: 'Unlock',
      download: 'Download current set',
      template: 'Example template',
      downloadTemplate: 'Download template',
      lock: 'Lock',
      cancel: 'Cancel',
      notJson: "{file} isn't valid JSON.",
      notList: 'The file must be a JSON list, or an object with a "{key}" list.',
      questions: {
        title: 'Questions',
        inUse: '{count} questions in use',
        upload: 'Upload questions',
        rules: [
          'A list of 1 to 30 questions, each with a unique whole-number id.',
          'Each question has English (en) and Spanish (es) text and 2 to 6 options.',
          'Option ids are short and unique within a question: lowercase letters, numbers, _ or -.',
          'Text can be up to 300 characters.'
        ],
        ready: '{file} has {count} questions.',
        warning: 'Replacing the questions deletes every saved answer, so everyone has to answer the new questions again. Past connections are kept.',
        replace: 'Replace questions',
        saved: 'Questions updated. {count} saved answers were cleared.'
      },
      icebreakers: {
        title: 'Icebreakers',
        inUse: '{count} icebreakers in use',
        upload: 'Upload icebreakers',
        rules: [
          'A list of 1 to 200 icebreakers, each with a unique id: lowercase letters, numbers, _ or -.',
          'Each icebreaker has English (en) and Spanish (es) text, up to 300 characters.'
        ],
        ready: '{file} has {count} icebreakers. New connections will get one of these.',
        replace: 'Replace icebreakers',
        saved: 'Icebreakers updated.'
      }
    },
    errors: {
      network: "Can't reach Besoia right now. Check your connection and try again.",
      server: 'Something went wrong on our side. Please try again.',
      request_failed: 'Something went wrong. Please try again.',
      name_required: 'Please enter your name.',
      name_too_long: 'Your name must be 80 characters or fewer.',
      register_first: 'Enter your name first.',
      answers_incomplete: 'Please answer all the questions.',
      code_expired: 'That code has expired. Ask your partner to show their code again and scan the new one.',
      code_invalid: "That doesn't look like a Besoia QR code. Ask your partner to open their code and try again.",
      own_code: "That's your own code. Scan your partner's code instead.",
      finish_questions: 'Complete your questions before scanning.',
      partner_not_finished: "Your partner hasn't finished their questions yet.",
      camera_blocked: 'Camera access was blocked. Allow it in your browser settings and reload the page.',
      camera_failed: "The camera couldn't start. Close other apps using the camera and try again.",
      passcode_wrong: 'Wrong passcode.',
      passcode_locked: 'Too many wrong passcodes. Try again in 15 minutes.',
      reports_disabled: 'Reports are not set up yet.'
    }
  },
  es: {
    meta: { title: 'Besoia · Encuentra tu señal compartida' },
    language: 'Idioma',
    common: { back: 'Atrás', next: 'Siguiente', tryAgain: 'Reintentar', goHome: 'Ir a Besoia' },
    stepper: { you: 'Tú', questions: 'Preguntas', connect: 'Conectar', progress: 'Progreso', completed: '(completado)' },
    home: {
      eyebrow: 'Para romper el hielo en dos minutos',
      titleBefore: 'Encuentra tu señal ',
      titleEmphasis: 'compartida',
      titleAfter: '.',
      intro: 'Una forma rápida y sin presión de descubrir lo que tienes en común con alguien nuevo.',
      welcomeBack: 'Hola de nuevo,',
      continueConnect: 'Seguir para conectar',
      continueQuestions: 'Seguir con las preguntas',
      startFresh: '¿No eres tú? Empieza de nuevo',
      sessionExpired: 'Tu sesión anterior ha caducado. Escribe tu nombre para empezar una nueva.',
      nameLabel: '¿Cómo te llamamos?',
      namePlaceholder: 'Tu nombre',
      gettingReady: 'Preparando…',
      start: 'Empezar las preguntas',
      privacy: 'Sin correo ni contraseña. Tu sesión dura 24 horas.',
      steps: [
        { title: 'Saluda', body: 'Solo tu nombre. Sin registro.' },
        { title: 'Unas elecciones rápidas', body: 'Toca lo que más vaya contigo.' },
        { title: 'Intercambia códigos', body: 'Escanead y comparad.' }
      ]
    },
    quiz: {
      eyebrow: 'Unas pequeñas elecciones',
      title: 'No hay respuestas correctas.',
      progress: 'Preguntas respondidas',
      questionOf: 'Pregunta {n} de {total}',
      jump: 'Ir a la pregunta',
      jumpItem: 'Pregunta {n}',
      answered: ', respondida',
      backToStart: 'Volver al inicio',
      previous: 'Pregunta anterior',
      saving: 'Guardando tus respuestas…',
      seeQr: 'Ver mi código QR',
      answerMore: 'Responde {count} más'
    },
    match: {
      eyebrow: 'Ya casi está, {name}',
      title: 'Intercambia tu señal.',
      intro: 'Uno enseña su código y el otro lo escanea. Los dos veréis el resultado a la vez.',
      tabs: 'Forma de conectar',
      showTab: 'Mi código',
      scanTab: 'Escanear el suyo',
      holdUp: 'Levanta el móvil para que puedan escanearlo. Se renueva cada 30 segundos, así que las fotos antiguas dejan de funcionar.',
      qrError: 'No se puede renovar tu código. Revisa tu conexión; reintentando…',
      waiting: 'Esperando a que lo escaneen…',
      comparing: 'Comparando respuestas…',
      scanAgain: 'Escanear de nuevo',
      connections: 'Tus conexiones',
      connectionsHint: 'Toca a alguien para volver a ver vuestro resultado.',
      justNow: 'ahora mismo',
      connected: 'Conectado',
      inCommon: '{count} en común',
      empty: 'Aún no tienes conexiones',
      emptyHint: 'Intercambia códigos con alguien cerca y aparecerá aquí.',
      editPrompt: '¿Quieres cambiar alguna respuesta?',
      editLink: 'Editar tus respuestas'
    },
    qr: { label: 'Código QR de {name}', you: 'ti' },
    scanner: { starting: 'Iniciando la cámara…', point: 'Apunta a su código QR', unavailable: 'Cámara no disponible.' },
    result: {
      newConnection: 'Nueva conexión',
      yourConnection: 'Tu conexión',
      title: 'Tú y {name}',
      yourFriend: 'tu amigo',
      bothPicked: 'Elegisteis lo mismo · {count} de {total}',
      noneShared: 'Ninguna respuesta coincide, así que tenéis mucho de qué hablar.',
      startWith: 'Empezad por aquí',
      done: 'Hecho',
      twins: 'Prácticamente gemelos',
      strong: 'Mucha conexión',
      some: 'Algo en común',
      opposites: 'Los opuestos se atraen'
    },
    reports: {
      eyebrow: 'Datos del piloto',
      title: 'Informes',
      waking: 'Despertando el servidor…',
      preparing: 'Preparando el informe…',
      downloaded: 'Descargado {file}',
      again: 'Descargar de nuevo',
      forget: 'Olvidar el código en este dispositivo',
      passcode: 'Código de acceso',
      download: 'Descargar informe'
    },
    content: {
      eyebrow: 'Ajustes del piloto',
      title: 'Preguntas y rompehielos',
      intro: 'Sube un archivo JSON para cambiar las preguntas o los rompehielos que ve la gente. Empieza con la plantilla de ejemplo o con el contenido actual.',
      loading: 'Cargando el contenido actual…',
      unlock: 'Desbloquear',
      download: 'Descargar el contenido actual',
      template: 'Plantilla de ejemplo',
      downloadTemplate: 'Descargar plantilla',
      lock: 'Bloquear',
      cancel: 'Cancelar',
      notJson: '{file} no es un JSON válido.',
      notList: 'El archivo debe ser una lista JSON o un objeto con una lista "{key}".',
      questions: {
        title: 'Preguntas',
        inUse: '{count} preguntas en uso',
        upload: 'Subir preguntas',
        rules: [
          'Una lista de 1 a 30 preguntas, cada una con un id numérico entero único.',
          'Cada pregunta tiene texto en inglés (en) y en español (es) y de 2 a 6 opciones.',
          'Los ids de las opciones son cortos y únicos dentro de cada pregunta: minúsculas, números, _ o -.',
          'Cada texto puede tener hasta 300 caracteres.'
        ],
        ready: '{file} tiene {count} preguntas.',
        warning: 'Al cambiar las preguntas se borran todas las respuestas guardadas, así que todo el mundo tendrá que responder las nuevas. Las conexiones anteriores se mantienen.',
        replace: 'Cambiar las preguntas',
        saved: 'Preguntas actualizadas. Se han borrado {count} respuestas guardadas.'
      },
      icebreakers: {
        title: 'Rompehielos',
        inUse: '{count} rompehielos en uso',
        upload: 'Subir rompehielos',
        rules: [
          'Una lista de 1 a 200 rompehielos, cada uno con un id único: minúsculas, números, _ o -.',
          'Cada rompehielos tiene texto en inglés (en) y en español (es), de hasta 300 caracteres.'
        ],
        ready: '{file} tiene {count} rompehielos. Las nuevas conexiones recibirán uno de ellos.',
        replace: 'Cambiar los rompehielos',
        saved: 'Rompehielos actualizados.'
      }
    },
    errors: {
      network: 'No podemos conectar con Besoia ahora mismo. Revisa tu conexión e inténtalo de nuevo.',
      server: 'Algo ha fallado por nuestra parte. Inténtalo de nuevo.',
      request_failed: 'Algo ha fallado. Inténtalo de nuevo.',
      name_required: 'Escribe tu nombre.',
      name_too_long: 'Tu nombre debe tener 80 caracteres o menos.',
      register_first: 'Primero escribe tu nombre.',
      answers_incomplete: 'Responde todas las preguntas.',
      code_expired: 'Ese código ha caducado. Pide a la otra persona que vuelva a enseñar su código y escanea el nuevo.',
      code_invalid: 'Eso no parece un código QR de Besoia. Pide a la otra persona que abra su código e inténtalo de nuevo.',
      own_code: 'Ese es tu propio código. Escanea el de la otra persona.',
      finish_questions: 'Completa tus preguntas antes de escanear.',
      partner_not_finished: 'La otra persona aún no ha terminado sus preguntas.',
      camera_blocked: 'Se ha bloqueado el acceso a la cámara. Permítelo en los ajustes del navegador y recarga la página.',
      camera_failed: 'No se ha podido iniciar la cámara. Cierra otras apps que la estén usando e inténtalo de nuevo.',
      passcode_wrong: 'Código incorrecto.',
      passcode_locked: 'Demasiados intentos fallidos. Inténtalo de nuevo en 15 minutos.',
      reports_disabled: 'Los informes aún no están configurados.'
    }
  }
};

export const LANGUAGES = ['en', 'es'];
const STORAGE_KEY = 'besoia_lang';

function initialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch {}
  return (navigator.languages || [navigator.language]).some((code) => code?.toLowerCase().startsWith('es')) ? 'es' : 'en';
}

const lookup = (lang, key) => key.split('.').reduce((value, part) => value?.[part], messages[lang]);

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage);

  const setLang = useCallback((next) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = messages[lang].meta.title;
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, vars = {}) => {
      const text = lookup(lang, key) ?? lookup('en', key) ?? key;
      return typeof text === 'string' ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '') : text;
    };
    // { en, es } from the API, or a plain string from older saved data
    const pick = (text) => (typeof text === 'string' ? text : text?.[lang] ?? text?.en ?? '');
    const errorText = (error) => (error?.code && lookup('en', `errors.${error.code}`) ? t(`errors.${error.code}`) : error?.message || t('errors.request_failed'));
    return { lang, setLang, t, pick, errorText };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return <div className="flex rounded-lg bg-ink/5 p-0.5 text-xs font-semibold" role="group" aria-label={t('language')}>
    {LANGUAGES.map((code) => <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code}
      className={`rounded-md px-2 py-1 uppercase ${lang === code ? 'bg-cream text-ink shadow-sm' : 'text-ink/50 hover:text-ink'}`}>{code}</button>)}
  </div>;
}
