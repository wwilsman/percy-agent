import * as fs from 'fs'
import ProcessService from '../../src/services/process-service'

export function deletePidFile(): void {
  if (pidFileExists()) { fs.unlinkSync(ProcessService.PID_PATH) }
}

export function pidFileExists(): boolean {
  return fs.existsSync(ProcessService.PID_PATH)
}
