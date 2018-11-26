import * as fs from 'fs'
import { logError } from '../utils/logger'

export default class ProcessService {
  static PID_PATH = '.percy.pid'

  isRunning(): boolean {
    return fs.existsSync(ProcessService.PID_PATH)
  }

  getPid(): number {
    const pidFileContents: Buffer = fs.readFileSync(ProcessService.PID_PATH)
    return parseInt(pidFileContents.toString('utf8').trim())
  }

  kill() {
    if (!this.isRunning()) { return }

    const pid = this.getPid()
    fs.unlinkSync(ProcessService.PID_PATH)

    try {
      process.kill(pid, 'SIGHUP')
    } catch (e) {
      logError(e, `process id ${pid} was not running and so could not be killed.`)
    }
  }

  writePidFile(pid: number) {
    fs.writeFileSync(ProcessService.PID_PATH, pid)
  }
}
