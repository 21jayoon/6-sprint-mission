import express from 'express';
import { withAsync } from '../libs/withAsync.js';
import {
  createComment,
  getCommentList,
  updateComment,
  deleteComment } from '../controllers/commentController.js';

const commentsRouter = express.Router();

commentsRouter.post('/:id/comments', withAsync(createComment));
commentsRouter.get('/:id/comments', withAsync(getCommentList));
commentsRouter.patch('/:id', withAsync(updateComment));
commentsRouter.delete('/:id', withAsync(deleteComment));

export default commentsRouter;