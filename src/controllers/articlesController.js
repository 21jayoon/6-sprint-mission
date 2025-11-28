import { create } from 'superstruct';
import { prismaClient} from '../libs/prismaClient.js';
import NotFoundError from '../libs/errors/notFoundError.js';
import { IdParamStruct} from '../structs/commonStruct.js';
import {
  CreateArticleBodyStruct,
  UpdateArticleBodyStruct,
  GetArticleListParamsStruct,
} from '../structs/articlesStruct.js';

export async function createArticle(req, res) {
  /* Superstruct = A library for defining interfaces and validating data
   in JavaScript and TypeScript at runtime.
   It's useful for validating API input or internal data structures
   and generates detailed errors when data is invalid.
   */
  // superstruct의 create기능을 이용해 HTTP request body에 CreateArticleBodyStruct의 결과물을 담아 보낸다.
  const data = create(req.body, CreateArticleBodyStruct);

  const article = await prismaClient.article.create({data});

  return res.status(201).send(article);
}

export async function getArticleList(req, res) {
  // page, pageSize, orderBy, keyword 요소를 GetArticleListParamsStruct를 통해 리퀘스트 쿼리로 전달
  const { page, pageSize, orderBy, keyword } = create(req.query, GetArticleListParamsStruct);

  //keyword 속성의 경우 삼항연산자를 통해 keyword에 해당하는 string 값을 찾거나 undefined 형태로 남겨두는 로직을 사용.
  const where = {
    title: keyword ? { contains: keyword } : undefined,
  };

  const totalCount = await prismaClient.article.count({ where });
  const articles = await prismaClient.article.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: orderBy === 'recent' ? { createdAt: 'desc' } : { id: 'asc' },
    where,
  });

  return res.send({
    list: articles,
    totalCount,
  });
}

export async function getArticle(req, res) {
  // articleId로 URI의 쿼리 파라미터를 IdParamStruct 통해 생성
  const {id} = create(req.params, IdParamStruct);

  const article = await prismaClient.article.findUnique({where: {id}});
  if(!article) {
    throw new NotFoundError("article", id);
  }

  return res.send(article);
}

export async function updateArticle(req, res) {
  const {id} = create(req.params, IdParamStruct);
  const data = create(req.body, UpdateArticleBodyStruct);

  // params에 있는 Id와 동일한 id를 찾아서 UpdateArticleBodyStruct 만들어 req.body로 보낸 data 값으로
  // 기존 article을 업데이트한다.
  const article = await prismaClient.article.update({where: {id}, data});
  if (!article) {
    throw new NotFoundError("article", articleId);
  }

  return res.send(article);
}

export async function deleteArticle(req, res) {
  const { id } = create(req.params, IdParamsStruct);

  const existingArticle = await prismaClient.article.findUnique({ where: { id } });
  if (!existingArticle) {
    throw new NotFoundError('article', id);
  }

  await prismaClient.article.delete({ where: { id } });

  return res.status(204).send();
}