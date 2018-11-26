import {expect} from 'chai'
import {describe} from 'mocha'
import PercyClientService from '../../src/services/percy-client-service'

describe('PercyClientService', () => {
  const subject = new PercyClientService()

  describe('#constructor', () => {
    it('creates a Percy Client', () => {
      const version = require('../../package.json').version

      expect(subject.percyClient).to.include({
        apiUrl: 'https://percy.io/api/v1',
        _clientInfo: `percy-agent/${version}`,
      })
    })
  })

  describe('#parseRequestPath', () => {
    it('parses urls', () => {
      expect(subject.parseRequestPath('https://percy.io/'))
        .to.eq('https://percy.io/')

      expect(subject.parseRequestPath('https://percy.io/logo.svg'))
        .to.eq('https://percy.io/logo.svg')
    })

    it('maintains query params', () => {
      expect(subject.parseRequestPath('https://percy.io/search?q=foo'))
        .to.eq('https://percy.io/search?q=foo')
    })

    it('strips anchors', () => {
      expect(subject.parseRequestPath('https://percy.io/search?q=foo#results'))
        .to.eq('https://percy.io/search?q=foo')

      expect(subject.parseRequestPath('https://percy.io/#anchor'))
        .to.eq('https://percy.io/')
    })
  })
})
