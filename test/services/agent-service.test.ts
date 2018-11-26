import {describe} from 'mocha'
import * as nock from 'nock'
import AgentService from '../../src/services/agent-service'
import {captureStdOut} from '../helpers/stdout'
import chai from '../support/chai'
const expect = chai.expect

describe('AgentService', () => {
  const subject = new AgentService()
  const port = 5338
  const host = `localhost:${port}`

  const buildCreateResponse = require('../fixtures/build-create.json')
  const buildFinalizeResponse = require('../fixtures/build-finalize.json')
  const buildUrl = buildCreateResponse.data.attributes['web-url']
  const buildNumber = buildCreateResponse.data.attributes['build-number']
  const buildId = buildCreateResponse.data.id

  context('API responses are successful', () => {
    beforeEach(() => {
      nock('https://percy.io').post('/api/v1/builds/')
        .reply(201, buildCreateResponse)

      nock('https://percy.io').post(`/api/v1/builds/${buildId}/finalize`)
        .reply(200, buildFinalizeResponse)
    })

    afterEach(() => nock.cleanAll())

    describe('#start', () => {
      afterEach(async () => {
        await captureStdOut(async () => subject.stop())
      })

      it('starts serving dist/public on supplied port', async () => {
        await captureStdOut(() => subject.start({port}))

        chai.request(`http://${host}`)
          .get('/percy-agent.js')
          .end((error, response) => {
            expect(error).to.be.eq(null)
            expect(response).to.have.status(200)
            expect(response).to.have.header('content-type', /application\/javascript/)
          })
      })

      it('logs to stdout that it created a build', async () => {
        const stdout = await captureStdOut(() => subject.start({port}))
        expect(stdout).to.eq(
          `[percy] created build #${buildNumber}: ${buildUrl}\n`,
        )
      })
    })

    describe('#stop', () => {
      it('stops serving dist/public on supplied port', async () => {
        await captureStdOut(async () => {
          await subject.start({port})
          await subject.stop()
        })

        chai.request(`http://${host}`)
          .get('/percy-agent.js')
          .catch((error) => {
            expect(error).to.have.property('message', `connect ECONNREFUSED 127.0.0.1:${port}`)
          })
      })

      it('logs to stdout that it finalized a build', async () => {
        await captureStdOut(() => subject.start({port}))

        const stdout = await captureStdOut(async () => {
          await subject.stop()
        })

        expect(stdout).to.eq(
          '[percy] stopping percy...\n' +
          '[percy] waiting for 0 snapshots to complete...\n' +
          '[percy] done.\n' +
          `[percy] finalized build #${buildNumber}: ${buildUrl}\n`,
        )
      })
    })
  })
})
