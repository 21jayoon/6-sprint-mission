import { coerce, nonempty, nullable, object, partial, string } from 'superstruct';
import { PageParamsStruct } from './commonStruct.js';

export const GetArticleListParamsStruct = PageParamsStruct;

export const CreateArticleBodyStruct = object({
  title: coerce(nonempty(string()), string(), (value) => value.trim()),
  content: nonempty(string()),
  image: nullable(string()),
});

export const UpdateArticleBodyStruct = partial(CreateArticleBodyStruct);

/* structs 폴더의 structs파일들은 controller 단에서
  자주 쓰일 수 밖에 없거나 반복해서 쓰이는
  Schema Definitions(validation object)들을
  모아두는 곳이다.
 */