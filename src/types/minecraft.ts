
export type ServerStatus = 'RUNNING' | 'STOPPED' | 'CRASHED' | 'STARTING' | 'STOPPING';

export interface MinecraftServer {
  id: string;
  name: string;
  status: ServerStatus;
  uptime: number; // in seconds
  memoryUsage: number; // in MB
  maxMemory: number;
  cpuUsage: number; // in percentage
  players: number;
  maxPlayers: number;
  version: string;
  software: 'PaperMC' | 'Fabric' | 'Vanilla';
  port: number;
  publicIp?: string;
  description?: string;
  worldType?: string;
  worldSeed?: string;
  viewDistance?: number;
  simDistance?: number;
  gamemode?: string;
  difficulty?: string;
  cracked?: boolean;
  tier?: string;
  playersList?: { name: string; role: string; ping: number; online: boolean; uuid: string }[];
}

export interface ServerConfig {
  maxPlayers: number;
  viewDistance: number;
  simulationDistance: number;
  onlineMode: boolean;
  motd: string;
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
  autoRestartEnabled: boolean;
  restartInterval: number; // in hours
  discordBotToken?: string;
  discordChannelId?: string;
  discordEnabled: boolean;
}

export interface ConsoleLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'chat';
  message: string;
}
