import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const commentsRouter = Router();
const prisma = new PrismaClient();

// 3-3. 댓글 수정 (PATCH /comments/:id -> /:id)
commentsRouter.patch('/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "수정할 내용(content)이 누락되었습니다." });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
      select: { id: true, content: true, createdAt: true },
    });

    return res.json({ message: "댓글 수정 성공", comment: updatedComment });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "수정하려는 댓글을 찾을 수 없습니다." });
    }
    return res.status(500).json({ message: "댓글 수정 중 서버 오류가 발생했습니다." });
  }
});

// 3-4. 댓글 삭제 (DELETE /comments/:id -> /:id)
commentsRouter.delete('/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return res.status(204).send(); // No Content
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "삭제하려는 댓글을 찾을 수 없습니다." });
    }
    return res.status(500).json({ message: "댓글 삭제 중 서버 오류가 발생했습니다." });
  }
});

export default commentsRouter;