import {expect} from 'chai'
import {describe} from 'mocha'
import * as nock from 'nock'
import BuildService from '../../src/services/build-service'
import {captureStdOut} from '../helpers/stdout'

describe('BuildService', () => {
  const subject = new BuildService()

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

    describe('#createBuild', () => {
      it('creates a build', async () => {
        let createdBuildId: number | null = null

        const stdout = await captureStdOut(async () => {
          createdBuildId = await subject.create()
        })

        expect(createdBuildId).to.equal(+buildId)
        expect(stdout).to.eq(
          `[percy] created build #${buildNumber}: ${buildUrl}\n`,
        )
      })
    })

    describe('#finalizeBuild', () => {

      it('finalizes a build', async () => {
        const stdout = await captureStdOut(() => subject.finalize())
        expect(stdout).to.eq(
          `[percy] finalized build #${buildNumber}: ${buildUrl}\n`,
        )
      })
    })
  })
})
