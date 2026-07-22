import { rankThresholds } from "./constants"

export type RankInfo = {
  readonly name: string
  readonly needElo: number
}

export const getCurrentRank = (elo: number): RankInfo => {
  let current: RankInfo = rankThresholds[0]

  for (const rank of rankThresholds) {
    if (elo >= rank.needElo) {
      current = rank
    }
  }

  return current
}

export const getNextRank = (elo: number): RankInfo | null => {
  for (const rank of rankThresholds) {
    if (rank.needElo > elo) {
      return rank
    }
  }

  return null
}
