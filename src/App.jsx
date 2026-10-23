import { useState } from 'react';
import AdventureMap from './components/AdventureMap';
import JournalPanel from './components/JournalPanel';
import entries from './data/entries.json';
import './App.css';

export default function App() {
  const [selectedEntry, setSelectedEntry] = useState(null);

  const currentIndex = selectedEntry
    ? entries.findIndex(e => e.id === selectedEntry.id)
    : -1;
  const prevEntry = currentIndex > 0 ? entries[currentIndex - 1] : null;
  const nextEntry = currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;

  return (
    <div className={`app-layout${selectedEntry ? ' panel-open' : ''}`}>
      <div className="map-wrapper">
        <AdventureMap
          entries={entries}
          selectedEntry={selectedEntry}
          onSelect={setSelectedEntry}
        />
      </div>
      <div className="panel-wrapper">
        <JournalPanel
          entry={selectedEntry}
          prevEntry={prevEntry}
          nextEntry={nextEntry}
          onClose={() => setSelectedEntry(null)}
          onNavigate={setSelectedEntry}
        />
      </div>
    </div>
  );
}
