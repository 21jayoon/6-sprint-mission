import jwt, { TokenExpiredError } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  // 1. 헤더에서 토큰 추출
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: '토큰이 제공되지 않았습니다.' });
  }

  try {
    // 2. 토큰 검증
    req.user = jwt.verify(token, process.env.JWT_SECRET); // payload 정보를 req에 저장
    next();
  } catch (error) {
    // 3. 에러 처리 (적절한 HTTP 상태 코드와 메시지 반환)
    if (error.name === 'TokenExpiredError') {
      // 토큰이 만료되었을 때만 이 에러가 발생합니다.
      return res.status(401).json({
        message: '토큰이 만료되었습니다.',
        code: 'TOKEN_EXPIRED'
      });
    }
    // 다른 JWT 에러 (Signature verification failed 등)
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export default authMiddleware;