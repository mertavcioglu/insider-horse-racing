export interface Horse {
  readonly id: number
  readonly name: string
  readonly color: string
  readonly condition: number
}

const horseNames = [
  'Amber Run', 'Blue Comet', 'Copper Trail', 'Dawn Patrol', 'Echo Ridge',
  'Front Runner', 'Golden Hour', 'High Meadow', 'Indigo Sky', 'Juniper Dash',
  'Kingfisher', 'Lunar Pace', 'Midnight Bell', 'North Star', 'Oak Valley',
  'Prairie Wind', 'Quiet Storm', 'River Bend', 'Silver Crest', 'Wild Aster',
]

const horseColors = [
  '#b91c1c', '#e87975', '#c2410c', '#fb923c', '#a16207',
  '#facc15', '#4d7c0f', '#a3e635', '#047857', '#34d399',
  '#0e7490', '#67e8f9', '#1d4ed8', '#93c5fd', '#5b21b6',
  '#c4b5fd', '#a21caf', '#f0abfc', '#854d3d', '#475569',
]

export function createHorses(random = Math.random): Horse[] {
  return horseNames.map((name, index) => ({
    id: index + 1,
    name,
    color: horseColors[index],
    condition: 1 + Math.floor(random() * 100),
  }))
}
