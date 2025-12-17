// 본인 정보 조회 및 수정, 등록한 상품 목록 조회 기능
// 구현을 위해서는 userId를 API 엔드포인트에서 받아와야함.
//->00ParamsStruct를 commonStruct.js에서 import해서 사용해야 함.

// superstruct의 coerce는 유효성 검사 전에 객체의 자료형을 바꿔주는 function(예. date를 string으로)
import { object, nonempty, string, nullable, partial, coerce, pattern } from 'superstruct';
import { PageParamsStruct } from './commonStruct.js';

/*유효성 검사는 가능한 한 요청 처리 흐름의 가장 앞단에서 수행하여,
잘못된 데이터가 컨트롤러나 서비스 로직, 데이터베이스까지
도달하는 것을 막아야 합니다. 이것이 바로 Fail Fast 원칙입니다.
Reference: https://www.techtarget.com/whatis/definition/fail-fast */
// 00struct.js는 형식 검사 필터같은 느낌.

// 사용자가 공백 포함 입력 시 인식에 오류가 날 수도 있기 때문에
// trim(문자열 양 끝 공백 제거한 새로운 문자열 반환하는 인스턴스 메서드) 사용해 문자열 유효성 검사(trimming)
const trimNonEmptyString = coerce(
  nonempty(string()),
  string(),
  (value) => value.trim()
);

// 기본 이메일 형식 검사를 위한 custom struct(validation)
// String+Number+특수문자 @ String+Number . String 같은 이메일 형태를 검증한다
const Email = pattern(
  trimNonEmptyString,
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
);

/** Create User
 * 1. 회원가입 - email, nickname, password 입력
 * @property string email
 * @property string nickname
 * @property string password
 */
export const CreateUserBodyStruct = object({
  email: Email,
  nickname: trimNonEmptyString,
  password: nonempty(string()),
});

/** Update User
 * 2. 유저 정보 수정 API 요청 바디 구조체
 */
export const UpdateUserBodyStruct = partial(CreateUserBodyStruct);

/** Change Password Struct
 * 3. user password change API request Body structure
 * @property string oldPW
 * @property string newPW
 */
export const ChangePWBodyStruct = object({
  oldPW: nonempty(string()),
  newPW: nonempty(string()),
});

/** Get.....ListParamsStruct
 * 4 & 5 & 6. 유저가 ...... 목록 조회 API 요청 Query 구조체
 * 4. 등록한 상품
 * 5. 좋아요 표시한 상품
 * 6. 좋아요 표시한 게시글
 */
export const GetUsersProductListParamsStruct = PageParamsStruct;

export const GetLikedProductParamsStruct = PageParamsStruct;

export const GetLikedArticleParamsStruct = PageParamsStruct;

/** LoginBodyStruct
 * 8. 로그인 시 필요한 body 구조체
 */
export const LoginBodyStruct = object({
  email: Email,
  password: nonempty(string()),
});

/* 1. structs단에서 기본 body 객체 형성
  2.컨트롤러 단에서 함수 구현
  3. 라우터에서 컨트롤러 임포트해서 API endpoint와 연결
  structs 폴더의 structs파일들은 controller 단에서
  자주 쓰일 수 밖에 없거나 반복해서 쓰이는
  Schema Definitions(validation object)들을
  모아두는 곳이다.
 */