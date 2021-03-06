const express = require('express')
const { bookmarks } = require('../store')

const bookRouter = express.Router()
const bodyParser = express.json()
const { v4: uuid } = require('uuid');
const logger = require('../logger')

bookRouter
  .route('/bookmarks')
  .get((req, res) => {
    res
    .json(bookmarks);
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

    if (!desc) {
        logger.error(`Description is required`);
        return res
            .status(400)
            .send('Invalid data');
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
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(li => li.id == id);

    if (!bookmark) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res
        .status(404)
        .send('Bookmark Not Found');
    }

    res.json(bookmark);
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