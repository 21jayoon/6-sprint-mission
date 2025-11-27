import { create } from 'superstruct';
import {prismaClient} from '../libs/prismaClient.js';
import { CreateCommentBodyStruct, UpdateCommentBodyStruct } from '../structs/commentsStruct.js';
import { IdParamStruct } from '../structs/commonStruct.js';
import NotFoundError from '../libs/errors/notFoundError.js';

export async function createComment(req, res) {
  // articleId를 id(식별값)로 받아서 IdParamsStruct을 통해 request parameter로 넣어준다.
  const {id: articleId} = create(req.params, IdParamStruct);
  const { content } = create(req.body, CreateCommentBodyStruct);

  //articleId를 기반으로 이미 있는(작성된) article을 findUnique 메소드로 갖고 온다
  const existingArticle = await prismaClient.article.findUnique({ where: {id: articleId} });
  if (!existingArticle) {
    throw new NotFoundError("article", articleId);
  }

  // 찾아온 existingArticle 내용을 기반으로 댓글을 만든다. 이 떄, 로그인한 유저만 댓글 작성 가능하도록 조건을 제한한다.
  const comment = await prismaClient.comment.create({
    data: {
      articleId,
      content,
    },
  });

  return res.status(201).send(comment);
}

export async function getCommentList(req, res) {
  const { id: articleId } = create(req.params, IdParamStruct);
  const { cursor, limit } = create(req.query, GetCommentListParamsStruct);

  const article = await prismaClient.article.findUnique({ where: { id: articleId } });
  if (!article) {
    throw new NotFoundError('article', articleId);
  }

  const commentsWithCursor = await prismaClient.comment.findMany({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    where: { articleId },
    orderBy: { createdAt: 'desc' },
  });
  const comments = commentsWithCursor.slice(0, limit);
  const cursorComment = commentsWithCursor[commentsWithCursor.length - 1];
  const nextCursor = cursorComment ? cursorComment.id : null;

  return res.send({
    list: comments,
    nextCursor,
  });
}

export async function updateComment(req, res) {
  const { id } = create(req.params, IdParamStruct);
  const {content} = create(req.body, UpdateCommentBodyStruct);

  const existingComment = await prismaClient.comment.findUnique({ where: {id}} );
  if (!existingComment) {
    throw new NotFoundError('comment', id);
  }

  const updatedComment = await prismaClient.comment.update({
    where: {id},
    data: { content },
  });

  return res.send(updatedComment);
}

export async function deleteComment(req, res){
  const { id } = create(req.params, IdParamStruct);

  const existingComment = await prismaClient.comment.findUnique({ where: { id } });
  if (!existingComment) {
    throw new NotFoundError('comment', id);
  }

  await prismaClient.comment.delete({ where: {id} });

  return res.status(204).send();
}