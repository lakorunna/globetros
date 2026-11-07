import { lazy, Suspense, useState } from 'react';
import JournalPanel from './components/JournalPanel';
import entries from './data/entries.json';
import { sheetHeights, useSheetMode, useViewportHeight } from './sheet';
import './App.css';

// The map (MapLibre) is the heavy part: load it separately so the page shell appears first
const AdventureMap = lazy(() => import('./components/AdventureMap'));

export default function App() {
  const [selectedEntry, setSelectedEntry] = useState(null);
  // Bottom sheet state on small screens: 'peek' (a bar), 'half' or 'full'
  const [snap, setSnap] = useState('peek');
  // The opening fly-in shows only the globe; the card slides in once it has landed
  const [introDone, setIntroDone] = useState(false);
  const sheetMode = useSheetMode();
  const heights = sheetHeights(useViewportHeight());

  const currentIndex = selectedEntry
    ? entries.findIndex(e => e.id === selectedEntry.id)
    : -1;
  const prevEntry = currentIndex > 0 ? entries[currentIndex - 1] : null;
  const nextEntry = currentIndex < entries.length - 1 ? entries[currentIndex + 1] : null;

  // Opening a story from the collapsed bar pulls the sheet up to read it
  function selectEntry(entry) {
    setIntroDone(true);
    setSelectedEntry(entry);
    if (snap === 'peek') setSnap('half');
  }

  function closeEntry() {
    setSelectedEntry(null);
    setSnap('peek');
  }

  // How much of the map's bottom the sheet covers. At full height the map keeps
  // framing the story as at half height, so the camera doesn't jump around.
  const bottomInset = sheetMode ? heights[snap === 'full' ? 'half' : snap] : 0;

  return (
    <div className={`app-layout${selectedEntry ? ' panel-open' : ''}`}>
      <div className="map-wrapper">
        <Suspense fallback={<div className="map-loading" />}>
          <AdventureMap
            entries={entries}
            selectedEntry={selectedEntry}
            onSelect={selectEntry}
            onIntroEnd={() => setIntroDone(true)}
            sheetMode={sheetMode}
            bottomInset={bottomInset}
          />
        </Suspense>
      </div>
      <div className="panel-wrapper">
        <JournalPanel
          entry={selectedEntry}
          prevEntry={prevEntry}
          nextEntry={nextEntry}
          onClose={closeEntry}
          onNavigate={setSelectedEntry}
          sheetMode={sheetMode}
          introDone={introDone}
          snap={snap}
          heights={heights}
          onSnapChange={setSnap}
          onStart={() => selectEntry(entries[0])}
        />
      </div>
    </div>
  );
}
