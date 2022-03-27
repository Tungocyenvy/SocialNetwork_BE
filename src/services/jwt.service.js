require('dotenv').config();
const jwt = require('jsonwebtoken');
const serectKey = process.env.ACCESS_TOKEN_SERECT;
console.log(serectKey);

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

    if (!header) {
      res.json({
        data: {
          tokenVerificationData: {
            access: false,
            message: 'No token provided',
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
              message: 'Failed to verify token',
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
          message: 'Failed to verify token',
        },
      },
    });
  }
}

module.exports = { verify, createToken };
