require('dotenv').config();
const jwt = require('jsonwebtoken');
const serectKey = process.env.ACCESS_TOKEN_SERECT;
const I18n = require('../config/i18n');

const getMsg = (req) => {
  let lang = req.headers['accept-language'] || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('jwt'));
};

function createToken(data) {
  return jwt.sign(
    {
      data: data,
      iss: 'gai xuong rong',
      iat: new Date().getTime(),
      exp: new Date().setDate(new Date().getDate() + 1),
    },
    serectKey,
  );
}

async function verify(req, res, next) {
  try {
    const header = req.headers.authorization;
    const msg = getMsg(req);

    if (!header) {
      res.json({
        data: {
          tokenVerificationData: {
            access: false,
            message: msg.noProvided,
          },
        },
      });
      return;
    }
    const token = header.split(' ')[1];
    jwt.verify(token, serectKey, (err, decodedFromToken) => {
      if (err) {
        console.log('err');
        res.json({
          data: {
            tokenVerificationData: {
              access: false,
              message: msg.failed,
            },
          },
        });
        return;
      } else {
        const idUser = decodedFromToken.data;
        if (!req.value) req.value = {};
        if (!req.value.body) req.value.body = {};
        req.value = { body: { token: decodedFromToken } };
        next();
      }
    });
  } catch (err) {
    console.log(err);
    return res.json({
      data: {
        tokenVerificationData: {
          access: false,
          message: msg.failed,
        },
      },
    });
  }
}

module.exports = { verify, createToken };
