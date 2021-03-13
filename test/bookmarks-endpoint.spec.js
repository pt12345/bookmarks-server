
const knex = require('knex')
const app = require('../src/app')
const fixtures = require('./bookmarks-fixtures')

describe.only('Bookmarks Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)

    //console.log("connected")
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarks').truncate())
  afterEach('cleanup', () => db('bookmarks').truncate())

  context('Given there are articles in the database', () => {
      const testBookmarks = fixtures.makeBookmarksArray()

      beforeEach('insert articles', () => {
        return db
          .into('bookmarks')
          .insert(testBookmarks)
      })

      
    it('GET /articles responds with 200 and all of the articles', () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, testBookmarks)
    })

    it('responds with 200 and the specified bookmark', () => {
      const bookmarkId = 2
      const expectedBookmark = testBookmarks[bookmarkId - 1]
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, expectedBookmark)
    })

    })
})