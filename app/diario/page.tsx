import { useState, useEffect } from 'react';

type DiaryEntry = {
  id: string;
  date: string;
  content: string;
};

export default function DiarioPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('diary');
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('diary', JSON.stringify(entries));
  }, [entries]);

  const addEntry = () => {
    if (!newContent.trim()) return;

    const entry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      content: newContent.trim(),
    };

    setEntries([entry, ...entries]);
    setNewContent('');
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-12 text-center text-gray-800">Meu Diário</h1>
      
      <div className="mb-12 p-8 bg-white shadow-lg rounded-xl">
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="O que aconteceu hoje? Escreva sua entrada de diário..."
          className="w-full p-6 border border-gray-300 rounded-lg resize-vertical min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          rows={4}
        />
        <button
          onClick={addEntry}
          className="mt-6 w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-200"
        >
          Adicionar Nova Entrada
        </button>
      </div>

      <div className="space-y-6">
        {entries.length === 0 ? (
          <p className="text-center text-gray-500 text-xl py-12">Nenhuma entrada ainda. Adicione a primeira!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md rounded-xl border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{entry.date}</h2>
              </div>
              <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
