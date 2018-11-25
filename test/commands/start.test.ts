import {expect, test} from '@oclif/test'

describe('start', () => {
  test
    .stub(process, 'env', {PERCY_TOKEN: ''})
    .stderr()
    .command(['start'])
    .do((output) => expect(output.stderr).to.eq(
      ' ›   Warning: Skipping visual tests\n' +
      ' ›   Warning: PERCY_TOKEN was not provided.\n',
    ))
    .it('warns about a missing PERCY_TOKEN')

  test
    .stub(process, 'env', {PERCY_ENABLE: '0'})
    .stderr()
    .command(['start'])
    .do((output) => expect(output.stderr).to.eq(
      ' ›   Warning: Skipping visual tests\n',
    ))
    .it('warns that visual tests will be skipped')

  test
    .stub(process, 'env', {PERCY_TOKEN: 'abc'})
    .nock('https://percy.io', (api) => api
      .post('/api/v1/builds/')
      .reply(201, {data: {id: 123, attributes: {'build-number': '456', 'web-url': 'http://mockurl'}}}),
    ).stdout()
    .command(['start'])
    .do((output) => expect(output.stdout).to.eq(
      '[percy] created build #456: http://mockurl\n' +
      '[percy] percy has started.\n' +
      '[percy] running health check on port 5338...\n' +
      '[percy] percy is ready.\n',
    ))
    .it('starts and creates a build')
})
