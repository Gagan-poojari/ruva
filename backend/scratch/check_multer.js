const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
const mockReq = { 
  headers: { 'content-type': 'multipart/form-data; boundary=---' },
  pipe: (dest) => {
    dest.emit('error', new Error('LIMIT_FILE_SIZE'));
  }
};
// This is just to see the error object structure if I could run it.
// But I'll just look at the code.
