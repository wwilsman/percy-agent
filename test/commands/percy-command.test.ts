import {expect, test} from '@oclif/test'

describe('percy-command', () => {
  test
    .stub(process, 'env', {PERCY_TOKEN: ''})
    .stderr()
    .command(['percy-command'])
    .do((output) => expect(output.stderr).to.eql(
      ' ›   Warning: Skipping visual tests\n' +
      ' ›   Warning: PERCY_TOKEN was not provided.\n',
    ))
    .it('warns about PERCY_TOKEN to be set')

  test
    .stub(process, 'env', {PERCY_ENABLE: '0', PERCY_TOKEN: ''})
    .stderr()
    .command(['percy-command'])
    .do((output) => expect(output.stderr).to.eql(
      ' ›   Warning: Skipping visual tests\n',
    ))
    .it('warns about PERCY_TOKEN to be set')

  test
    .stub(process, 'env', {PERCY_ENABLE: '0', PERCY_TOKEN: 'ABC'})
    .stderr()
    .command(['percy-command'])
    .do((output) => expect(output.stderr).to.eql(
      ' ›   Warning: Skipping visual tests\n',
    ))
    .it('outputs no errors')
})
