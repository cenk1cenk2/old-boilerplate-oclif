export interface LoggerFormat {
  level: string
  message: string
  custom?: string
  context?: string
  trimEmptyLines?: boolean
}
