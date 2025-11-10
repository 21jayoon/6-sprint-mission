import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import productsRouter from './src/routers/productsRouter.js';
import articleRouter from './src/routers/articleRouter.js';
import commentsRouter from './src/routers/commentsRouter.js';
import multer from 'multer';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 3000;

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());
// 모든 도메인을 허용하기 위한 cors 설정
app.use(cors());

// --- 라우터 연결 ---
// 1. 중고마켓 (Product) 라우터 연결 경로: /products 
app.use('/products', productsRouter);

// 2. 자유게시판 (Article) 라우터 연결 경로: /articles
app.use('/articles', articleRouter);

// 3. 댓글 (Comment) 독립 라우터 연결 경로: /comments
app.use('/comments', commentsRouter);

// 데이터베이스 연결 테스트 및 서버 시작
async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to connect to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

// 서버 종료 시 데이터베이스 연결 해제
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});