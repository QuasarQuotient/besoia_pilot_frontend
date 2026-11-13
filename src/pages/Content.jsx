import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Spinner } from '../components/ui.jsx';
import { useI18n } from '../i18n.jsx';
import { adminRequest, saveFile } from '../services/admin.js';

// Not linked from anywhere in the app: open /content directly. The passcode is asked on every visit.

const TEMPLATES = {
  questions: [
    {
      id: 1,
      question: { en: 'What is your ideal weekend?', es: '¿Cuál es tu fin de semana ideal?' },
      options: [
        { id: 'beach', en: 'At the beach', es: 'En la playa' },
        { id: 'mountains', en: 'In the mountains', es: 'En la montaña' },
        { id: 'city', en: 'Exploring the city', es: 'Explorando la ciudad' }
      ]
    },
    {
      id: 2,
      question: { en: 'Coffee or tea?', es: '¿Café o té?' },
      options: [
        { id: 'coffee', en: 'Coffee', es: 'Café' },
        { id: 'tea', en: 'Tea', es: 'Té' }
      ]
    }
  ],
  icebreakers: [
    { id: 'best_trip', en: 'What is the best trip you have ever taken?', es: '¿Cuál es el mejor viaje que has hecho?' },
    { id: 'hidden_talent', en: 'Do you have a hidden talent?', es: '¿Tienes algún talento oculto?' }
  ]
};

const KINDS = [
  { key: 'questions', path: '/content/questions', clearsAnswers: true },
  { key: 'icebreakers', path: '/content/icebreakers', clearsAnswers: false }
];

const toJson = (data) => `${JSON.stringify(data, null, 2)}\n`;
const saveJson = (data, filename) => saveFile(new Blob([toJson(data)], { type: 'application/json' }), filename);

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try { resolve(JSON.parse(reader.result)); } catch { reject(new Error('not_json')); }
    };
    reader.onerror = () => reject(new Error('unreadable'));
    reader.readAsText(file);
  });
}

function ContentSection({ kind, current, passcode, onSaved, onAuthFailed }) {
  const { t, errorText } = useI18n();
  const [pending, setPending] = useState(null);
  const [state, setState] = useState({});
  const input = useRef(null);
  const label = (key, vars) => t(`content.${kind.key}.${key}`, vars);

  async function choose(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setState({});
    try {
      const data = await readJsonFile(file);
      const items = Array.isArray(data) ? data : data?.[kind.key];
      if (!Array.isArray(items)) return setState({ error: { message: t('content.notList', { key: kind.key }) } });
      setPending({ name: file.name, data: items });
    } catch {
      setState({ error: { message: t('content.notJson', { file: file.name }) } });
    }
  }

  async function upload() {
    setState({ saving: true });
    const result = await adminRequest(kind.path, { method: 'PUT', passcode, [kind.key]: pending.data });
    if (result.status === 401) return onAuthFailed(result.error);
    if (result.error) return setState({ error: result.error });
    setPending(null);
    onSaved(kind.key, result.body[kind.key]);
    setState({ saved: true, cleared: result.body.clearedAnswers });
  }

  return <div className="border-t border-ink/10 pt-6 first:border-t-0 first:pt-0">
    <h2 className="text-xl font-semibold">{label('title')}</h2>
    <p className="mt-1 text-sm text-ink-soft">{label('inUse', { count: current.length })}</p>

    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-soft">
      {label('rules').map((rule) => <li key={rule}>{rule}</li>)}
    </ul>

    <details className="mt-3 rounded-2xl border border-ink/10 bg-ink/5 p-4">
      <summary className="cursor-pointer text-sm font-semibold">{t('content.template')}</summary>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre text-xs leading-5">{toJson(TEMPLATES[kind.key])}</pre>
      <Button variant="secondary" className="mt-3 w-full text-sm" onClick={() => saveJson(TEMPLATES[kind.key], `${kind.key}-template.json`)}>{t('content.downloadTemplate')}</Button>
    </details>

    {pending
      ? <div className="mt-4 space-y-3">
          <Alert tone={kind.clearsAnswers ? 'error' : 'info'}>
            {label('ready', { file: pending.name, count: pending.data.length })}{kind.clearsAnswers && ` ${t('content.questions.warning')}`}
          </Alert>
          {state.error && <Alert>{errorText(state.error)}</Alert>}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setPending(null); setState({}); }} disabled={state.saving}>{t('content.cancel')}</Button>
            <Button className="flex-1" onClick={upload} loading={state.saving}>{label('replace')}</Button>
          </div>
        </div>
      : <>
          {state.saved && <div className="mt-4"><Alert tone="info">{kind.clearsAnswers ? t('content.questions.saved', { count: state.cleared }) : label('saved')}</Alert></div>}
          {state.error && <div className="mt-4"><Alert>{errorText(state.error)}</Alert></div>}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => saveJson(current, `${kind.key}.json`)}>{t('content.download')}</Button>
            <Button className="flex-1" onClick={() => input.current?.click()}>{label('upload')}</Button>
            <input ref={input} type="file" accept="application/json,.json" className="hidden" onChange={choose} />
          </div>
        </>}
  </div>;
}

export default function Content() {
  const [passcode, setPasscode] = useState('');
  const [state, setState] = useState({ step: 'form' });
  const { t, errorText } = useI18n();

  async function unlock(code) {
    setState({ step: 'loading' });
    const result = await adminRequest('/content', { passcode: code });
    if (result.body) {
      setPasscode(code);
      return setState({ step: 'ready', content: result.body });
    }
    if (result.status === 401) setPasscode('');
    setState({ step: 'form', error: result.error });
  }

  function lock(error) {
    setPasscode('');
    setState({ step: 'form', error });
  }

  const saved = (key, value) => setState((current) => ({ ...current, content: { ...current.content, [key]: value } }));

  return <section>
    <p className="eyebrow">{t('content.eyebrow')}</p>
    <h1 className="mt-2 text-3xl font-semibold leading-tight sm:mt-3 sm:text-5xl">{t('content.title')}</h1>
    <p className="mt-3 max-w-md leading-7 text-ink-soft">{t('content.intro')}</p>

    <div className="card mt-6 p-6">
      {state.step === 'loading' && <div className="flex items-center gap-3 text-ink-soft"><Spinner className="h-5 w-5 text-accent" />{t('content.loading')}</div>}

      {state.step === 'ready' && <div className="space-y-6">
        {KINDS.map((kind) => <ContentSection key={kind.key} kind={kind} current={state.content[kind.key]} passcode={passcode} onSaved={saved} onAuthFailed={lock} />)}
        <Button variant="ghost" className="w-full text-sm" onClick={() => lock()}>{t('content.lock')}</Button>
      </div>}

      {state.step === 'form' && <form onSubmit={(event) => { event.preventDefault(); if (passcode.trim()) unlock(passcode.trim()); }} noValidate>
        <label className="text-sm font-semibold" htmlFor="passcode">{t('reports.passcode')}</label>
        <input className="input mt-2" id="passcode" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} autoComplete="off" autoFocus />
        {state.error && <div className="mt-4"><Alert>{errorText(state.error)}</Alert></div>}
        <Button type="submit" className="mt-4 w-full" disabled={!passcode.trim()}>{t('content.unlock')}</Button>
      </form>}

      <Link to="/" className="btn btn-primary mt-6 w-full no-underline">{t('common.goHome')}</Link>
    </div>
  </section>;
}
