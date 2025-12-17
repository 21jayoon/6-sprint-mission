import jwt, { TokenExpiredError } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_ACCESS_SECRET } from '../libs/constants.ts';
import { verifyAccessToken } from '../libs/token.js';

dotenv.config();

export default function authMiddleware (options = { optional: false }) {
  return async (req, res, next) => {
    // 1. cookie에서 토큰 추출
    const token = req.cookies['accessToken'];
    if (options.optional) {
      return next();
    }
      return res.status(401).send({ message: '인증이 필요합니다.' });
    }

    try {
      // 2. 토큰 검증
      const { userId } = verifyAccessToken(token);
      //req.user = jwt.verify(token, JWT_ACCESS_SECRET); // payload 정보를 req에 저장
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
  }
}