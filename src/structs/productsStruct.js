import { coerce, partial, object, string, min, nonempty, array, integer } from 'superstruct';
import { PageParamsStruct} from './commonStruct.js';

export const CreateProductBodyStruct = object({
  name: coerce(nonempty(string()), string(), (value) => value.trim()),
  description: nonempty(string()),
  price: min(integer(), 0),
  tags: array(nonempty(string())),
  images: array(nonempty(string())),
});

export const GetProductListParamsStruct = PageParamsStruct;

// 수정 사항은 product를 만드는 객체인 CreateProductBodyStruct의
// 일부를 사용하는 partial 함수를 이용해 업데이트한다.
//  https://gist.github.com/polarity/9742935
//  https://medium.com/@jnkrtech/partial-function-application-in-javascript-and-flow-7f3ca87074fe
export const UpdateProductBodyStruct = partial(CreateProductBodyStruct);