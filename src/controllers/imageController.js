import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PUBLIC_PATH, STATIC_PATH} from '../libs/constants.js';
import BadRequestError from '../libs/errors/badRequestError.js';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

//multer(module)를 이용해 이미지 업로드
// multer는 이미지, 동영상 등을 비롯한 여러 가지 파일들을 멀티파트 형식으로 업로드할 때 사용하는 미들웨어
export const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      //cb = callback 함수
      cb(null, PUBLIC_PATH);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      // uuid v4를 통해 업로드하는 파일의 이름을 랜덤하게 지정해준다.
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
  //fileSize에 대해 위에서 선언한 상수 값만큼의 제한을 준다.
  limits: {
    fileSize: FILE_SIZE_LIMIT,
  },
  fileFilter: function (req, file, cb) {
    // 업로드되는 파일 유형의 유효성 검사
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const err = new BadRequestError('Only png, jpeg, and jpg are allowed');
      return cb(err);
    }

    cb(null, true);
  },
});

export async function uploadImage(req, res) {
  const host = req.get('host');
  const filePath = path.join(host, STATIC_PATH, req.file.filename);
  const url = `http://${filePath}`;
  return res.send({ url });
}