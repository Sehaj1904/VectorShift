import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { NodeDetailsPanel } from './components/NodeDetailsPanel';

function App() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      overflow: 'hidden'
    }}>
      <PipelineToolbar />
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <PipelineUI />
      </div>
      <SubmitButton />
      <NodeDetailsPanel />
    </div>
  );
}

export default App;
