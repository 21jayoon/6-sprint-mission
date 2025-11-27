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