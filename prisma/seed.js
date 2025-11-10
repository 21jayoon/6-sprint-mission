import { PrismaClient } from '@prisma/client';
import { withAccelerate } from "@prisma/extension-accelerate";
import { PRODUCTS, ARTICLES, PRODUCT_COMMENTS_MOCK, ARTICLE_COMMENTS_MOCK } from './mock.js';

const prisma = new PrismaClient().$extends(withAccelerate());

// TRUNCATE를 사용하여 데이터를 삭제하고 시퀀스를 초기화하는 함수
async function truncateTable(tableName) {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`
  );
}

async function main() {
  console.log('Start seeding...');

  // 🗑️ 기존 데이터 삭제 (TRUNCATE를 사용하여 성능 개선)
  console.log('Deleting existing data...');
  // Note: 테이블의 관계에 따라 순서대로 TRUNCATE를 실행해야 할 수 있습니다.
  //await truncateTable('Comment');
  //await truncateTable('Product');
  //await truncateTable('Article');
  
  // 🏷️ id를 명시적으로 포함하여 데이터 준비
  const productData = PRODUCTS.map(product => ({ 
      ...product, 
      id: product.id,
      // Date 객체는 그대로 전달 가능
  }));
  
  const articleData = ARTICLES.map(article => ({ 
      ...article, 
      id: article.id,
      // Date 객체는 그대로 전달 가능
  }));

  // 📦 상품 데이터 배치 삽입
  await prisma.product.createMany({
    data: productData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${productData.length} products.`);
  
  // 📰 게시글 데이터 배치 삽입
  await prisma.article.createMany({
    data: articleData,
    skipDuplicates: true,
  });

  console.log(`Seeded ${articleData.length} articles.`);

  // 💬 댓글 데이터 삽입 (관계 연결)
  const productCommentsData = PRODUCT_COMMENTS_MOCK.map((comment, index) => ({
    content: comment.content,
    // 첫 번째 댓글은 첫 번째 상품에 연결, 두 번째 댓글은 두 번째 상품에 연결
    productId: allProducts[index % allProducts.length].id, 
  }));
  
  const articleCommentsData = ARTICLE_COMMENTS_MOCK.map((comment, index) => ({
    content: comment.content,
    // 첫 번째 댓글은 첫 번째 게시글에 연결, 두 번째 댓글은 두 번째 게시글에 연결
    articleId: allArticles[index % allArticles.length].id, 
  }));

  const allComments = [...productCommentsData, ...articleCommentsData];
  
  // Comment 데이터 등록
  const commentResult = await prisma.comment.createMany({ data: allComments, skipDuplicates: true });
  console.log(`Seeded ${commentResult.count} comments, linked to products and articles.`);

  console.log('Seeding finished. ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });