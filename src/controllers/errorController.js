import { StructError } from 'superstruct';
import BadRequestError from '../libs/errors/badRequestError.js';
import NotFoundError from '../libs/errors/notFoundError.js';

//404가 응답으로 들어왔을 때 개발자에게 보여줄 기본 메세지를 설정한다.
export function defaultNotFoundHandler(req, res, next) {
  return res.status(404).send({ message: 'Not Found' });
}

// 조건에 따라 다른 메세지를 출력할 전역 에러 핸들러 설정
export function globalErrorHandler(err, req, res, next) {
  /** From superstruct or application error */
  if(err instanceof StructError || err instanceof BadRequestError) {
    return res.status(400).send({ message: err.message });
  }

  /** From express.json middleware */
  // SyntaxError거나 400 에러, body에 에러가 생기는 경우 'Invalid JSON' message를 출력하도록 만듦.
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ message: 'Invalid JSON' });
  }

  /** Prisma error codes */
  if (err.code) {
    console.error(err);
    return res.status(500).send({ message: 'Failed to process data' });
  }

  /** Application error */
  if (err instanceof NotFoundError) {
    return res.status(404).send({ message: err.message });
  }

  console.error(err);
  return res.status(500).send({ message: 'Internal server error' });
}