import {flags} from '@oclif/command'
import {AgentOptions} from '../services/agent-options'
import healthCheck from '../utils/health-checker'
import PercyCommand from './percy-command'

export default class Start extends PercyCommand {
  static description = 'Starts a Percy build.'
  static hidden = true

  static examples = [
    '$ percy start',
  ]

  static flags = {
    'network-idle-timeout': flags.integer({
      char: 't',
      default: 50,
      description: 'asset discovery network idle timeout (in milliseconds)',
    }),
    'port': flags.integer({
      char: 'p',
      default: 5338,
      description: 'port',
    }),
  }

  async run() {
    await super.run()

    // If Percy is disabled or is missing a token, gracefully exit here
    if (!this.percyWillRun) { this.exit(0) }

    const {flags} = this.parse(Start)
    const port = flags.port as number
    const networkIdleTimeout = flags['network-idle-timeout'] as number

      await this.runAttached({port, networkIdleTimeout})
    }

  private async runAttached(options: AgentOptions) {
    const exitSignals: NodeJS.Signals[] = ['SIGHUP', 'SIGINT', 'SIGTERM']

    exitSignals.forEach((signal) => {
      process.on(signal, async () => {
        await this.agentService.stop()
        process.exit(0)
      })
    })

    await this.agentService.start(options)
    this.logStart()
    await healthCheck(options.port)
  }
}
