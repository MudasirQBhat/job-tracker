const CryptoJS = require('crypto-js');

const SECRET = process.env.ENCRYPTION_SECRET;

const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
};

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encrypt, decrypt };