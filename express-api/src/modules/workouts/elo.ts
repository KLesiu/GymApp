const K = 32

export type EloFormula = "STANDARD" | "STRENGTH" | "VOLUME" | "PULLUP_INVERSE"

type EloInput = {
  readonly previousWeight: number
  readonly previousReps: number
  readonly currentWeight: number
  readonly currentReps: number
}

const getStandardScore = (weight: number, reps: number) => {
  if (weight <= 15) {
    return weight * 0.3 + reps * 0.7
  }

  if (weight <= 80) {
    return weight * 0.5 + reps * 0.5
  }

  return weight * 0.7 + reps * 0.3
}

const calculate = (input: EloInput, selector: (weight: number, reps: number) => number) => {
  const prevScore = selector(input.previousWeight, input.previousReps)
  const currentScore = selector(input.currentWeight, input.currentReps)
  const threshold = input.previousWeight > 80 ? prevScore * 0.1 : prevScore * 0.05
  const expectedScore =
    Math.abs(currentScore - prevScore) <= threshold ? 0.5 : prevScore / (prevScore + currentScore)
  const actualScore = currentScore >= prevScore ? 1 : 0
  const multiplier = Math.abs(currentScore - prevScore) < threshold ? 0.5 : 1
  return Math.round(K * (actualScore - expectedScore) * multiplier)
}

export const calculateFormulaScore = (formula: EloFormula, weight: number, reps: number) => {
  switch (formula) {
    case "STANDARD":
      return getStandardScore(weight, reps)
    case "STRENGTH":
      return weight * 0.8 + reps * 0.2
    case "VOLUME":
      return weight * 0.2 + reps * 0.8
    case "PULLUP_INVERSE":
      return (200 - weight) * 0.7 + reps * 0.3
  }
}

export const calculateEloGain = (formula: EloFormula, input: EloInput) => {
  switch (formula) {
    case "STANDARD":
      return calculate(input, getStandardScore)
    case "STRENGTH":
      return calculate(input, (weight, reps) => weight * 0.8 + reps * 0.2)
    case "VOLUME":
      return calculate(input, (weight, reps) => weight * 0.2 + reps * 0.8)
    case "PULLUP_INVERSE":
      return calculate(input, (weight, reps) => (200 - weight) * 0.7 + reps * 0.3)
  }
}
