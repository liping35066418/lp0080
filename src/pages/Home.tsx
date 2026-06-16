import { useState } from 'react';
import SignWallCanvas from '@/components/SignWallCanvas';
import ControlPanel from '@/components/ControlPanel';
import StatusBar from '@/components/StatusBar';
import Header from '@/components/Header';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useWebSocket();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <SignWallCanvas />
      <Header />
      <ControlPanel
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelCollapsed(!panelCollapsed)}
      />
      <StatusBar />
    </div>
  );
}
