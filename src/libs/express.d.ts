/**
 * JavaScript(Express)에서는 미들웨어를 통해 req 객체에 user 프로퍼티를
 * 자유롭게 추가할 수 있다.
 * req.body, req.params, req.query(기본 인터페이스 3가지), req.user...
 *
 * 하지만 TypeScript는 Express의 Request 타입 정의(body, params, query)만을 기준으로
 * 타입 검사를 하기 때문에, 기본 Request 인터페이스에 정의되지 않은 req.user를 에러로 인식한다.
 *
 * 따라서 req.user를 안전하게 사용하기 위해
 * Express Request 타입을 확장(augmentation)해야한다.
 */
declare namespace Express{
  export interface Request {
    user?: {
      id: number;
    };
  }
}