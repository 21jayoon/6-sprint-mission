import { coerce, integer, object, string, defaulted, optional, enums, nonempty } from 'supetstruct';

/** 문자형을 숫자형으로 바꾸고 유효성 검사를 한다
Convert string to integer then validate it */
const integerString = coerce(integer(), string(), (value) => parseInt(value));

export const IdParamStruct = object({
  id: integerString,
});

export const PageParamsStruct = object({
  page: defaulted(integerString, 1),
  pageSize: defaulted(integerString, 10),
  orderBy: optional(enums(['recent'])),
  keyword: optional(nonempty(string())),
});

export const CursorParamsStruct = object({
  cursor: defaulted(integerString, 0),
  limit: defaulted(integerString, 10),
  orderBy: optional(enums(['recent'])),
  keyword: optional(nonempty(string())),
});

/* structs 폴더의 structs파일들은 controller 단에서
  자주 쓰일 수 밖에 없거나 반복해서 쓰이는
  Schema Definitions(validation object)들을
  모아두는 곳이다.
 */