import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const articleRouter = Router();
const prisma = new PrismaClient();

// 2. 자유게시판 게시글 (Article) CRUD
// 2-1. 게시글 등록 (POST /articles/)
articleRouter.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "필수 입력 필드(title, content)가 누락되었습니다." });
    }

    const article = await prisma.article.create({
      data: { title, content },
    });

    return res.status(201).json({ message: "게시글 등록 성공", article });
  } catch (error) {
    console.error("게시글 등록 오류:", error);
    return res.status(500).json({ message: "게시글 등록 중 서버 오류가 발생했습니다." });
  }
});

// 2-2. 게시글 목록 조회 (GET /articles/) - Offset Pagination & 검색
articleRouter.get('/', async (req, res) => {
  try {
    const { limit = 10, offset = 0, sort = 'recent', search = '' } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);

    // 유효성 검사
    if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0 || parsedOffset < 0) {
      return res.status(400).json({ message: "limit과 offset은 유효한 숫자여야 합니다." });
    }

    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    } : {};

    const orderBy = sort === 'recent' ? { createdAt: 'desc' } : undefined;

    const articles = await prisma.article.findMany({
      where,
      orderBy,
      take: parsedLimit,
      skip: parsedOffset,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      }
    });
    
    const totalCount = await prisma.article.count({ where });

    return res.json({ 
      message: "게시글 목록 조회 성공", 
      articles, 
      pagination: { 
        total: totalCount, 
        offset: parsedOffset, 
        limit: parsedLimit, 
        nextOffset: (parsedOffset + parsedLimit) < totalCount ? parsedOffset + parsedLimit : null 
      }
    });
  } catch (error) {
    console.error("게시글 목록 조회 오류:", error);
    return res.status(500).json({ message: "게시글 목록 조회 중 서버 오류가 발생했습니다." });
  }
});

// 2-3. 게시글 상세 조회 (GET /:id)
articleRouter.get('/:id', async (req, res) => {
  try {
    const articleId = req.params.id; 

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      }
    });

    if (!article) {
      return res.status(404).json({ message: "게시글을 찾을 수 없습니다." });
    }

    return res.json({ message: "게시글 상세 조회 성공", article });
  } catch (error) {
    console.error("게시글 상세 조회 오류:", error);
    return res.status(500).json({ message: "게시글 상세 조회 중 서버 오류가 발생했습니다." });
  }
});

// 2-4. 게시글 수정 (PATCH /:id)
articleRouter.patch('/:id', async (req, res) => {
  try {
    const articleId = req.params.id; 
    const { title, content } = req.body;

    const article = await prisma.article.update({
      where: { id: articleId },
      data: { title, content },
    });

    return res.json({ message: "게시글 수정 성공", article });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "수정하려는 게시글을 찾을 수 없습니다." });
    }
    console.error("게시글 수정 오류:", error);
    return res.status(500).json({ message: "게시글 수정 중 서버 오류가 발생했습니다." });
  }
});

// 2-5. 게시글 삭제 (DELETE /:id)
articleRouter.delete('/:id', async (req, res) => {
  try {
    const articleId = req.params.id; 

    await prisma.article.delete({
      where: { id: articleId },
    });

    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "삭제하려는 게시글을 찾을 수 없습니다." });
    }
    console.error("게시글 삭제 오류:", error);
    return res.status(500).json({ message: "게시글 삭제 중 서버 오류가 발생했습니다." });
  }
});

// 3. 댓글 (Comment) API
// 3-2. 자유게시판 댓글 등록 (POST /:articleId/comments)
articleRouter.post('/:articleId/comments', async (req, res) => {
  try {
    // 🔑 articleId = UUID(String)
    const articleId = req.params.articleId; 
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "댓글 내용(content)이 누락되었습니다." });
    }

    // 게시글 존재 여부 검사는 외래 키 제약 조건(P2003) 실패로 처리하여 효율성 향상
    const comment = await prisma.comment.create({
      data: { content, articleId },
    });

    return res.status(201).json({ message: "게시글 댓글 등록 성공", comment });
  } catch (error) {
    if (error.code === 'P2003') { // 외래 키 제약 조건 실패 (존재하지 않는 게시글 ID)
       return res.status(404).json({ message: "존재하지 않는 게시글에 댓글을 달 수 없습니다." });
    }
    console.error("게시글 댓글 등록 오류:", error);
    return res.status(500).json({ message: "게시글 댓글 등록 중 서버 오류가 발생했습니다." });
  }
});

// 3-5. 자유게시판 댓글 목록 조회 (GET /:articleId/comments) - Cursor Pagination
articleRouter.get('/:articleId/comments', async (req, res) => {
  try {
    // 🔑 articleId는 UUID(String).
    const articleId = req.params.articleId; 
    const { limit = 10, cursor } = req.query;

    const parsedLimit = parseInt(limit);

    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ message: "limit은 유효한 숫자여야 합니다." });
    }
    
    let queryOptions = {
      where: { articleId },
      orderBy: { createdAt: 'desc' },
      take: parsedLimit + 1, // 다음 페이지 존재 여부 확인을 위해 +1
      select: {
        id: true, // Comment ID는 Int
        content: true,
        createdAt: true,
      }
    };

    if (cursor) {
      // 🔑 Comment ID는 Int이므로 parseInt() 사용
      const parsedCursor = parseInt(cursor);
      if (isNaN(parsedCursor)) {
         return res.status(400).json({ message: "cursor는 유효한 댓글 ID(숫자)여야 합니다." });
      }
      queryOptions.cursor = { id: parsedCursor };
      queryOptions.skip = 1; 
    }

    const comments = await prisma.comment.findMany(queryOptions);

    const hasNextPage = comments.length > parsedLimit;
    const data = hasNextPage ? comments.slice(0, parsedLimit) : comments;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null; // 다음 커서는 마지막 항목의 ID (Int)

    return res.json({ 
        message: "게시글 댓글 목록 조회 성공", 
        comments: data, 
        pagination: {
          nextCursor: nextCursor,
          hasNextPage: hasNextPage,
          limit: parsedLimit
        }
    });
  } catch (error) {
    console.error("게시글 댓글 목록 조회 오류:", error);
    return res.status(500).json({ message: "게시글 댓글 목록 조회 중 서버 오류가 발생했습니다." });
  }
});

export default articleRouter;