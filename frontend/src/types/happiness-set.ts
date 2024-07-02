export interface happinessObj {
  timestamp: string
  happiness1: number
  happiness2: number
  happiness3: number
  happiness4: number
  happiness5: number
  happiness6: number
}

export interface happinessSet {
  month: happinessObj[]
  day: happinessObj[]
  time: happinessObj[]
}
