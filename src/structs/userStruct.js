// 본인 정보 조회 및 수정, 등록한 상품 목록 조회 기능 구현을 위해서는 userId를 API 엔드포인트에서 받아와야함.
//->00ParamsStruct를 commonStruct.js에서 import해서 사용해야 함.

//타입스크립트는 자바스크립트에 타입 문법을 추가한 언어-> MS가 만든 언어
/* 도입 이유
- JavaScript를 사용할 때의 단점 - 실행 전까지는 오류를 알기 어려움-> 런타임 오류가 자주 남. 자바스크립트의 태생적 한계
    - 오류가나서 알고보니 변수 이름이나 코드가 오타였던 적이 있는지
    - 백엔드 구현하면서 데이터베이스에서 Integer를 쓰는데 문자열을 가지고 Prisma의 where을 잘못 사용한 적이 있는지
    - 현업에서는 복잡하고 많은 양의 코드 안에서 작업하기 때문에 사람이 일일이 고려해서 코딩하기 어려움
    - 대규모로 코드를 개선(리팩토링)하는 경우에는 기존 코드에 맞게 동작하는지, 새로 고친 코드는 누락된 부분이 없는지 더더욱 파악하기 어려움
* */
// superstruct의 coerce는 유효성 검사 전에 객체의 자료형을 바꿔주는 function(예. date를 string으로)
import { object, nonempty, string, nullable, partial, coerce } from 'superstruct';
import { PageParamsStruct } from './commonStruct.js';
