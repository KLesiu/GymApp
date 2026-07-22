export const roles = ["TRAINEE", "TRAINER"] as const
export const weightUnits = ["KILOGRAMS", "POUNDS"] as const
export const muscleRegions = [
  "CHEST",
  "BACK",
  "SHOULDERS",
  "BICEPS",
  "TRICEPS",
  "QUADS",
  "HAMSTRINGS",
  "GLUTES",
  "CORE",
  "CALVES",
  "CUSTOM",
] as const
export const exerciseFormulas = ["STANDARD", "STRENGTH", "VOLUME", "PULLUP_INVERSE"] as const
export const bodyParts = ["WEIGHT", "BODY_FAT", "CHEST", "WAIST", "HIPS", "THIGH", "ARM"] as const
export const measurementUnits = ["KG", "CM", "PERCENT"] as const
export const reportFieldTypes = ["TEXT", "NUMBER", "SCALE"] as const
export const recurrenceUnits = ["DAY", "WEEK", "MONTH"] as const

export const rankThresholds = [
  { name: "Junior 1", needElo: 0 },
  { name: "Junior 2", needElo: 1001 },
  { name: "Junior 3", needElo: 2500 },
  { name: "Mid 1", needElo: 6000 },
  { name: "Mid 2", needElo: 8000 },
  { name: "Mid 3", needElo: 12000 },
  { name: "Pro 1", needElo: 15000 },
  { name: "Pro 2", needElo: 20000 },
  { name: "Pro 3", needElo: 24000 },
  { name: "Champ", needElo: 30000 },
] as const
