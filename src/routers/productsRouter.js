import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const productsRouter = Router();
const prisma = new PrismaClient();

// 1-1. 상품 등록 (POST /products/)
productsRouter.post('/', async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;
    // price가 0일 경우를 허용하기 위해 `price === undefined`로 체크
    if (!name || !description || price === undefined || !tags) { 
      return res.status(400).json({ message: "필수 입력 필드가 누락되었습니다 (name, description, price, tags)." });
    }

    // tags가 배열이 아닐 경우 배열로 변환하는 로직
    const finalTags = Array.isArray(tags) ? tags : [tags].filter(t => t); 

    const newProduct = await prisma.product.create({
      data: { name, description, price, tags: finalTags }
    });

    return res.status(201).json({ message: "상품 등록 성공", product: newProduct });
  } catch (error) {
    console.error("상품 등록 오류:", error);
    return res.status(500).json({ message: "상품 등록 중 서버 오류가 발생했습니다." });
  }
});

// 1-2. 상품 목록 조회 (GET /products/) - 검색, Offset Pagination, 최신순 정렬
productsRouter.get('/', async (req, res) => {
  try {
    const { search, offset, limit, sort } = req.query;
    const take = parseInt(limit) || 10;
    const skip = parseInt(offset) || 0;
    
    // 유효성 검사 추가 
    if (isNaN(take) || isNaN(skip) || take <= 0 || skip < 0) {
        return res.status(400).json({ message: "limit과 offset은 유효한 숫자여야 합니다." });
    }

    const searchCondition = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const orderBy = (sort === 'recent' || !sort) 
      ? { createdAt: 'desc' } 
      : {};

    const products = await prisma.product.findMany({
      where: searchCondition,
      select: { 
        id: true, 
        name: true, 
        price: true, 
        createdAt: true 
      },
      orderBy: orderBy,
      skip: skip,
      take: take,
    });

    const totalCount = await prisma.product.count({ where: searchCondition });

    return res.json({ 
      products, 
      pagination: { 
        total: totalCount, 
        offset: skip, 
        limit: take, 
        nextOffset: (skip + take) < totalCount ? skip + take : null 
      }
    });
  } catch (error) {
    console.error("상품 목록 조회 오류:", error);
    return res.status(500).json({ message: "상품 목록 조회 중 서버 오류가 발생했습니다." });
  }
});

// 1-3. 상품 상세 조회 (GET /products/:id)
productsRouter.get('/:id', async (req, res) => {
  try {
    // 💡 수정: Product ID는 String (UUID) 이므로 req.params.id를 그대로 사용합니다.
    const productId = req.params.id; 
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        tags: true,
        createdAt: true,
      }
    });

    if (!product) {
      return res.status(404).json({ message: "해당 상품을 찾을 수 없습니다." });
    }
    return res.json(product);
  } catch (error) {
    console.error("상품 상세 조회 오류:", error);
    return res.status(500).json({ message: "상품 상세 조회 중 서버 오류가 발생했습니다." });
  }
});

// 1-4. 상품 수정 (PATCH /products/:id)
productsRouter.patch('/:id', async (req, res) => {
  try {
    // 💡 수정: Product ID는 String (UUID) 이므로 req.params.id를 그대로 사용합니다.
    const productId = req.params.id;
    const updateData = req.body;
    
    // tags가 포함되어 있다면 배열로 변환하는 로직을 추가해야 합니다.
    if (updateData.tags && !Array.isArray(updateData.tags)) {
      updateData.tags = [updateData.tags].filter(t => t);
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return res.json({ message: "상품 수정 성공", product: updatedProduct });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "수정하려는 상품을 찾을 수 없습니다." });
    }
    console.error("상품 수정 오류:", error);
    return res.status(500).json({ message: "상품 수정 중 서버 오류가 발생했습니다." });
  }
});

// 1-5. 상품 삭제 (DELETE /products/:id)
productsRouter.delete('/:id', async (req, res) => {
  try {
    // 💡 수정: Product ID는 String (UUID) 이므로 req.params.id를 그대로 사용합니다.
    const productId = req.params.id;

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "삭제하려는 상품을 찾을 수 없습니다." });
    }
    console.error("상품 삭제 오류:", error);
    return res.status(500).json({ message: "상품 삭제 중 서버 오류가 발생했습니다." });
  }
});

// 3-1. 중고마켓 댓글 등록 (POST /products/:productId/comments -> /:productId/comments)
productsRouter.post('/:productId/comments', async (req, res) => {
  try {
    // 💡 수정: Product ID는 String (UUID) 이므로 req.params.productId를 그대로 사용합니다.
    const productId = req.params.productId;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "댓글 내용(content)이 누락되었습니다." });
    }
    
    // Product ID의 유효성 검사는 외래 키 제약 조건(P2003) 실패로 대체합니다.
    
    const newComment = await prisma.comment.create({
      data: { content, productId: productId } // productId는 String 타입입니다.
    });

    return res.status(201).json({ message: "댓글 등록 성공", comment: newComment });
  } catch (error) {
    // P2003 (외래 키 제약 조건 실패)는 존재하지 않는 상품 ID를 넣었을 때 발생합니다.
    if (error.code === 'P2003') { 
       return res.status(404).json({ message: "댓글을 등록하려는 상품을 찾을 수 없습니다." });
    }
    console.error("상품 댓글 등록 오류:", error);
    return res.status(500).json({ message: "상품 댓글 등록 중 서버 오류가 발생했습니다." });
  }
});

// 3-5. 중고마켓 댓글 목록 조회 (GET /products/:productId/comments -> /:productId/comments) - Cursor Pagination
productsRouter.get('/:productId/comments', async (req, res) => {
  try {
    // 💡 수정: Product ID는 String (UUID) 이므로 req.params.productId를 그대로 사용합니다.
    const productId = req.params.productId;
    const { cursor, limit } = req.query;
    const take = parseInt(limit) || 10;
    
    // 유효성 검사 (take만 검사)
    if (isNaN(take) || take <= 0) {
        return res.status(400).json({ message: "limit은 유효한 숫자여야 합니다." });
    }

    let queryOptions = {
      where: { productId: productId },
      select: { id: true, content: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: take + 1, // 다음 페이지 존재 여부 확인을 위해 limit + 1
    };

    if (cursor) {
      const parsedCursor = parseInt(cursor); 
      if (isNaN(parsedCursor)) {
         return res.status(400).json({ message: "cursor는 유효한 댓글 ID(숫자)여야 합니다." });
      }
      queryOptions.cursor = { id: parsedCursor }; // cursor 필드에 고유키(id) 명시
      queryOptions.skip = 1; // 커서로 지정된 항목을 건너뜁니다.
    }
    
    const comments = await prisma.comment.findMany(queryOptions);
    
    const hasNextPage = comments.length > take;
    const data = hasNextPage ? comments.slice(0, take) : comments; // limit 개수만큼만 데이터 사용
    const nextCursor = hasNextPage ? data[data.length - 1].id : null; // 다음 커서는 마지막 항목의 ID (Int)

    return res.json({ 
      comments: data, // 슬라이스된 댓글 데이터만 반환
      pagination: { 
        limit: take, 
        nextCursor: nextCursor,
        hasNextPage: hasNextPage
      }
    });
  } catch (error) {
    console.error("상품 댓글 조회 오류:", error);
    return res.status(500).json({ message: "상품 댓글 조회 중 서버 오류가 발생했습니다." });
  }
});

export default productsRouter;