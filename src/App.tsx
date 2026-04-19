import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Settings, 
  Terminal, 
  Activity, 
  FileText, 
  Play, 
  Square, 
  RefreshCcw, 
  Users, 
  HardDrive, 
  Cpu, 
  Globe,
  Bell,
  Menu,
  X,
  Search,
  Copy,
  Check,
  Shield,
  Zap,
  Wifi,
  Layers,
  ChevronRight,
  Info,
  Lock,
  Cpu as CpuIcon,
  Rocket,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MinecraftServer, ConsoleLog } from './types/minecraft';
import { COMMAND_CATEGORIES } from './lib/commands';
import { cn } from './lib/utils';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, subtext, onClick, children }: { icon: any, label: string, value: string, subtext?: string, onClick?: () => void, children?: React.ReactNode }) => (
  <button 
    onClick={onClick}
    disabled={!onClick}
    className={cn(
      "bg-hw-card border border-hw-border rounded-xl p-3 sm:p-4 flex flex-col gap-1 overflow-hidden transition-all text-left min-w-0 w-full relative",
      onClick ? "active:bg-hw-surface-alt hover:border-accent/30 cursor-pointer" : "cursor-default"
    )}
  >
    <div className="flex items-center justify-between w-full min-w-0 gap-2">
      <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.05em] font-bold text-hw-secondary mb-0.5 sm:mb-1 truncate shrink">{label}</div>
      {onClick && <Copy size={12} className="text-hw-muted shrink-0" />}
    </div>
    <div className="text-[13px] sm:text-lg lg:text-xl font-mono font-bold text-hw-text leading-tight truncate w-full flex items-center justify-between">
      <span>{value}</span>
      {children && <div className="ml-2 shrink-0">{children}</div>}
    </div>
    {subtext && <div className="text-[9px] sm:text-[10px] text-hw-muted font-mono truncate w-full">{subtext}</div>}
  </button>
);

const IconButton = ({ icon: Icon, onClick, active, label, danger, hideLabelOnMobile }: { icon: any, onClick?: () => void, active?: boolean, label?: string, danger?: boolean, hideLabelOnMobile?: boolean }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-bold text-sm active:scale-95 touch-manipulation",
      active 
        ? "bg-accent-dim text-accent border border-accent/20" 
        : danger 
          ? "bg-danger text-white hover:opacity-90"
          : "bg-hw-surface-alt border border-hw-border text-hw-text hover:bg-hw-surface-alt/70"
    )}
  >
    <Icon size={18} />
    {label && <span className={hideLabelOnMobile ? "hidden sm:inline" : ""}>{label}</span>}
  </button>
);

// --- Main App ---

export default function App() {
  const [servers, setServers] = useState<MinecraftServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'performance' | 'settings' | 'files' | 'network' | 'backups' | 'players'>('console');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [command, setCommand] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [newServerName, setNewServerName] = useState('');
  const [newServerVersion, setNewServerVersion] = useState('1.20.1');
  const [newServerSoftware, setNewServerSoftware] = useState('Vanilla');
  const [newServerTier, setNewServerTier] = useState('Starter');
  
  // Game properties
  const [newServerDesc, setNewServerDesc] = useState('');
  const [newServerWorldType, setNewServerWorldType] = useState('Default');
  const [newServerSeed, setNewServerSeed] = useState('');
  const [newServerViewDistance, setNewServerViewDistance] = useState(10);
  const [newServerSimDistance, setNewServerSimDistance] = useState(10);
  const [newServerMaxPlayers, setNewServerMaxPlayers] = useState(20);
  const [newServerGamemode, setNewServerGamemode] = useState('Survival');
  const [newServerDifficulty, setNewServerDifficulty] = useState('Normal');
  const [newServerCracked, setNewServerCracked] = useState(false);
  const [creationConfigTab, setCreationConfigTab] = useState<'world' | 'limits' | 'rules'>('world');
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'plugins'>('general');
  const [installedPlugins, setInstalledPlugins] = useState<{ name: string, size: string, active: boolean }[]>([]);

  const [creationStep, setCreationStep] = useState(1);
  const [firewallRules, setFirewallRules] = useState<{ port: string, protocol: string, label: string, active: boolean }[]>([]);
  const [backups, setBackups] = useState<{ name: string, date: string, size: string }[]>([]);

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [buildProgress, setBuildProgress] = useState<number | null>(null);
  const [toasts, setToasts] = useState<{ id: string, message: string, type: 'success' | 'error' | 'info' }[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Command suggestion state
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const flatSuggestions = useMemo(() => {
    if (!command.startsWith('/')) return [];
    const search = command.toLowerCase().trim();
    const results: { category: string, cmd: string, args: string, desc: string }[] = [];
    
    COMMAND_CATEGORIES.forEach(cat => {
      cat.commands.forEach(c => {
        if (c.cmd.toLowerCase().includes(search) || (c.cmd + ' ' + c.args).toLowerCase().includes(search)) {
          results.push({ category: cat.name, ...c });
        }
      });
    });
    return results;
  }, [command]);
  
  useEffect(() => {
    setSelectedSuggestionIndex(0);
  }, [flatSuggestions]);

  const logEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedServer = servers.find(s => s.id === selectedServerId);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Auto-scroll console with improved detection
  useEffect(() => {
    if (autoScroll && activeTab === 'console' && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
  }, [logs, activeTab, autoScroll, selectedServerId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      setServers(data);
      if (!selectedServerId && data.length > 0) {
        setSelectedServerId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch servers:', err);
    }
  };

  const fetchLogs = async (id: string) => {
    try {
      const res = await fetch(`/api/servers/${id}/logs`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchServers();
    const interval = setInterval(fetchServers, 3000); // Poll server status every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedServerId) {
      fetchLogs(selectedServerId);
      const interval = setInterval(() => fetchLogs(selectedServerId), 2000); // Poll logs every 2s
      return () => clearInterval(interval);
    }
  }, [selectedServerId]);

  const handleDeploy = async () => {
    if (!newServerName.trim()) {
      addToast('Please enter a server name', 'error');
      return;
    }
    
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newServerName,
          version: newServerVersion,
          software: newServerSoftware,
          description: newServerDesc,
          worldType: newServerWorldType,
          worldSeed: newServerSeed,
          viewDistance: newServerViewDistance,
          simDistance: newServerSimDistance,
          maxPlayers: newServerMaxPlayers,
          gamemode: newServerGamemode,
          difficulty: newServerDifficulty,
          cracked: newServerCracked,
          tier: newServerTier
        })
      });
      const data = await res.json();
      setSelectedServerId(data.id);
      setIsCreatingServer(false);
      
      // reset forms
      setNewServerName('');
      setNewServerDesc('');
      setNewServerSeed('');
      setNewServerTier('Starter');
      setNewServerViewDistance(10);
      setNewServerSimDistance(10);
      setNewServerMaxPlayers(20);
      setNewServerGamemode('Survival');
      setNewServerDifficulty('Normal');
      setNewServerCracked(false);
      setCreationStep(1);
      setCreationConfigTab('world');
      
      setActiveTab('console');
      fetchServers();
    } catch (err) {
      console.error('Deploy failed:', err);
    }
  };

  const updateMemoryLimit = async (id: string, maxMemory: number) => {
    try {
      await fetch(`/api/servers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxMemory })
      });
      fetchServers();
    } catch (err) {
      console.error('Update config failed:', err);
    }
  };

  const handleCreateBackup = async () => {
    if (!selectedServerId) return;
    const name = `Manual Backup ${backups.length + 1}`;
    setBackups(prev => [{ name, date: 'Just now', size: '1.1 GB' }, ...prev]);
    addToast('Backup created successfully', 'success');
    
    // Log to backend
    await fetch(`/api/servers/${selectedServerId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: `[SYSTEM] Remote backup cloud sync started: ${name}` })
    });
    fetchLogs(selectedServerId);
  };

  const handleRestoreBackup = (name: string) => {
    addToast(`Restoring ${name}...`, 'info');
    setTimeout(() => addToast('Server restored to previous state', 'success'), 2000);
  };

  const handleAddRule = () => {
    const ports = ['8080', '25567', '19132', '80', '443'];
    const randomPort = ports[Math.floor(Math.random() * ports.length)];
    setFirewallRules(prev => [...prev, { port: randomPort, protocol: 'TCP', label: 'Service Point', active: true }]);
    addToast(`Firewall rule for port ${randomPort} added`, 'success');
  };

  const handleToggleRule = (index: number) => {
    setFirewallRules(prev => prev.map((r, i) => i === index ? { ...r, active: !r.active } : r));
    addToast('Firewall policy updated', 'info');
  };

  const handleBuildAPK = () => {
    setBuildProgress(0);
    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setBuildProgress(null), 2000);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleStart = async () => {
    if (!selectedServerId || selectedServer?.status === 'RUNNING') return;
    try {
      addToast('Booting server...', 'info');
      await fetch(`/api/servers/${selectedServerId}/start`, { method: 'POST' });
      fetchServers();
    } catch (err) {
      addToast('Boot failed', 'error');
      console.error('Start failed:', err);
    }
  };

  const handleStop = async () => {
    if (!selectedServerId || selectedServer?.status === 'STOPPED') return;
    try {
      addToast('Stopping server...', 'info');
      await fetch(`/api/servers/${selectedServerId}/stop`, { method: 'POST' });
      fetchServers();
    } catch (err) {
      addToast('Stop failed', 'error');
      console.error('Stop failed:', err);
    }
  };

  const handleRestart = async () => {
    if (!selectedServerId) return;
    await handleStop();
    setTimeout(handleStart, 2500);
  };

  const handleCommandInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommand(val);
    if (val.startsWith('/')) {
      setShowCommandSuggestions(true);
    } else {
      setShowCommandSuggestions(false);
    }
  };

  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showCommandSuggestions && flatSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev + 1) % flatSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev - 1 + flatSuggestions.length) % flatSuggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatSuggestions[selectedSuggestionIndex];
        const newCmd = `${selected.cmd} ${selected.args}`.replace(/\s+/g, ' ').trim() + ' ';
        setCommand(newCmd);
        setShowCommandSuggestions(false);
      } else if (e.key === 'Escape') {
        setShowCommandSuggestions(false);
      }
    }
  };

  const handleCommandSubmitArgs = async (cmd: string) => {
    if (!cmd.trim() || !selectedServerId || selectedServer?.status !== 'RUNNING') return;
    try {
      await fetch(`/api/servers/${selectedServerId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      fetchLogs(selectedServerId);
      // Wait slightly then refetch servers so player list updates
      setTimeout(fetchServers, 500); 
    } catch (err) {
      console.error('Command failed:', err);
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !selectedServerId || selectedServer?.status !== 'RUNNING') return;
    
    try {
      await fetch(`/api/servers/${selectedServerId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      setCommand('');
      setShowCommandSuggestions(false);
      fetchLogs(selectedServerId);
    } catch (err) {
      console.error('Command failed:', err);
    }
  };

  const perfData = Array.from({ length: 7 }, (_, i) => ({ time: `${i}s`, ram: 0 }));

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#0A0A0B] selection:bg-accent/30 text-hw-text font-sans">
      {/* Toast System */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={cn(
                "px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 min-w-[240px] pointer-events-auto backdrop-blur-md",
                toast.type === 'success' ? "bg-accent/10 border-accent/20 text-accent" :
                toast.type === 'error' ? "bg-danger/10 border-danger/20 text-danger" :
                "bg-hw-surface-alt border-hw-border text-hw-text"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                toast.type === 'success' ? "bg-accent" :
                toast.type === 'error' ? "bg-danger" : "bg-hw-muted"
              )} />
              <span className="text-sm font-bold tracking-tight">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className={cn(
          "fixed inset-y-0 left-0 w-60 bg-hw-card border-r border-hw-border z-50 lg:relative lg:translate-x-0 transition-transform duration-300",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full py-6">
          <div className="px-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-hw-bg font-bold">
                PM
              </div>
              <div className="text-hw-text font-bold">
                PocketMC <span className="font-normal text-hw-secondary">Host</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-hw-secondary">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-hw-secondary uppercase tracking-widest px-2 mb-2">Navigation</p>
              {[
                { id: 'console', label: 'Dashboard', icon: Activity },
                { id: 'network', label: 'Network', icon: Globe },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "px-3 py-2 flex items-center gap-3 cursor-pointer rounded-lg transition-colors active:bg-hw-surface-alt",
                    activeTab === item.id || (item.id === 'console' && (activeTab === 'performance' || activeTab === 'files' || activeTab === 'backups'))
                      ? "text-accent bg-accent-dim" 
                      : "text-hw-secondary hover:text-hw-text"
                  )}
                >
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-black text-hw-secondary uppercase tracking-[0.14em] px-2 mb-3 opacity-60">My Servers</p>
              {servers.map(server => (
                <button
                  key={server.id}
                  onClick={() => {
                    setSelectedServerId(server.id);
                    if (window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg transition-all active:scale-[0.98]",
                    selectedServerId === server.id 
                      ? "bg-hw-surface-alt border border-hw-border shadow-lg" 
                      : "hover:bg-white/5 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      server.status === 'RUNNING' ? 'bg-accent shadow-[0_0_8px_rgba(76,217,100,0.4)]' : 'bg-red-500/50'
                    )} />
                    <div className="text-left overflow-hidden w-full">
                      <p className={cn("text-[13px] truncate w-full", selectedServerId === server.id ? "font-bold text-hw-text" : "font-semibold text-hw-secondary")}>{server.name}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[10px] text-hw-muted uppercase font-black tracking-widest">{server.software}</p>
                        {server.playersList && server.playersList.some(p => p.online) && (
                          <div className="flex -space-x-1.5 ml-2 shrink-0">
                            {server.playersList.filter(p => p.online).slice(0, 3).map((player, i) => (
                              <img key={i} className="w-4 h-4 rounded-full border border-[0.5px] border-hw-card z-10" src={`https://minotar.net/helm/${player.name}/16.png`} alt={player.name} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              <button 
                onClick={() => {
                  setIsCreatingServer(true);
                  setIsSidebarOpen(false);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 p-3 border border-dashed border-hw-border rounded-lg text-hw-secondary hover:text-hw-text active:bg-white/5"
              >
                <Plus size={16} />
                <span className="text-[10px] font-bold uppercase tracking-tight">New Server</span>
              </button>
            </div>
          </div>

          <div className="px-6 pt-6 border-t border-hw-border">
            <div className="flex justify-between text-xs font-bold mb-1.5 text-hw-secondary uppercase tracking-tight">
              <span>Battery Status</span>
              <span className="text-hw-text">82%</span>
            </div>
            <div className="h-1 bg-hw-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: '82%' }} />
            </div>
            
            <div className="flex justify-between text-xs font-bold mt-5 mb-1.5 text-hw-secondary uppercase tracking-tight">
              <span>CPU Temp</span>
              <span className="text-hw-text">42°C</span>
            </div>
            <div className="h-1 bg-hw-muted rounded-full overflow-hidden">
              <div className="h-full bg-warning" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full bg-hw-bg relative min-w-0">
        <div className="scanline absolute inset-0 opacity-10 pointer-events-none" />
        
        {!isCreatingServer && (
          <>
            <header className="h-20 sm:h-24 flex items-center justify-between px-4 sm:px-6 bg-transparent z-30 shrink-0">
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-hw-secondary p-1">
                  <Menu size={24} />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight mb-0.5 sm:mb-1 truncate">{selectedServer?.name || "Select a Server"}</h1>
                  <div className={cn(
                    "status-pill flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold w-fit border transition-all",
                    selectedServer?.status === 'RUNNING' ? "bg-accent-dim text-accent border-accent/10" : 
                    selectedServer?.status === 'STARTING' || selectedServer?.status === 'STOPPING' ? "bg-warning/10 text-warning border-warning/10" :
                    "bg-hw-surface-alt text-hw-secondary border-hw-border"
                  )}>
                    <div className={cn(
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                      selectedServer?.status === 'RUNNING' ? "bg-accent animate-pulse" : 
                      selectedServer?.status === 'STARTING' || selectedServer?.status === 'STOPPING' ? "bg-warning animate-spin" :
                      "bg-hw-muted"
                    )} />
                    <span className="truncate tracking-tight lowercase first-letter:uppercase">
                      {selectedServer?.status} — {selectedServer?.software}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {selectedServer?.publicIp && (
                  <button 
                    onClick={() => {
                      copyToClipboard(selectedServer.publicIp!);
                      addToast('Address copied', 'success');
                    }}
                    className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-hw-surface-alt rounded-lg border border-hw-border text-xs font-mono text-hw-secondary hover:text-hw-text active:scale-95 transition-all"
                  >
                    {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
                    {selectedServer.publicIp}
                  </button>
                )}
                
                <div className="hidden sm:flex items-center gap-2">
                  {['STOPPED', 'CRASHED'].includes(selectedServer?.status || '') ? (
                    <IconButton icon={Play} label="Start" active onClick={handleStart} />
                  ) : selectedServer?.status === 'RUNNING' ? (
                    <>
                      <IconButton icon={RefreshCcw} label="Restart" onClick={handleRestart} />
                      <IconButton icon={Square} danger label="Stop" onClick={handleStop} />
                    </>
                  ) : (
                    <div className="flex items-center gap-3 bg-hw-surface-alt px-4 py-2 rounded-lg border border-hw-border">
                      <span className="text-[10px] font-black uppercase text-hw-secondary animate-pulse">{selectedServer?.status}</span>
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Mobile quick controls bar */}
            <AnimatePresence>
              {selectedServer && (
                <motion.div 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className="fixed bottom-0 left-0 right-0 sm:hidden z-[60] bg-hw-card/95 backdrop-blur-xl border-t border-hw-border p-4 flex gap-4"
                >
                  {['STOPPED', 'CRASHED'].includes(selectedServer.status) ? (
                    <button onClick={handleStart} className="flex-1 bg-accent text-hw-bg py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_8px_24px_rgba(76,217,100,0.3)]">
                      Start Engine
                    </button>
                  ) : selectedServer.status === 'RUNNING' ? (
                    <>
                      <button onClick={handleRestart} className="flex-1 bg-hw-surface-alt text-hw-text py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-hw-border">
                        Restart
                      </button>
                      <button onClick={handleStop} className="flex-1 bg-danger text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_8px_24px_rgba(255,59,48,0.3)]">
                        Stop
                      </button>
                    </>
                  ) : (
                    <div className="flex-1 bg-hw-surface-alt text-hw-secondary py-4 rounded-2xl font-black uppercase tracking-widest text-sm border border-hw-border text-center animate-pulse">
                      System: {selectedServer.status}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-4 sm:px-6 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex gap-6 sm:gap-8 border-b border-hw-border min-w-max">
                {[
                  { id: 'console', label: 'Console' },
                  { id: 'settings', label: 'Settings' },
                  { id: 'performance', label: 'Stats' },
                  { id: 'players', label: 'Players' },
                  { id: 'files', label: 'Files' },
                  { id: 'network', label: 'Network' },
                  { id: 'backups', label: 'Backups' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "py-3 sm:py-4 text-xs sm:text-sm font-bold relative transition-colors uppercase tracking-tight",
                      activeTab === tab.id ? "text-accent" : "text-hw-secondary hover:text-hw-text"
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" 
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative p-4 sm:p-6 gap-4 sm:gap-8 pb-32 sm:pb-8">
          {isCreatingServer ? (
            <motion.div 
              key="creator"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-50 bg-hw-bg p-4 sm:p-6 overflow-y-auto"
            >
              <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 pb-20 mt-4 sm:mt-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Create New Instance</h2>
                    <p className="text-[11px] sm:text-sm text-hw-secondary font-medium">Step {creationStep} of 4</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCreatingServer(false);
                      setCreationStep(1);
                    }} 
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex gap-2 mb-8">
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className={cn("h-1.5 flex-1 rounded-full transition-all", step <= creationStep ? "bg-accent" : "bg-hw-border")} />
                  ))}
                </div>

                {creationStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 flex justify-between">
                        <span>Server Name</span>
                        <span className="text-accent">*Required</span>
                      </label>
                      <input 
                        type="text" 
                        value={newServerName}
                        onChange={(e) => setNewServerName(e.target.value)}
                        placeholder="e.g. My Pocket SMP"
                        className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-hw-muted/50"
                        autoFocus
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 flex justify-between">
                        <span>Description</span>
                        <span className="text-hw-secondary">Optional</span>
                      </label>
                      <textarea 
                        value={newServerDesc}
                        onChange={(e) => setNewServerDesc(e.target.value)}
                        placeholder="A short description of this server..."
                        className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-hw-muted/50 resize-none h-20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 block">Version</label>
                        <select 
                          value={newServerVersion}
                          onChange={(e) => setNewServerVersion(e.target.value)}
                          className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent appearance-none outline-none"
                        >
                          <option value="1.20.1">1.20.1 (Latest)</option>
                          <option value="1.19.4">1.19.4</option>
                          <option value="1.18.2">1.18.2</option>
                          <option value="1.16.5">1.16.5</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 block">Platform</label>
                        <select 
                          value={newServerSoftware}
                          onChange={(e) => setNewServerSoftware(e.target.value)}
                          className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent appearance-none outline-none"
                        >
                          <option value="Vanilla">Vanilla (Official)</option>
                          <option value="Paper">PaperMC (Performance)</option>
                          <option value="Fabric">Fabric (Modded)</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={() => newServerName.trim() ? setCreationStep(2) : addToast('Please enter a server name', 'error')}
                      className="w-full py-4 bg-white text-black font-black rounded-xl active:scale-[0.98] transition-all hover:bg-white/90 shadow-lg uppercase tracking-widest text-sm mt-4"
                    >
                      Next Step
                    </button>
                  </motion.div>
                )}

                {creationStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="flex gap-6 border-b border-hw-border shrink-0">
                      {[
                        { id: 'world', label: 'World' },
                        { id: 'limits', label: 'Limits' },
                        { id: 'rules', label: 'Game Rules' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setCreationConfigTab(tab.id as any)}
                          className={cn(
                            "py-3 text-[10px] font-bold relative transition-colors uppercase tracking-[0.15em]",
                            creationConfigTab === tab.id ? "text-accent" : "text-hw-secondary hover:text-hw-text"
                          )}
                        >
                          {tab.label}
                          {creationConfigTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 min-h-[260px]">
                      {creationConfigTab === 'world' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 block">World Type</label>
                            <select 
                              value={newServerWorldType}
                              onChange={(e) => setNewServerWorldType(e.target.value)}
                              className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent appearance-none outline-none"
                            >
                              <option value="Default">Default</option>
                              <option value="Flat">Superflat</option>
                              <option value="Large Biomes">Large Biomes</option>
                              <option value="Amplified">Amplified</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 flex justify-between">
                              <span>World Seed</span>
                              <span className="text-hw-secondary">Optional</span>
                            </label>
                            <input 
                              type="text" 
                              value={newServerSeed}
                              onChange={(e) => setNewServerSeed(e.target.value)}
                              placeholder="Leave empty for random seed"
                              className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:text-hw-muted/50"
                            />
                          </div>
                        </div>
                      )}

                      {creationConfigTab === 'limits' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 flex justify-between">
                              <span>View Distance</span>
                              <span className="text-accent">{newServerViewDistance} Chunks</span>
                            </label>
                            <input 
                              type="range" 
                              min="2" max="32" 
                              value={newServerViewDistance}
                              onChange={(e) => setNewServerViewDistance(parseInt(e.target.value))}
                              className="w-full accent-accent"
                            />
                            <p className="text-[9px] text-hw-secondary">Higher values severely impact performance. Mobile clients may struggle.</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 flex justify-between">
                              <span>Simulation Distance</span>
                              <span className="text-accent">{newServerSimDistance} Chunks</span>
                            </label>
                            <input 
                              type="range" 
                              min="2" max="32" 
                              value={newServerSimDistance}
                              onChange={(e) => setNewServerSimDistance(parseInt(e.target.value))}
                              className="w-full accent-accent"
                            />
                            <p className="text-[9px] text-hw-secondary">How far away game mechanics (like mob spawns) process.</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 flex justify-between">
                              <span>Max Players</span>
                              <span className="text-accent">{newServerMaxPlayers} Players</span>
                            </label>
                            <input 
                              type="range" 
                              min="2" max="200" 
                              value={newServerMaxPlayers}
                              onChange={(e) => setNewServerMaxPlayers(parseInt(e.target.value))}
                              className="w-full accent-accent"
                            />
                          </div>
                        </div>
                      )}

                      {creationConfigTab === 'rules' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 block">Default Gamemode</label>
                              <select 
                                value={newServerGamemode}
                                onChange={(e) => setNewServerGamemode(e.target.value)}
                                className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent appearance-none outline-none"
                              >
                                <option value="Survival">Survival</option>
                                <option value="Creative">Creative</option>
                                <option value="Adventure">Adventure</option>
                                <option value="Spectator">Spectator</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted mb-2 block">Difficulty</label>
                              <select 
                                value={newServerDifficulty}
                                onChange={(e) => setNewServerDifficulty(e.target.value)}
                                className="w-full bg-hw-card border border-hw-border rounded-xl px-4 py-3 text-sm focus:border-accent appearance-none outline-none"
                              >
                                <option value="Peaceful">Peaceful</option>
                                <option value="Easy">Easy</option>
                                <option value="Normal">Normal</option>
                                <option value="Hard">Hard</option>
                              </select>
                            </div>
                          </div>

                          <div className="p-4 bg-hw-surface-alt border border-hw-border rounded-xl flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-hw-text">Cracked Players (Offline Mode)</p>
                              <p className="text-[10px] text-hw-secondary mt-1 max-w-[200px] sm:max-w-xs">Allow players without a premium Minecraft account to join. Disables skins and UUID security.</p>
                            </div>
                            <button 
                              onClick={() => setNewServerCracked(!newServerCracked)}
                              className={cn(
                                "w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0",
                                newServerCracked ? "bg-accent" : "bg-hw-muted"
                              )}
                            >
                              <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", newServerCracked ? "translate-x-6" : "translate-x-0")} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setCreationStep(1)}
                        className="px-6 py-4 border border-hw-border rounded-xl font-black text-xs uppercase hover:bg-white/5 active:scale-95 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setCreationStep(3)}
                        className="flex-1 py-4 bg-white text-black font-black rounded-xl active:scale-[0.98] transition-all hover:bg-white/90 shadow-lg uppercase tracking-widest text-sm"
                      >
                        Next Step
                      </button>
                    </div>
                  </motion.div>
                )}

                {creationStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.15em] text-hw-muted block mb-4">Hardware Profile Allocation</label>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'Starter', label: 'Starter Tier', ram: '1.5GB', cpu: '1 Core', rec: 'Mobile Recommended', desc: 'Perfect for small groups of 2-5 players on mobile devices.' },
                        { id: 'Power', label: 'Power Tier', ram: '4GB', cpu: '2 Core', rec: 'Tablet / PC', desc: 'Handles more entity rendering and up to 15 concurrent players.' },
                        { id: 'God-Mode', label: 'God-Mode', ram: '8GB', cpu: '4 Core', rec: 'High-End Desktop Only', desc: 'Maximum performance. Standard mobile devices may experience thermal throttling.' },
                      ].map((tier) => (
                        <div 
                          key={tier.id} 
                          onClick={() => setNewServerTier(tier.id)}
                          className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between",
                            newServerTier === tier.id ? "bg-accent/5 border-accent shadow-[0_4px_12px_rgba(76,217,100,0.1)]" : "bg-hw-card border-hw-border hover:border-hw-muted"
                          )}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className={cn("text-xs font-bold uppercase", newServerTier === tier.id ? "text-accent" : "text-hw-text")}>{tier.label}</p>
                              {tier.rec && <span className="text-[9px] px-1.5 py-0.5 rounded bg-hw-surface-alt border border-hw-border text-hw-secondary">{tier.rec}</span>}
                            </div>
                            <p className="text-[10px] text-hw-secondary max-w-sm leading-relaxed">{tier.desc}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-lg font-bold font-mono">{tier.ram}</p>
                            <p className="text-[10px] text-hw-muted">{tier.cpu}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setCreationStep(2)}
                        className="px-6 py-4 border border-hw-border rounded-xl font-black text-xs uppercase hover:bg-white/5 active:scale-95 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setCreationStep(4)}
                        className="flex-1 py-4 bg-white text-black font-black rounded-xl active:scale-[0.98] transition-all hover:bg-white/90 shadow-lg uppercase tracking-widest text-sm"
                      >
                        Next Step
                      </button>
                    </div>
                  </motion.div>
                )}

                {creationStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <div className="p-6 bg-hw-card border border-hw-border rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold border-b border-hw-border pb-4">Deployment Summary</h3>
                      
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-hw-border/50">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-hw-secondary font-bold">Server Name</span>
                          <p className="font-bold text-sm">{newServerName}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-hw-secondary font-bold">Platform</span>
                          <p className="font-bold text-sm">{newServerSoftware} ({newServerVersion})</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-hw-secondary font-bold">Gamemode & Rules</span>
                          <p className="font-bold text-sm">{newServerGamemode} — {newServerDifficulty}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase text-hw-secondary font-bold">World Settings</span>
                          <p className="font-bold text-sm">{newServerWorldType} (Max: {newServerMaxPlayers} players)</p>
                        </div>
                      </div>

                      <div className="flex justify-between py-2 text-sm">
                        <span className="text-hw-secondary font-bold uppercase text-[10px]">Hardware Profile</span>
                        <span className="font-bold text-accent uppercase tracking-wider">{newServerTier}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setCreationStep(3)}
                        className="px-6 py-4 border border-hw-border rounded-xl font-black text-xs uppercase hover:bg-white/5 active:scale-95 transition-all"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleDeploy}
                        className="flex-1 py-4 bg-accent text-hw-bg font-black rounded-xl active:scale-[0.98] transition-all hover:brightness-110 shadow-[0_8px_24px_rgba(76,217,100,0.3)] uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                      >
                        <Rocket size={18} />
                        DEPLOY INSTANCE
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : selectedServer ? (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                <StatCard 
                  icon={RefreshCcw} 
                  label="Uptime" 
                  value={selectedServer.status === 'RUNNING' ? "12h 45m" : "Offline"} 
                />
                <StatCard 
                  icon={Activity} 
                  label="RAM Usage" 
                  value={selectedServer.status === 'RUNNING' ? `${Math.round(selectedServer.memoryUsage)} MB` : "0 MB"} 
                  subtext={`/ ${selectedServer.maxMemory} MB`}
                />
                <StatCard 
                  icon={Users} 
                  label="Players" 
                  value={selectedServer.status === 'RUNNING' ? `${selectedServer.playersList?.filter(p => p.online).length || 0}` : "0"} 
                  subtext={`/ ${selectedServer.maxPlayers}`}
                  onClick={() => setActiveTab('players')}
                >
                  {selectedServer.status === 'RUNNING' && selectedServer.playersList && selectedServer.playersList.some(p => p.online) && (
                     <div className="flex -space-x-2 overflow-hidden mt-1 sm:mt-0 opacity-80 group-hover:opacity-100 transition-opacity">
                       {selectedServer.playersList.filter(p => p.online).slice(0, 3).map((player, i) => (
                         <img key={i} className="inline-block h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-hw-card z-10" src={`https://minotar.net/helm/${player.name}/24.png`} alt={player.name} />
                       ))}
                       {selectedServer.playersList.filter(p => p.online).length > 3 && (
                         <div className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full ring-2 ring-hw-card bg-hw-surface-alt text-[8px] sm:text-[9px] font-bold z-0">
                           +{selectedServer.playersList.filter(p => p.online).length - 3}
                         </div>
                       )}
                     </div>
                  )}
                </StatCard>
                <StatCard 
                  icon={Globe} 
                  label="Network IP" 
                  value={selectedServer.publicIp || "None"} 
                  onClick={selectedServer.publicIp ? () => {
                    copyToClipboard(selectedServer.publicIp!);
                    addToast('IP Copied', 'success');
                  } : undefined}
                />
              </div>

              {/* Tab Views */}
              <div className="flex-1 bg-black border border-hw-border rounded-xl overflow-hidden flex flex-col min-h-0 min-w-0 w-full relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'console' && (
                    <motion.div 
                      key="console"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 flex flex-col w-full h-full"
                    >
                      <div className="bg-hw-surface-alt p-2 px-4 border-b border-hw-border flex items-center justify-between text-[11px] text-hw-secondary">
                        <span>Real-time Logs</span>
                        <button 
                          onClick={() => setAutoScroll(!autoScroll)}
                          className={cn(
                            "flex items-center gap-2 transition-all hover:text-hw-text active:scale-95",
                            autoScroll ? "text-accent" : "text-hw-muted"
                          )}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", autoScroll ? "bg-accent animate-pulse" : "bg-hw-muted")} />
                          Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      
                        <div className="flex-1 overflow-y-auto p-3 sm:p-6 font-mono text-[11px] sm:text-[13px] space-y-1 sm:space-y-1.5 leading-normal sm:leading-relaxed text-[#E4E4E7]">
                          {logs.length === 0 && (
                            <div className="h-full flex items-center justify-center text-hw-muted italic opacity-50">
                              System ready. Awaiting boot...
                            </div>
                          )}
                          {logs.map((log, i) => {
                            // Extract role from chat logs using Regex for custom chat color
                            let messageNode: React.ReactNode = log.message;
                            if (log.level === 'chat') {
                              const match = log.message.match(/^\[(.*?)\]\s?(.*)/);
                              if (match) {
                                const role = match[1].toUpperCase();
                                const rest = match[2];
                                
                                if (role === 'ADMIN' || role === 'MOD') {
                                  const colorClass = role === 'ADMIN' ? 'text-red-500' : 'text-green-500';
                                  messageNode = (
                                    <>
                                      <span className={cn("font-bold mr-1.5", colorClass)}>[{role}]</span>
                                      <span className="text-white">{rest}</span>
                                    </>
                                  );
                                } else {
                                  // For unknown or disabled roles, omit the badge matching prefix formatting entirely.
                                  messageNode = (
                                    <span className="text-white">{rest}</span>
                                  );
                                }
                              }
                            }
                            return (
                              <div key={i} className="break-all">
                                <span className="text-hw-muted mr-1.5">[{log.timestamp}]</span>
                                {log.level !== 'chat' && (
                                  <span className={cn(
                                    "font-bold",
                                    log.level === 'warn' ? 'text-warning' : 
                                    log.level === 'error' ? 'text-danger' :
                                    log.level === 'info' ? 'text-[#3b82f6]' : ''
                                  )}>
                                    [{log.level.toUpperCase()}] 
                                  </span>
                                )}
                                {log.level !== 'chat' ? (
                                  <span className={log.level === 'warn' ? 'text-warning' : log.level === 'error' ? 'text-danger' : ''}> {log.message}</span>
                                ) : (
                                  messageNode
                                )}
                              </div>
                            );
                          })}
                          <div className="text-accent">
                            <span className="text-hw-muted mr-2">[14:26:10]</span>
                            [RELAY] Tunnel stable. Ping: 42ms
                          </div>
                          <div ref={logEndRef} />
                        </div>

                      <div className="relative p-3 px-4 bg-[#080808] border-t border-hw-border flex items-center gap-3">
                        {/* Command Suggestions Popup */}
                        <AnimatePresence>
                          {showCommandSuggestions && flatSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.98 }}
                              className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-hw-surface-alt/95 backdrop-blur-xl border border-hw-border rounded-xl shadow-2xl max-h-64 flex flex-col overflow-hidden z-50"
                            >
                              <div className="px-3 py-2 border-b border-hw-border/50 bg-black/20 text-[10px] uppercase font-bold tracking-wider text-hw-secondary shrink-0">
                                Command Suggestions ({flatSuggestions.length})
                              </div>
                              <div className="flex-1 overflow-y-auto no-scrollbar">
                                {flatSuggestions.map((suggestion, index) => (
                                  <div
                                    key={`${suggestion.category}-${suggestion.cmd}-${index}`}
                                    onClick={() => {
                                      const newCmd = `${suggestion.cmd} ${suggestion.args}`.replace(/\s+/g, ' ').trim() + ' ';
                                      setCommand(newCmd);
                                      setShowCommandSuggestions(false);
                                    }}
                                    className={cn(
                                      "px-4 py-2 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 transition-colors",
                                      index === selectedSuggestionIndex ? "bg-accent/20 text-accent" : "hover:bg-hw-card text-hw-text"
                                    )}
                                  >
                                    <div className="flex items-baseline gap-2 font-mono text-xs truncate">
                                      <span className="font-bold">{suggestion.cmd}</span>
                                      {suggestion.args && <span className={cn("opacity-60", index === selectedSuggestionIndex ? "text-accent" : "text-hw-muted")}>{suggestion.args}</span>}
                                    </div>
                                    <div className={cn("text-[10px] truncate shrink-0", index === selectedSuggestionIndex ? "text-accent/80" : "text-hw-secondary")}>
                                      {suggestion.desc}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <span className="text-accent font-mono shrink-0">&gt;</span>
                        <form onSubmit={handleCommandSubmit} className="flex-1 min-w-0">
                          <input 
                            value={command}
                            disabled={selectedServer?.status !== 'RUNNING'}
                            onChange={handleCommandInputChange}
                            onKeyDown={handleCommandKeyDown}
                            placeholder={selectedServer?.status === 'RUNNING' ? "Type a command (e.g. /op username)" : "Server is offline"}
                            className="w-full bg-transparent border-none text-hw-text focus:ring-0 outline-none font-mono text-[11px] sm:text-[13px] disabled:opacity-30 placeholder:text-hw-secondary overflow-hidden text-ellipsis"
                            autoComplete="off"
                            spellCheck="false"
                          />
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'performance' && (
                    <motion.div 
                      key="performance"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 p-3 sm:p-6 overflow-y-auto"
                    >
                      <div className="h-[300px] w-full">
                        <p className="text-xs font-bold text-hw-muted uppercase tracking-widest mb-6">Memory Usage (MB)</p>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={perfData}>
                            <defs>
                              <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4CD964" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4CD964" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                            <XAxis dataKey="time" stroke="#8E8E93" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#8E8E93" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#16161A', borderColor: '#2C2C2E', color: '#FFFFFF' }}
                              itemStyle={{ color: '#4CD964' }}
                            />
                            <Area type="monotone" dataKey="ram" stroke="#4CD964" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8">
                        <div className="bg-hw-surface-alt/50 p-4 rounded-xl border border-hw-border">
                          <p className="text-[10px] text-hw-secondary uppercase font-black mb-1">CPU Load</p>
                          <div className="text-xl font-mono font-bold">{(selectedServer?.cpuUsage || 0).toFixed(1)}%</div>
                          <div className="w-full h-1 bg-hw-border rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${selectedServer?.cpuUsage || 0}%` }} />
                          </div>
                        </div>
                        <div className="bg-hw-surface-alt/50 p-4 rounded-xl border border-hw-border">
                          <p className="text-[10px] text-hw-secondary uppercase font-black mb-1">Heap Used</p>
                          <div className="text-xl font-mono font-bold">{Math.round(selectedServer?.memoryUsage || 0)}MB</div>
                          <div className="w-full h-1 bg-hw-border rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${((selectedServer?.memoryUsage || 0) / (selectedServer?.maxMemory || 1)) * 100}%` }} />
                          </div>
                        </div>
                        <div className="bg-hw-surface-alt/50 p-4 rounded-xl border border-hw-border">
                          <p className="text-[10px] text-hw-secondary uppercase font-black mb-1">Storage</p>
                          <div className="text-xl font-mono font-bold">1.2GB</div>
                          <div className="w-full h-1 bg-hw-border rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-accent w-[42%]" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div 
                      key="settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 p-3 sm:p-6 space-y-8 overflow-y-auto"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Internal Navigation Sidebar */}
                        <div className="lg:col-span-1 space-y-1 lg:sticky lg:top-4 self-start z-10">
                          <button 
                            onClick={() => setSettingsSubTab('general')}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                              settingsSubTab === 'general' ? "bg-accent/10 border border-accent/20 text-accent" : "text-hw-secondary hover:text-hw-text hover:bg-white/5"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Settings size={18} className={cn("transition-colors", settingsSubTab === 'general' ? "text-accent" : "group-hover:text-hw-text")} />
                              <span className="text-sm font-bold tracking-tight">General</span>
                            </div>
                            <ChevronRight size={16} className={cn("transition-all", settingsSubTab === 'general' ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                          </button>
                          
                          <button 
                            onClick={() => setSettingsSubTab('plugins')}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl transition-all group",
                              settingsSubTab === 'plugins' ? "bg-accent/10 border border-accent/20 text-accent" : "text-hw-secondary hover:text-hw-text hover:bg-white/5"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Layers size={18} className={cn("transition-colors", settingsSubTab === 'plugins' ? "text-accent" : "group-hover:text-hw-text")} />
                              <span className="text-sm font-bold tracking-tight">Plugins/Mods</span>
                            </div>
                            <ChevronRight size={16} className={cn("transition-all", settingsSubTab === 'plugins' ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                          </button>

                          {[
                            { icon: Zap, label: 'Performance' },
                            { icon: Lock, label: 'Security' },
                            { icon: Shield, label: 'Anti-DDoS' },
                          ].map((item, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-hw-secondary hover:text-hw-text transition-all group text-left">
                              <div className="flex items-center gap-3">
                                <item.icon size={18} className="group-hover:text-hw-text transition-colors" />
                                <span className="text-sm font-semibold">{item.label}</span>
                              </div>
                              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                          ))}
                        </div>

                        {/* Settings Form Content */}
                        <div className="lg:col-span-3 space-y-10">
                          {settingsSubTab === 'general' ? (
                            <>
                              {/* Hardware Section */}
                              <section className="space-y-6">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary">Resource Allocation</h3>
                              <div className="h-px flex-1 bg-hw-border/50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-hw-surface-alt/50 p-6 rounded-2xl border border-hw-border space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-black text-hw-muted uppercase tracking-[0.15em]">Max RAM</label>
                                  <span className="text-[11px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">{(selectedServer?.maxMemory || 0) / 1024} GB</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="512"
                                  max="8192"
                                  step="256"
                                  value={selectedServer?.maxMemory || 2048}
                                  onChange={(e) => updateMemoryLimit(selectedServerId!, parseInt(e.target.value))}
                                  className="w-full accent-accent bg-hw-border h-1 rounded-full appearance-none outline-none" 
                                />
                                <p className="text-[10px] text-hw-secondary italic">Higher allocation allows more complex plugins/worlds.</p>
                              </div>
                              <div className="bg-hw-surface-alt/50 p-6 rounded-2xl border border-hw-border space-y-4">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-hw-muted uppercase tracking-widest">CPU Threads</label>
                                  <span className="text-xs font-mono text-accent">Auto</span>
                                </div>
                                <select className="w-full bg-hw-bg border border-hw-border rounded-xl px-4 py-2 text-sm outline-none">
                                  <option>Intelligent (Balanced)</option>
                                  <option>Performance (P-Cores)</option>
                                  <option>Efficiency (E-Cores)</option>
                                </select>
                              </div>
                            </div>
                          </section>

                          {/* Stability Section */}
                          <section className="space-y-6">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary">Maintenance</h3>
                              <div className="h-px flex-1 bg-hw-border/50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-5 bg-hw-surface-alt/50 border border-hw-border rounded-xl group hover:border-accent/30 transition-all">
                                <div>
                                  <p className="text-sm font-bold">Auto-Recovery</p>
                                  <p className="text-[10px] text-hw-secondary">Restart on crash detection.</p>
                                </div>
                                <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-hw-bg rounded-full" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-5 bg-hw-surface-alt/50 border border-hw-border rounded-xl">
                                <div>
                                  <p className="text-sm font-bold">Health Checks</p>
                                  <p className="text-[10px] text-hw-secondary">Periodic heartbeat monitor.</p>
                                </div>
                                <div className="w-10 h-5 bg-hw-muted rounded-full relative cursor-pointer">
                                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-hw-bg rounded-full" />
                                </div>
                              </div>
                            </div>
                          </section>

                          {/* Remote Management */}
                          <section className="space-y-6">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-hw-secondary">Discord Integration</h3>
                              <div className="h-px flex-1 bg-hw-border/50" />
                            </div>
                            <div className="bg-hw-surface-alt/50 p-6 rounded-2xl border border-hw-border space-y-6">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold text-hw-muted uppercase tracking-widest">API Secret Key</label>
                                  <div className="relative">
                                    <input type="password" value={showApiKey ? "sk_live_98a72b4c10..." : "************************"} readOnly={!showApiKey} className="w-full bg-hw-bg border border-hw-border rounded-xl px-4 py-3 text-sm font-mono focus:border-accent outline-none" />
                                    <button onClick={() => setShowApiKey(!showApiKey)} className={cn("absolute right-3 top-3 text-[10px] font-bold uppercase", showApiKey ? "text-hw-muted" : "text-accent")}>{showApiKey ? 'Hide' : 'Reveal'}</button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-2">
                                  <div className="flex items-center gap-2 text-hw-secondary">
                                    <Info size={14} />
                                    <span>Bot is <b>Active</b> on Netherite Node</span>
                                  </div>
                                  <button onClick={() => addToast('Logs synced with Discord', 'success')} className="text-accent font-bold uppercase tracking-tight hover:underline">Sync Logs</button>
                                </div>
                              </div>
                            </div>
                          </section>

                          {/* Android Native Features */}
                          <section className="space-y-6">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-hw-secondary">Native Android Hosting</h3>
                              <div className="h-px flex-1 bg-hw-border/50" />
                            </div>
                             <div className="p-6 border border-accent/30 bg-accent/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div className="flex items-start gap-4 text-center sm:text-left">
                                <IconButton icon={CpuIcon} active />
                                <div>
                                  <p className="text-sm font-bold">Native APK Export</p>
                                  <p className="text-xs text-hw-secondary max-w-sm">Move this project to a standalone Android app for better lifecycle management and foreground services.</p>
                                </div>
                              </div>
                              <button 
                                onClick={handleBuildAPK}
                                disabled={buildProgress !== null}
                                className={cn(
                                  "w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all relative overflow-hidden",
                                  buildProgress !== null ? "bg-hw-surface-alt text-hw-muted" : "bg-accent text-hw-bg hover:brightness-110"
                                )}
                              >
                                {buildProgress !== null ? (
                                  <>
                                    <div className="absolute inset-0 bg-accent/20" style={{ width: `${buildProgress}%` }} />
                                    <span className="relative z-10">{buildProgress < 100 ? `Building ${buildProgress}%` : 'Success!'}</span>
                                  </>
                                ) : 'Build APK'}
                              </button>
                            </div>
                          </section>

                          <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-hw-border">
                            <button 
                              onClick={() => addToast('Global configuration applied', 'success')}
                              className="flex-1 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,255,255,0.1)] hover:bg-white/90 hover:shadow-[0_4px_24px_rgba(255,255,255,0.2)] focus:outline-none focus:ring-4 focus:ring-white/20 hover:-translate-y-0.5"
                            >
                              Apply Global Config
                            </button>
                            <button 
                              onClick={() => addToast('Settings reset to default', 'info')}
                              className="px-6 py-4 border border-hw-border hover:bg-danger/10 hover:border-danger/50 hover:text-danger rounded-xl font-black uppercase tracking-widest text-xs transition-all focus:outline-none focus:ring-4 focus:ring-danger/20 hover:-translate-y-0.5"
                            >
                              Reset
                            </button>
                          </div>
                            </>
                          ) : settingsSubTab === 'plugins' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                              <section className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary">Plugins & Mods</h3>
                                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded font-bold">{installedPlugins.length} Installed</span>
                                  </div>
                                </div>

                                {/* Drag/Drop Upload Area */}
                                <div className="border-2 border-dashed border-hw-border hover:border-accent/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-hw-surface-alt/20 hover:bg-hw-surface-alt/50 cursor-pointer"
                                     onClick={() => {
                                       const input = document.createElement('input');
                                       input.type = 'file';
                                       input.accept = '.jar';
                                       input.onchange = (e) => {
                                         const file = (e.target as HTMLInputElement).files?.[0];
                                         if (file) {
                                            if (!file.name.endsWith('.jar')) {
                                              addToast('Only .jar files are supported', 'error');
                                              return;
                                            }
                                            addToast(`Uploading ${file.name}...`, 'info');
                                            setTimeout(() => {
                                              setInstalledPlugins(prev => [{
                                                name: file.name,
                                                size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                                                active: true
                                              }, ...prev]);
                                              addToast(`${file.name} successfully installed to /plugins`, 'success');
                                            }, 1500);
                                         }
                                       };
                                       input.click();
                                     }}>
                                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                                    <UploadCloud size={24} className="text-accent" />
                                  </div>
                                  <h4 className="text-sm font-bold text-hw-text mb-1">Upload .jar File</h4>
                                  <p className="text-xs text-hw-secondary max-w-sm">Click to browse or drag and drop a plugin/mod .jar file here. It will be placed in the <span className="font-mono text-hw-muted">/plugins</span> directory automatically.</p>
                                </div>

                                {/* Installed List */}
                                <div className="space-y-3">
                                  {installedPlugins.length === 0 ? (
                                    <div className="p-8 text-center border-2 border-dashed border-hw-border rounded-xl text-hw-muted">
                                      <p className="text-sm font-bold">No Plugins Installed</p>
                                    </div>
                                  ) : (
                                    installedPlugins.map((plugin, i) => (
                                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-hw-card border border-hw-border rounded-xl gap-4 group hover:border-accent/30 transition-all">
                                        <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-lg bg-hw-surface-alt flex items-center justify-center border border-hw-border">
                                            <Layers size={20} className="text-accent" />
                                          </div>
                                          <div>
                                            <p className="text-sm font-bold text-hw-text">{plugin.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                              <p className="text-[10px] text-hw-muted font-mono">{plugin.size} • /plugins/{plugin.name}</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <button 
                                            onClick={() => {
                                              setInstalledPlugins(prev => prev.map(p => p.name === plugin.name ? { ...p, active: !p.active } : p));
                                              addToast(`${plugin.name} ${!plugin.active ? 'enabled' : 'disabled'}`, 'info');
                                            }}
                                            className={cn(
                                              "w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0",
                                              plugin.active ? "bg-accent" : "bg-hw-muted"
                                            )}
                                          >
                                            <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", plugin.active ? "translate-x-6" : "translate-x-0")} />
                                          </button>
                                          
                                          <button 
                                            onClick={() => {
                                              setInstalledPlugins(prev => prev.filter(p => p.name !== plugin.name));
                                              addToast(`Deleted ${plugin.name}`, 'success');
                                            }}
                                            className="p-2 text-hw-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </section>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'files' && (
                    <motion.div 
                      key="files"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 flex flex-col w-full h-full"
                    >
                      <div className="p-4 border-b border-hw-border bg-black/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-hw-muted">
                          <Search size={14} />
                          <input placeholder="Search files..." className="bg-transparent border-none text-xs focus:ring-0 outline-none w-48" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => addToast('File upload dialog opened', 'info')} className="px-3 py-1.5 bg-hw-bg border border-hw-border rounded-lg text-[10px] font-bold uppercase transition-colors hover:border-accent hover:text-accent focus:ring-2 focus:ring-accent/40">Upload .jar</button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2">
                        {([] as any[]).map((file, i) => (
                          <div 
                            key={i} 
                            onClick={() => setSelectedFileName(file.name)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                              selectedFileName === file.name ? "bg-accent/10 border-accent/20" : "hover:bg-white/5 border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {file.type === 'folder' ? <HardDrive size={18} className="text-accent" /> : <FileText size={18} className="text-hw-muted" />}
                              <span className={cn("text-sm transition-all", selectedFileName === file.name ? "text-accent font-bold" : "text-hw-secondary font-medium whitespace-nowrap")}>
                                {file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-[10px] text-hw-muted font-mono">
                              <span className="opacity-60">{file.size}</span>
                              <span className="w-24 text-right opacity-60">{file.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'network' && (
                    <motion.div 
                      key="network"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 p-3 sm:p-6 space-y-8 overflow-y-auto"
                    >
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Primary Connection */}
                        <section className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary border-b border-hw-border pb-2">Active Connections</h3>
                          <div className="space-y-4">
                            <div className="bg-hw-card border border-hw-border rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                              <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-all" />
                              <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-accent/10 rounded-xl text-accent">
                                    <Globe size={20} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold">Cloud Relay Tunnel</h4>
                                    <p className="text-[10px] text-hw-muted">Global Access Enabled via Netherite Network</p>
                                  </div>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 bg-accent/20 text-accent rounded uppercase font-bold">Connected</span>
                              </div>
                              <div 
                                onClick={() => selectedServer?.publicIp && copyToClipboard(selectedServer.publicIp)}
                                className="flex items-center justify-between p-3 bg-black/40 border border-hw-border rounded-xl cursor-pointer hover:border-accent/30 transition-all font-mono text-xs overflow-hidden"
                              >
                                <span className="truncate mr-4">{selectedServer.publicIp || "tunnel-initializing..."}</span>
                                <Copy size={14} className="text-hw-muted shrink-0" />
                              </div>
                            </div>

                            <div className="bg-hw-card border border-hw-border rounded-2xl p-5 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-hw-surface-alt rounded-xl text-hw-secondary">
                                  <Wifi size={20} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold">Local Network</h4>
                                  <p className="text-[10px] text-hw-muted">Accessible on your current Wi-Fi SSID</p>
                                </div>
                              </div>
                              <div className="p-3 bg-black/40 border border-hw-border rounded-xl font-mono text-xs text-hw-secondary">
                                192.168.1.42:25565
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Network Controls */}
                        <section className="space-y-4">
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary border-b border-hw-border pb-2">Network Security</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-hw-surface-alt/50 border border-hw-border rounded-xl">
                              <div className="flex items-center gap-3">
                                <Shield size={18} className="text-accent" />
                                <div>
                                  <p className="text-sm font-semibold">DDoS Protection</p>
                                  <p className="text-[10px] text-hw-secondary font-mono">MITIGATING LAYER 3/4/7</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-accent font-bold uppercase">Shielded</span>
                            </div>

                            <div className="p-4 bg-hw-surface-alt/50 border border-hw-border rounded-xl space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Firewall Rules</p>
                                <button 
                                  onClick={handleAddRule}
                                  className="text-[10px] uppercase font-bold text-accent hover:underline"
                                >
                                  + Add Rule
                                </button>
                              </div>
                              <div className="space-y-2">
                                {firewallRules.map((rule, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => handleToggleRule(i)}
                                    className="flex items-center justify-between text-xs py-2 border-b border-hw-border/50 last:border-0 cursor-pointer group"
                                  >
                                    <span className={cn("transition-colors", rule.active ? "text-hw-muted" : "text-hw-muted/40 line-through")}>
                                      ALLOW port {rule.port} ({rule.protocol}) - {rule.label}
                                    </span>
                                    <div className={cn(
                                      "p-1 rounded transition-colors",
                                      rule.active ? "text-accent bg-accent/10" : "text-hw-muted bg-hw-surface-alt"
                                    )}>
                                      <Check size={14} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>

                      <section className="space-y-4 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary border-b border-hw-border pb-2">Subdomain Management</h3>
                        <div className="p-8 border-2 border-dashed border-hw-border rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                          <div className="p-4 bg-white/5 rounded-full">
                            <Globe size={32} className="opacity-40" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Host on your own domain</p>
                            <p className="text-xs text-hw-muted">Point your project at netherite.gg or use a custom CNAME.</p>
                          </div>
                          <button onClick={() => addToast('Domain configuration modal opened', 'info')} className="px-6 py-2 bg-hw-surface-alt border border-hw-border rounded-xl text-xs font-bold uppercase hover:bg-white/10 hover:border-accent/40 transition-all focus:outline-none focus:ring-4 focus:ring-white/10 active:scale-95">Configure Custom Domain</button>
                        </div>
                      </section>
                    </motion.div>
                  )}

                  {activeTab === 'backups' && (
                    <motion.div 
                      key="backups"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 p-3 sm:p-6 space-y-6 overflow-y-auto"
                    >
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary border-b border-hw-border pb-2">Server Backups</h3>
                        <div className="space-y-3">
                          {backups.map((backup, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-hw-surface-alt/50 border border-hw-border rounded-xl group hover:border-accent/30 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-hw-bg flex items-center justify-center">
                                  <HardDrive size={16} className="text-hw-muted" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold">{backup.name}</p>
                                  <p className="text-[10px] text-hw-secondary">{backup.date} • {backup.size}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRestoreBackup(backup.name)}
                                className="text-xs font-bold text-accent hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Restore
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={handleCreateBackup}
                            className="w-full py-4 border-2 border-dashed border-hw-border rounded-xl text-hw-muted hover:text-hw-text hover:border-hw-muted transition-all text-sm font-bold uppercase active:scale-[0.99]"
                          >
                            Create New Backup
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'players' && (
                    <motion.div 
                      key="players"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute inset-0 p-3 sm:p-6 space-y-6 overflow-y-auto"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-hw-border pb-2">
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-hw-secondary">Player Management</h3>
                          <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 animate-pulse rounded font-bold">{selectedServer.playersList?.length || 0} Online</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {!selectedServer.playersList?.length ? (
                            <div className="p-8 text-center border-2 border-dashed border-hw-border rounded-2xl text-hw-muted">
                              <Users size={32} className="mx-auto mb-3 opacity-20" />
                              <p className="text-sm font-bold">No Players Online</p>
                              <p className="text-xs">Players logged into the server will appear here.</p>
                            </div>
                          ) : (
                            selectedServer.playersList.map((player) => (
                              <div key={player.uuid} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-hw-card border border-hw-border rounded-xl gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img src={`https://minotar.net/helm/${player.name}/40.png`} className="w-10 h-10 rounded-lg drop-shadow" alt={player.name} />
                                    {player.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-accent border-2 border-hw-card rounded-full" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-hw-text">{player.name}</p>
                                      {player.role && (player.role === 'ADMIN' || player.role === 'MOD') && (
                                        <span className={cn(
                                          "text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider",
                                          player.role === 'ADMIN' ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                                        )}>
                                          {player.role}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-hw-muted font-mono">{player.ping}ms ping • UUID: {player.uuid}</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                                  <div className="flex bg-hw-surface-alt rounded-lg border border-hw-border p-1">
                                    <select 
                                      className="bg-transparent text-[10px] font-bold uppercase text-hw-secondary outline-none px-2 cursor-pointer"
                                      value={player.role}
                                      onChange={(e) => handleCommandSubmitArgs(`/promote ${player.name} ${e.target.value}`)}
                                    >
                                      <option value="MEMBER">Member</option>
                                      <option value="MOD">Mod</option>
                                      <option value="ADMIN">Admin</option>
                                    </select>
                                  </div>
                                  <button onClick={() => { handleCommandSubmitArgs(`/kick ${player.name} Connection closed by admin`); addToast(`Kicked ${player.name}`, 'info'); }} className="px-3 py-1.5 bg-hw-surface-alt border border-hw-border hover:border-hw-muted rounded-lg text-[10px] font-bold uppercase text-hw-text transition-colors">
                                    Kick
                                  </button>
                                  <button onClick={() => { handleCommandSubmitArgs(`/ban ${player.name}`); addToast(`Banned ${player.name}`, 'error'); }} className="px-3 py-1.5 bg-danger/10 border border-danger/30 hover:bg-danger hover:text-white rounded-lg text-[10px] font-bold uppercase text-danger transition-colors">
                                    Ban
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-hw-muted space-y-4">
              <div className="p-8 rounded-full bg-white/5 border border-hw-border">
                <HardDrive size={64} className="opacity-20" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-hw-text">No Server Selected</h3>
                <p className="text-sm mt-1">Select an instance from the sidebar or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
