import express from 'express';
import { withAsync } from '../libs/withAsync.js';
import {
  createArticle,
  getArticleList,
  getArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articlesController.js';

const articlesRouter = express.Router();

articlesRouter.post('/', withAsync(createArticle));
articlesRouter.get('/', withAsync(getArticleList));
articlesRouter.get('/:id', withAsync(getArticle));
articlesRouter.patch('/:id', withAsync(updateArticle));
articlesRouter.delete('/:id', withAsync(deleteArticle));

export default articlesRouter;