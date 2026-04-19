export const COMMAND_CATEGORIES = [
  {
    name: 'Permissions & Player Management',
    commands: [
      { cmd: '/op', args: '[PlayerName]', desc: 'Make a player an operator' },
      { cmd: '/deop', args: '[PlayerName]', desc: 'Remove operator status' },
      { cmd: '/promote', args: '[PlayerName] [Role]', desc: 'Promote player to Admin or Mod' },
      { cmd: '/kick', args: '[PlayerName] [Reason]', desc: 'Kick a player from the server' },
      { cmd: '/ban', args: '[PlayerName]', desc: 'Ban a player from the server' },
      { cmd: '/pardon', args: '[PlayerName]', desc: 'Unban a player' },
      { cmd: '/whitelist add', args: '[PlayerName]', desc: 'Add player to whitelist' },
      { cmd: '/whitelist remove', args: '[PlayerName]', desc: 'Remove player from whitelist' },
      { cmd: '/whitelist on', args: '', desc: 'Enable server whitelist' },
      { cmd: '/whitelist off', args: '', desc: 'Disable server whitelist' },
      { cmd: '/list', args: '', desc: 'List all online players' },
    ]
  },
  {
    name: 'Game Settings & Rules',
    commands: [
      { cmd: '/gamemode survival', args: '', desc: 'Set game mode to survival' },
      { cmd: '/gamemode creative', args: '', desc: 'Set game mode to creative' },
      { cmd: '/gamemode spectator', args: '', desc: 'Set game mode to spectator' },
      { cmd: '/difficulty peaceful', args: '', desc: 'Set world difficulty to peaceful' },
      { cmd: '/difficulty easy', args: '', desc: 'Set world difficulty to easy' },
      { cmd: '/difficulty normal', args: '', desc: 'Set world difficulty to normal' },
      { cmd: '/difficulty hard', args: '', desc: 'Set world difficulty to hard' },
      { cmd: '/gamerule keepInventory', args: 'true', desc: 'Players keep inventory on death' },
      { cmd: '/gamerule doDaylightCycle', args: 'false', desc: 'Freeze the day/night cycle' },
      { cmd: '/gamerule mobGriefing', args: 'false', desc: 'Prevent creepers/endermen from breaking blocks' },
      { cmd: '/gamerule showCoordinates', args: 'true', desc: 'Show player coordinates on screen' },
    ]
  },
  {
    name: 'World & Teleportation',
    commands: [
      { cmd: '/tp', args: '[PlayerName] [TargetPlayer]', desc: 'Teleport player to another player' },
      { cmd: '/tp', args: '[PlayerName] [X] [Y] [Z]', desc: 'Teleport player to coordinates' },
      { cmd: '/setworldspawn', args: '', desc: 'Set the global world spawn point' },
      { cmd: '/spawnpoint', args: '[PlayerName]', desc: 'Set a specific player\'s spawn point' },
      { cmd: '/time set day', args: '', desc: 'Set the world time to day' },
      { cmd: '/time set night', args: '', desc: 'Set the world time to night' },
      { cmd: '/weather clear', args: '', desc: 'Clear the weather' },
      { cmd: '/weather rain', args: '', desc: 'Set the weather to rain' },
      { cmd: '/locate structure', args: '[StructureName]', desc: 'Find the nearest structure' },
      { cmd: '/locate biome', args: '[BiomeName]', desc: 'Find the nearest biome' },
    ]
  },
  {
    name: 'Items & Spawning',
    commands: [
      { cmd: '/give', args: '@s [ItemID] [Amount]', desc: 'Give an item to a player' },
      { cmd: '/clear', args: '@s', desc: 'Clear the inventory of a player' },
      { cmd: '/enchant', args: '@s [Enchant] [Level]', desc: 'Add an enchantment to held item' },
      { cmd: '/summon', args: '[EntityID]', desc: 'Summon an entity or mob' },
      { cmd: '/kill', args: '@e[type=!player]', desc: 'Kill all non-player entities' },
      { cmd: '/effect give', args: '@s [EffectID] [Seconds] [Level]', desc: 'Apply a status effect' },
    ]
  },
  {
    name: 'Server Maintenance',
    commands: [
      { cmd: '/save-all', args: '', desc: 'Force save the world to disk' },
      { cmd: '/stop', args: '', desc: 'Safely stop the server and save everything' },
      { cmd: '/reload', args: '', desc: 'Reload server configuration and datapacks' },
      { cmd: '/seed', args: '', desc: 'Display the world generator seed' },
      { cmd: '/help', args: '', desc: 'Display the server help menu' },
    ]
  }
];
