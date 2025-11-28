import { create } from 'superstruct';

// 1. structs단에서 기본 body 객체 형성  2.컨트롤러 단에서 함수 구현  3. 라우터에서 컨트롤러 임포트해서 API endpoint와 연결

//TODO: 1. 회원가입 API 구현 (email, nickname, password 입력) - createUser
// 2. 비밀번호 해싱 저장 처리 - createUser
// 3. 로그인 성공 시 Access Token 발급 (토큰 기반 인증)
export async function createUser (req, res) {
}

/* TODO:
 유저 본인 정보 조회 기능 구현-getUserInfo
 유저 본인 정보 수정 기능 구현-updateUser
 유저 비밀번호 변경 기능 구현 -> 이전 비밀번호와 동일한 값을 입력했을 경우에만 변경 가능하도록 유효성 검사 넣기 - updateUser
 유저가 등록한 상품 목록 조회 기능 구현 - getUsersProductList
 비밀번호를 Response에 노출하지 않도록 처리
 Refresh Token을 이용한 토큰 재발급 기능 구현 (심화)
 로그인한 유저는 상품 좋아요 / 좋아요 취소 기능 가능 (심화)
 로그인한 유저는 게시글 좋아요 / 좋아요 취소 기능 가능 (심화)
 상품·게시글 조회 시 isLiked(Boolean) 필드 포함하여 응답 (심화)
 유저가 좋아요 표시한 상품 목록 조회 기능 구현 (심화)
* */

