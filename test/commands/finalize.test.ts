import {expect, test} from '@oclif/test'

describe('finalize', () => {
  const buildCreateResponse = require('../fixtures/build-create.json')
  const buildFinalizeResponse = require('../fixtures/build-finalize.json')
  const buildUrl = buildCreateResponse.data.attributes['web-url']
  const buildId = buildCreateResponse.data.id

  test
    .stub(process, 'env', {PERCY_TOKEN: 'abc'})
    .stderr()
    .command(['finalize'])
    .catch((err) => expect(err.message).to.equal(
      'Missing required flag:\n' +
      ' -a, --all\n' +
      'See more help with --help',
    ))
    .it('requires --all flag')

  test
    .stub(process, 'env', {PERCY_TOKEN: 'abc'})
    .command(['finalize'])
    .exit(2)
    .it('exits with code 2')

  describe('--all', () => {
    test
      .stub(process, 'env', {PERCY_ENABLE: '0'})
      .stderr()
      .command(['finalize', '--all'])
      .exit(0)
      .it('exits with code 0 when Percy is disabled')

    test
      .nock('https://percy.io', (api) => api
        .post(`/api/v1/builds/${buildId}/finalize?all-shards=true`)
        .reply(200, buildFinalizeResponse),
      ).nock('https://percy.io', (api) => api
        .post('/api/v1/builds/')
        .reply(201, buildCreateResponse),
      ).stub(process, 'env', {PERCY_PARALLEL_NONCE: 'foo', PERCY_TOKEN: 'abc'})
      .stdout()
      .command(['finalize', '--all'])
      .do((output) => expect(output.stdout).to.equal(
        '[percy] Finalized all builds.\n' +
        `[percy] Visual diffs are now processing: ${buildUrl}\n`,
      ))
      .it('finalizes all builds')
  })
})
