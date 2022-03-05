const { createToken } = require('./jwtService');
const bcrypt = require('bcrypt');
const Account = require('../models/accountModel');
const Profile = require('../models/profileModel');
const { sendSMS } = require('./smsService');

//create OTP
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};
const getOTP = () => {
  let otp = '';
  const base = '0123456789';
  for (var i = 0; i < 6; i++) {
    const randNum = getRandomInt(0, base.length);
    otp += base[randNum];
  }
  return otp;
};

// Sign in
const SigninService = async (body) => {
  let { _id, password } = body;

  // kiểm tra tài khoản tồn tại trong Account chưa
  var data = await Account.findOne({ _id });
  console.log(data);
  if (data != null) {
    if (data.isDelete) {
      return {
        msg: 'Your user account has been disabled!',
        statusCode: 300,
      };
    }
    const hashPassword = data.password;
    const result = await bcrypt.compare(password, hashPassword);
    try {
      if (result) {
        const id = data._id;
        const token = createToken(id);
        //const token = data.Token;
        return {
          msg: 'Login Successfull!',
          statusCode: 200,
          data: {
            Token: token,
            Role: data.role,
          },
        };
      } else {
        return {
          msg: 'Your username or password is incorrect. please try again!',
          statusCode: 300,
        };
      }
    } catch {
      return {
        msg: 'An error occurred during the login process',
        statusCode: 300,
      };
    }
  } else {
    return {
      msg: 'Account does not exist',
      statusCode: 300,
    };
  }
};

//forgotPassword
const forgotPassword = async (body) => {
  let { _id } = body;
  // check account
  var data = await Profile.findById({ _id });
  console.log(data);
  if (data != null) {
    try {
      var toPhone = data.phone;
      var content = getOTP() + ' is your OTP. Only valid for 3 min!';
      const sendsms = sendSMS(toPhone, content);
      return {
        msg: 'Please check your sms for a six-digital security code and enter below.',
        statusCode: 200,
        data: { content },
      };
    } catch {
      return {
        msg: 'An error occurred during the forgot password process!',
        statusCode: 300,
      };
    }
  } else {
    return {
      msg: 'Account does not exist. Please check the username and try again!',
      statusCode: 300,
    };
  }
};

// Change Password
const changePassword = async (tokenID, body) => {
  let { password, confirmPassword } = body;

  try {
    const account = await Account.findById({ _id: tokenID });
    if (account != null) {
      if (password === confirmPassword) {
        const saltOrRound = 8;
        const HashNewPassword = await bcrypt.hash(password, saltOrRound);
        account.password = HashNewPassword;
        await Account.findByIdAndUpdate({ _id: tokenID }, account);
        return {
          msg: 'Reset password successful!',
          statusCode: 200,
        };
      } else {
        return {
          msg: 'The password confirmation does not match!',
          statusCode: 300,
        };
      }
    } else {
      return {
        msg: 'Account does not exist!',
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the change password process',
      statusCode: 300,
    };
  }
};

//get Infor User
const getProfile = async (body) => {
  let { AccountId } = body;
  console.log(AccountId);
  try {
    const data = await Profile.findById({ _id: AccountId });
    if (!data) {
      return {
        msg: 'user not found',
        statusCode: 300,
      };
    } else {
      return {
        msg: 'get user  profile successful! ',
        statusCode: 200,
        data: data,
      };
    }
  } catch {
    return {
      msg: 'An error occurred during the get  user profile  process',
      statusCode: 300,
    };
  }
};

const updateProfile = async (AccountId, body) => {
  try {
    console.log(body);
    await Profile.findOneAndUpdate({ _id: AccountId }, body);
    const res = await Profile.findById({ _id: AccountId });
    if (res) {
      return {
        msg: 'update user profile successful',
        statusCode: 200,
        data: res,
      };
    } else {
      return {
        msg: 'user not found!',
        statusCode: 300,
      };
    }
  } catch (err) {
    return {
      msg: 'An error occurred during the get  update user profile  process',
      statusCode: 300,
    };
  }
};

module.exports = {
  SigninService,
  forgotPassword,
  changePassword,
  getProfile,
  updateProfile,
};
