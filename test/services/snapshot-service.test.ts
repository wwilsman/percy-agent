// TODO!
import {expect} from 'chai'
import {describe} from 'mocha'
import * as nock from 'nock'
import SnapshotService, {SnapshotServiceOptions} from '../../src/services/snapshot-service'
import {captureStdOut} from '../helpers/stdout'

describe('SnapshotService', () => {
  const buildCreateResponse = require('../fixtures/build-create.json')
  const buildId = buildCreateResponse.data.id

  const snapshotFinalizeResponse = require('../fixtures/snapshot-finalize.json')
  const snapshotCreateResponse = require('../fixtures/snapshot-create.json')
  const snapshotId = snapshotCreateResponse.data.id

  const subject = new SnapshotService(buildId)

  describe('#constructor', () => {
    it('creates a SnapshotService', async () => {
      expect(subject.buildId).to.equal(buildId)
      expect(subject.assetDiscoveryService.buildId).to.equal(buildId)
      expect(subject.resourceService.buildId).to.equal(buildId)
    })

    it('passed on options', async () => {
      const networkIdleTimeout = 123
      const options: SnapshotServiceOptions = {networkIdleTimeout}

      const subject = new SnapshotService(buildId, options)
      expect(subject.assetDiscoveryService.networkIdleTimeout).to.equal(networkIdleTimeout)
    })
  })

  context('API responses are successful', () => {
    beforeEach(async () => {
      nock('https://percy.io').post(`/api/v1/builds/${buildId}/snapshots`)
      .reply(201, snapshotCreateResponse)

      nock('https://percy.io').post(`/api/v1/snapshots/${snapshotId}/finalize`)
        .reply(200, snapshotFinalizeResponse)
    })

    afterEach(() => nock.cleanAll())

    xdescribe('#create', () => {
      it('creates a snapshot', async () => {
        let snapshotResponse: any

        await captureStdOut(async () => {
          snapshotResponse = await subject.create(
            'my test', [],
          )
        })

        expect(snapshotResponse.body).to.deep.equal({data: {id: snapshotId}})
        expect(snapshotResponse.statusCode).to.eq(201)
      })
    })

    describe('#finalize', () => {
      it('creates finalizes a snapshot', async () => {
        let result = false

        await captureStdOut(async () => {
          result = await subject.finalize(snapshotId)
        })

        expect(result).to.equal(true)
      })
    })
  })
})
