import React, { useState, useEffect } from 'react';
import { Card } from './ui/card.js';
import { Button } from './ui/button.js';
import { Input } from './ui/input.js';
import SectionTitle from './SectionTitle.jsx';
import { db, storage, doc, setDoc, ref, uploadBytes, getDownloadURL } from '../firebase.js';
import { useT } from '../i18n.js';
import { modules } from '../functionTestModules.js';

const features = modules.flatMap(m => m.features);

const defaultResults = modules.map(mod =>
  mod.features.map(() => ({ status: '', comment: '', file: null }))
);

export default function FunctionTestScreen({ onBack }) {
  const [activeModule, setActiveModule] = useState(() => {
    const stored = localStorage.getItem('functionTestActiveModule');
    return stored ? parseInt(stored, 10) : -1;
  });
  const [submittedIds, setSubmittedIds] = useState([]);
  const t = useT();

  useEffect(() => {
    localStorage.setItem('functionTestActiveModule', String(activeModule));
  }, [activeModule]);
  const [results, setResults] = useState(() => {
    const stored = localStorage.getItem('functionTestResults');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return modules.map((m, mi) =>
          m.features.map((_, fi) => ({
            status: parsed[mi]?.[fi]?.status || '',
            comment: parsed[mi]?.[fi]?.comment || '',
            file: null
          }))
        );
      } catch (e) {
        // ignore parse errors
      }
    }
    return defaultResults;
  });

  useEffect(() => {
    const serializable = results.map(mod =>
      mod.map(({ status, comment }) => ({ status, comment }))
    );
    localStorage.setItem('functionTestResults', JSON.stringify(serializable));
  }, [results]);

  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('functionTestHistory');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return modules.map(m => m.features.map(() => []));
  });

  useEffect(() => {
    localStorage.setItem('functionTestHistory', JSON.stringify(history));
  }, [history]);

  const copyFeature = async feature => {
    const text = [feature.title, ...feature.expected.map(e => '- ' + e)].join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const update = (mIndex, fIndex, field, value) => {
    setResults(r =>
      r.map((mod, mi) =>
        mi === mIndex
          ? mod.map((feat, fi) => (fi === fIndex ? { ...feat, [field]: value } : feat))
          : mod
      )
    );
  };

  const capture = async (mIndex, fIndex) => {
    const mod = await import('html2canvas');
    const canvas = await mod.default(document.body);
    return new Promise(resolve => {
      canvas.toBlob(blob => {
        const file = new File([blob], 'screenshot.png', { type: 'image/png' });
        update(mIndex, fIndex, 'file', file);
        resolve();
      });
    });
  };

  const resetProgress = () => {
    localStorage.removeItem('functionTestResults');
    localStorage.removeItem('functionTestActiveModule');
    setResults(defaultResults);
    setActiveModule(-1);
  };

  const submitModule = async mIndex => {
    const module = modules[mIndex];
    const entries = results[mIndex];
    const ids = [];
    const newHistory = history.map(mod => mod.map(list => [...list]));
    for (let i = 0; i < entries.length; i++) {
      const res = entries[i];
      newHistory[mIndex][i].push({ status: res.status, comment: res.comment });
      if (res.status === 'fail') {
        const id = Date.now().toString() + '-' + mIndex + '-' + i;
        let screenshotURL = '';
        if (res.file) {
          const storageRef = ref(storage, `bugReports/${id}-${res.file.name}`);
          await uploadBytes(storageRef, res.file);
          screenshotURL = await getDownloadURL(storageRef);
        }
        await setDoc(doc(db, 'bugReports', id), {
          id,
          text: `[FunctionTest] ${module.features[i].title} ${res.comment || ''}`.trim(),
          screenshotURL,
          createdAt: new Date().toISOString(),
          closed: false
        });
        ids.push(id);
      }
    }
    setHistory(newHistory);
    setSubmittedIds(ids);
    alert('Resultater sendt');
    setActiveModule(-1);
  };

  if (activeModule === -1) {
    return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
      React.createElement(SectionTitle, { title:t('functionTestTitle'), colorClass:'text-blue-600', action:
        React.createElement('div', { className:'flex gap-2' },
          React.createElement(Button, { className:'bg-red-500 text-white px-2 py-1 rounded', onClick: resetProgress }, 'Reset'),
          React.createElement(Button, { className:'bg-gray-500 text-white px-2 py-1 rounded', onClick: onBack }, t('back'))
        )
      }),
      submittedIds.length > 0 && React.createElement('div', { className:'mb-2 text-sm' },
        `${submittedIds.length} bugs oprettet.`,
        React.createElement('button', { className:'underline text-blue-600 ml-2', onClick: () => window.dispatchEvent(new CustomEvent('functionTestAction', {detail:'openBugReports'})) }, 'Åbn bugs')
      ),
      React.createElement('ul', { className:'space-y-4 mt-4' },
        modules.map((m, i) => {
          const done = results[i].filter(r => r.status).length;
          const fails = results[i].filter(r => r.status==='fail').length;
          return React.createElement('li', { key:i, className:'border p-2 rounded flex justify-between items-center' },
            React.createElement('span', null,
              `${m.name} (${done}/${m.features.length}${fails ? ' - ' + fails + ' fejl' : ''})`),
            React.createElement(Button, { className:'bg-blue-500 text-white px-2 py-1 rounded', onClick: () => setActiveModule(i) }, 'Start')
          );
        })
      )
    );
  }

  const module = modules[activeModule];
  const startGuide = () => {
    localStorage.setItem('functionTestGuide', JSON.stringify({ module: activeModule, step: 0 }));
    window.dispatchEvent(new Event('functionTestGuideChange'));
    alert('Test guide started');
  };

  const autoRun = async () => {
    for (let i = 0; i < module.features.length; i++) {
      const f = module.features[i];
      const events = f.action ? (Array.isArray(f.action.events) ? f.action.events : [f.action.event].filter(Boolean)) : [];
      for (const ev of events) {
        window.dispatchEvent(new CustomEvent('functionTestAction', { detail: ev }));
        await new Promise(r => setTimeout(r, 600));
      }
      let ok = true;
      if (f.validate) {
        const el = document.querySelector(f.validate.selector);
        ok = !!el && (!f.validate.text || (el.textContent || '').includes(f.validate.text));
      }
      update(activeModule, i, 'status', ok ? 'ok' : 'fail');
    }
    alert('Automated check complete');
  };
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title:module.name, colorClass:'text-blue-600', action: React.createElement("div", { className:"flex gap-2" }, React.createElement(Button, { className:"bg-green-500 text-white px-2 py-1 rounded", onClick: startGuide }, "Guide"), React.createElement(Button, { className:"bg-blue-500 text-white px-2 py-1 rounded", onClick: autoRun }, "Auto"), React.createElement(Button, { onClick: () => setActiveModule(-1) }, t("back"))) }),
    React.createElement('ul', { className:'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
      module.features.map((f, i) =>
        React.createElement('li', { key:i, className:'border p-2 rounded' },
          React.createElement('div', { className:'font-medium mb-1' }, f.title),
          React.createElement('ul', { className:'list-disc ml-5 text-sm mb-1' },
            f.expected.map((ex, j) => React.createElement('li', { key:j }, ex))
          ),
          React.createElement(Button, { className:'mb-1 bg-gray-200 text-black px-2 py-1 rounded', onClick: () => copyFeature(f) }, 'Copy'),
          React.createElement('div', { className:'flex space-x-2 mb-1' },
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[activeModule][i].status==='ok' ? 'bg-green-500 text-white' : 'bg-gray-200'}`, onClick:() => update(activeModule,i,'status',results[activeModule][i].status==='ok'?'':'ok') }, 'OK'),
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[activeModule][i].status==='fail' ? 'bg-red-500 text-white' : 'bg-gray-200'}`, onClick:() => update(activeModule,i,'status',results[activeModule][i].status==='fail'?'':'fail') }, 'Fejl'),
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[activeModule][i].status==='na' ? 'bg-yellow-400 text-black' : 'bg-gray-200'}`, onClick:() => update(activeModule,i,'status',results[activeModule][i].status==='na'?'':'na') }, 'N/A')
          ),
          React.createElement('textarea', { className:'w-full border p-1 text-sm mb-1', placeholder:'Kommentar', value:results[activeModule][i].comment, onChange:e=>update(activeModule,i,'comment',e.target.value) }),
          React.createElement('div', { className:'flex gap-2 mb-1' },
            React.createElement(Input, { type:'file', accept:'image/*', className:'flex-1', onChange:e=>update(activeModule,i,'file',e.target.files[0]) }),
            React.createElement(Button, { className:'bg-blue-500 text-white px-2 py-1 rounded', onClick:() => capture(activeModule,i) }, 'Capture')
          ),
          history[activeModule][i] && history[activeModule][i].length > 0 && React.createElement('ul', { className:'text-xs text-gray-600 mb-1 list-disc ml-5' },
            history[activeModule][i].map((h,hi)=>React.createElement('li',{key:hi}, `${h.status} ${h.comment}`))
          )
        )
      )
    ),
    React.createElement(Button, { className:'mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full', onClick: () => submitModule(activeModule) }, 'Send rapport')
  );
}
