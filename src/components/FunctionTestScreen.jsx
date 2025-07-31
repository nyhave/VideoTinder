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

  const update = (mIndex, fIndex, field, value) => {
    setResults(r =>
      r.map((mod, mi) =>
        mi === mIndex
          ? mod.map((feat, fi) => (fi === fIndex ? { ...feat, [field]: value } : feat))
          : mod
      )
    );
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
    for (let i = 0; i < entries.length; i++) {
      const res = entries[i];
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
      }
    }
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
      React.createElement('ul', { className:'space-y-4 mt-4' },
        modules.map((m, i) =>
          React.createElement('li', { key:i, className:'border p-2 rounded flex justify-between items-center' },
            React.createElement('span', null, m.name),
            React.createElement(Button, { className:'bg-blue-500 text-white px-2 py-1 rounded', onClick: () => setActiveModule(i) }, 'Start')
          )
        )
      )
    );
  }

  const module = modules[activeModule];
  const startGuide = () => {
    localStorage.setItem("functionTestGuide", JSON.stringify({ module: activeModule, step: 0 }));
    alert("Test guide started");
  };
  return React.createElement(Card, { className:'p-6 m-4 shadow-xl bg-white/90' },
    React.createElement(SectionTitle, { title:module.name, colorClass:'text-blue-600', action: React.createElement("div", { className:"flex gap-2" }, React.createElement(Button, { className:"bg-green-500 text-white px-2 py-1 rounded", onClick: startGuide }, "Run"), React.createElement(Button, { onClick: () => setActiveModule(-1) }, t("back"))) }),
    React.createElement('ul', { className:'space-y-4 mt-4 overflow-y-auto max-h-[70vh]' },
      module.features.map((f, i) =>
        React.createElement('li', { key:i, className:'border p-2 rounded' },
          React.createElement('div', { className:'font-medium mb-1' }, f.title),
          React.createElement('ul', { className:'list-disc ml-5 text-sm mb-1' },
            f.expected.map((ex, j) => React.createElement('li', { key:j }, ex))
          ),
          React.createElement('div', { className:'flex space-x-2 mb-1' },
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[activeModule][i].status==='ok' ? 'bg-green-500 text-white' : 'bg-gray-200'}`, onClick:() => update(activeModule,i,'status',results[activeModule][i].status==='ok'?'':'ok') }, 'OK'),
            React.createElement(Button, { className:`px-2 py-1 rounded ${results[activeModule][i].status==='fail' ? 'bg-red-500 text-white' : 'bg-gray-200'}`, onClick:() => update(activeModule,i,'status',results[activeModule][i].status==='fail'?'':'fail') }, 'Fejl')
          ),
          React.createElement('textarea', { className:'w-full border p-1 text-sm mb-1', placeholder:'Kommentar', value:results[activeModule][i].comment, onChange:e=>update(activeModule,i,'comment',e.target.value) }),
          React.createElement(Input, { type:'file', accept:'image/*', className:'mb-1 w-full', onChange:e=>update(activeModule,i,'file',e.target.files[0]) })
        )
      )
    ),
    React.createElement(Button, { className:'mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full', onClick: () => submitModule(activeModule) }, 'Send rapport')
  );
}
