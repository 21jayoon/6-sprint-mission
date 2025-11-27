import { nonempty, object, partial, string } from 'superstruct';
import { CursorParamsStruct } from './commonStruct.js';

export const CreateCommentBodyStruct = object({
  content: nonempty(string()),
});

export const GetCommentListParamsStruct = CursorParamsStruct;

export const UpdateCommentBodyStruct = partial(CreateCommentBodyStruct);

/* structs 폴더의 structs파일들은 controller 단에서
  자주 쓰일 수 밖에 없거나 반복해서 쓰이는
  Schema Definitions(validation object)들을
  모아두는 곳이다.
 */