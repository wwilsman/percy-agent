import {expect} from 'chai'
import {describe} from 'mocha'
import ProcessService from '../../src/services/process-service'
import {deletePidFile} from '../helpers/process'
import {captureStdErr} from '../helpers/stdout'

describe('ProcessService', () => {
  const subject = new ProcessService()

  afterEach(() => deletePidFile())

  context('process is not running', () => {
    beforeEach(() => deletePidFile())

    describe('#isRunning', () => {
      it('returns false', () => {
        expect(subject.isRunning()).to.equal(false)
      })
    })
  })

  context('process is running', () => {
    const pid = 123

    beforeEach(() => subject.writePidFile(pid))

    describe('#isRunning', () => {
      it('returns true', () => {
        expect(subject.isRunning()).to.equal(true)
      })
    })

    describe('#getPid', () => {
      it('returns the pid', () => {
        expect(subject.getPid()).to.equal(pid)
      })
    })

    describe('#kill', () => {
      it('kills attempts to kill a running process', async () => {
        expect(subject.isRunning()).to.equal(true)

        const stdError = await captureStdErr(() => {
          subject.kill()
        })

        expect(subject.isRunning()).to.equal(false)

        // Since these are tests only and process id 123 is not a running process
        // we gracefully handle the error
        expect(stdError).to.contain(
          `process id ${pid} was not running and so could not be killed.`,
        )
      })
    })
  })
})
