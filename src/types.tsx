export interface Patient {
  client_id: string
  date_testing: string
  date_birthdate: string
  gender: number
  ethnicity: number
  creatine: number
  chloride: number
  fasting_glucose: number
  potassium: number
  sodium: number
  total_calcium: number
  total_protein: number
  creatine_unit: string
  chloride_unit: string
  fasting_glucose_unit: string
  potassium_unit: string
  sodium_unit: string
  total_calcium_unit: string
  total_protein_unit: string
}

export interface dataRange {
  min: number
  max: number
}

export interface segmentContext {
  p0: {
    skip: boolean
    parsed: Point
  }
  p1: {
    skip: boolean
    parsed: Point
  }
}

export interface pointContext {
  parsed: Point
}

export interface Point {
  x: Date
  y: number
}

export interface Dataset {
  label: string
  data: Patient[]
  parsing: { yAxisKey: string; xAxisKey: string }
  borderColor: string
  spanGaps: boolean
  segment: {
    borderColor: (ctx: segmentContext) => string | number | number[] | undefined
    borderDash: (ctx: segmentContext) => string | number | number[] | undefined
  }
  pointBorderWidth: number
  pointRadius: (ctx: pointContext) => number
  pointStyle: (ctx: pointContext) => string
  backgroundColor: string
  pointBackgroundColor: (ctx: pointContext) => string
}
