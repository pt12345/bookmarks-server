const express = require('express')
const { bookmarks } = require('../store')

const bookRouter = express.Router()
const bodyParser = express.json()
const { v4: uuid } = require('uuid');
const logger = require('../logger')
const BookmarksService = require('./bookmarks-service')

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
})

bookRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      res.json(bookmarks.map(serializeBookmark))
    })
    .catch(next)
  })
  .post(bodyParser, (req, res) => {
    const { title, url, rating, desc } = req.body;

    console.log(req.body)

    if (!title) {
        logger.error(`Title is required`);
        return res
          .status(400)
          .send('Invalid data');
      }
      
    if (!url) {
    logger.error(`URL is required`);
    return res
        .status(400)
        .send('Invalid data');
    }

    if (!rating) {
        logger.error(`Rating is required`);
        return res
            .status(400)
            .send('Invalid data');
    }

    if(rating<0) {
      logger.error(`Rating cannot be less than zero`);
      return res
          .status(400)
          .send('Invalid data');
    }

    if (!desc) {
        logger.error(`Description is required`);
        return res
            .status(400)
            .send('Invalid data');
    }

    const urlTest = url.split('.');

    console.log(urlTest)

    if(urlTest.length < 3) {
      logger.error(`Not valid URL`);
      return res
          .status(400)
          .send('Invalid data1');
    }

    if(urlTest[0] != 'http://www') {
      if(urlTest[0] != 'https://www') {
        if(urlTest[0] != 'www') {
          logger.error(`Not valid URL`);
          return res
              .status(400)
              .send('Invalid data2');
        }
      }
    }

    if(urlTest[2] != 'com') {
      logger.error(`Not valid URL`);
      return res
          .status(400)
          .send('Invalid data3');
    }

    const id = uuid();

    const newBookmark = {
    id,
    title,
    url,
    rating,
    desc
    };

    bookmarks.push(newBookmark);

    logger.info(`Bookmark with id ${id} created`);

    res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${id}`)
    .json(newBookmark);
  })

bookRouter
  .route('/bookmarks/:id')
  .get((req, res, next) => {
    const { id } = req.params
    BookmarksService.getById(req.app.get('db'), id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `Bookmark Not Found` }
          })
        }
        res.json(serializeBookmark(bookmark))
      })
      .catch(next)
  })
  .delete((req, res) => {
    const { id } = req.params;
  
    const bookIndex = bookmarks.findIndex(li => li.id == id);
  
    if (bookIndex === -1) {
      logger.error(`List with id ${id} not found.`);
      return res
        .status(404)
        .send('Not Found');
    }
  
    bookmarks.splice(bookIndex, 1);
  
    logger.info(`Bookmark with id ${id} deleted.`);
    res
      .status(204)
      .end();
  })

module.exports = bookRouter