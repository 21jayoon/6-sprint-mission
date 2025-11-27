import { create } from 'superstruct';

//TODO: 1. 회원가입 API 구현 (email, nickname, password 입력)
// 2. 비밀번호 해싱 저장 처리
// 3. 로그인 성공 시 Access Token 발급 (토큰 기반 인증)
export async function createUser (req, res) {
}

/* TODO:
 유저 본인 정보 조회 기능 구현
 유저 본인 정보 수정 기능 구현
 유저 비밀번호 변경 기능 구현
 유저가 등록한 상품 목록 조회 기능 구현
 비밀번호를 Response에 노출하지 않도록 처리
 Refresh Token을 이용한 토큰 재발급 기능 구현
 로그인한 유저는 상품 좋아요 / 좋아요 취소 기능 가능
 로그인한 유저는 게시글 좋아요 / 좋아요 취소 기능 가능
 상품·게시글 조회 시 isLiked(Boolean) 필드 포함하여 응답
 유저가 좋아요 표시한 상품 목록 조회 기능 구현
* */