import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { EditorPage } from './pages/EditorPage';
import { FlowchartPage } from './pages/FlowchartPage';
import { SequencePage } from './pages/SequencePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/flowchart" element={<FlowchartPage />} />
      <Route path="/sequence" element={<SequencePage />} />
    </Routes>
  );
}

export default App;
