const { promises: fs } = require('fs')

const { describe, it } = require('mocha')
const { expect } = require('chai')

const { Story } = require('../private/story')

const TEST_STORY_DIR = './test/story/'
const TEST_STORY_PREFIX = TEST_STORY_DIR + 'test-story-'

describe('story', () => {
  before(async () => await fs.mkdir(TEST_STORY_DIR))
  after(async () => await fs.rmdir(TEST_STORY_DIR, { recursive: true }))

  describe('#store', () => {})

  describe('#list', () => {
    it('should return empty list on creation', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      expect(await story.list()).to.be.empty

      await fs.rmdir(tempDir, { recursive: true })
    })

    it('should return one after add', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      const pointer = await story.update('bar', { bar: true })

      expect(await story.list()).to.be.lengthOf(1)

      await fs.rmdir(tempDir, { recursive: true })
    })

    it('should list data by uuid', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      const pointer = await story.update('biz', { hello: 42 })

      const list = await story.list()
      expect(list).to.deep.equal([pointer])

      await fs.rmdir(tempDir, { recursive: true })
    })
  })

  describe('#update', () => {
    it('should perform add', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      const pointer = await story.update('foo', { bar: true })

      await fs.rmdir(tempDir, { recursive: true })
    })

    it('should read latest data after second write', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      await story.update('quix', { bang: 'buzz' })
      await story.update('quix', { bang: 'fuzz' })

      const data = await story.read('quix')
      expect(data.bang).to.equal('fuzz')

      await fs.rmdir(tempDir, { recursive: true })
    })
  })

  describe('#read', () => {
    it('should open existing data', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      await story.update('bang', { bang: 'pow!' })

      const data = await story.read('bang')
      expect(data.bang).to.equal('pow!')

      await fs.rmdir(tempDir, { recursive: true })
    })

    it('should allow read of pointer data', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      const pointer = await story.update('quix', { bang: 'buzz' })
      await story.update('quix', { bang: 'fuzz' })

      const data = await story.read('#'+pointer)

      expect(data.bang).to.equal('buzz')

      await fs.rmdir(tempDir, { recursive: true })
    })

    it('should return empty when accesing untouched keys', async () => {
      const tempDir = await fs.mkdtemp(TEST_STORY_PREFIX)
      const story = await Story.store('urn:storage/message', tempDir)

      const data = await story.read('does_not_exist')
      expect(data).to.deep.equal({})

      await fs.rmdir(tempDir, { recursive: true })
    })















  })
})