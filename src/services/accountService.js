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

const getRandomString = () => {
  let result = '';
  const base = '0123456789';
  const baseLength = base.length;

  for (let i = 0; i < 6; i++) {
    const randomIndex = getRandomInt(0, baseLength);
    result += base[randomIndex];
  }
  return result;
};

// Sign in
const signinService = async (body) => {
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

// Sign up both excel and handle
const signup = async (body) => {
  try {
    // console.log(body[0]);
    let logs = [];
    let accountData = {};
    let message = '';
    for (var i in body) {
      let objAccount = {};
      let data = body[i];
      const profile = await Profile.findById({ _id: data._id });
      const account = await Account.findById({ _id: data._id });
      //check profile && account
      if (profile || account) {
        message = data._id + ' already exists';
        logs.push(message);
        console.log(logs);
        continue;
      }

      data.email = data._id + '@gmail.com';
      data.dob = new Date(data.dob);
      const newProfile = new Profile(data);
      console.log(newProfile);

      try {
        await newProfile.save();
      } catch {
        message = ' An error occurred during signup profile at ' + data._id;
        logs.push(message);
        console.log(logs);
        continue;
      }
      const randomNum = getRandomString();
      const password = data._id + '@social' + randomNum;
      const saltOrRound = 8;
      const hassPassword = await bcrypt.hash(password, saltOrRound);
      const newAccount = new Account({
        _id: data._id,
        password: hassPassword,
        role: data.role,
      });

      try {
        await newAccount.save();
      } catch {
        await Profile.findByIdAndDelete({ _id: data._id });
        message = ' An error occurred during signup account at ' + data._id;
        logs.push(message);
        console.log(logs);
        continue;
      }

      objAccount._id = data._id;
      objAccount.password = password;
      accountData[i] = objAccount;
    }
    return {
      msg: 'signup account successful',
      statusCode: 200,
      data: { logs, accountData },
    };
  } catch (err) {
    console.log(err);
    return {
      msg: 'An error occurred during signup proccess',
      statusCode: 300,
    };
  }
};

// delete Account (change isDelete: false->true)
const deleteAccount = async (body) => {
  try {
    // console.log(body[0]);
    let logs = [];
    let message = '';
    for (var i in body) {
      let data = body[i];
      const account = await Account.findById({ _id: data._id });
      //check profile && account
      if (account) {
        account.isDelete = true;
        try {
          await account.save();
        } catch {
          message = 'An error occurred during delete account at ' + data._id;
          logs.push(message);
          console.log(logs);
          continue;
        }
      } else {
        message = data._id + ' does not exists';
        logs.push(message);
        console.log(logs);
        continue;
      }
    }
    return {
      msg: 'delete account successful',
      statusCode: 200,
      data: { logs },
    };
  } catch (err) {
    console.log(err);
    return {
      msg: 'An error occurred during delete account proccess',
      statusCode: 300,
    };
  }
};

// recovery Account (change isDelete: true->false)
const recoveryAccount = async (body) => {
  let { _id } = body;
  try {
    const account = await Account.findById(_id);
    //check profile && account
    if (account) {
      account.isDelete = false;
      await account.save();
      return {
        msg: 'recovery account successful',
        statusCode: 200,
        data: account,
      };
    } else {
      return {
        msg: 'account does not exists',
        statusCode: 200,
        data: account,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      msg: 'An error occurred during recovery account proccess',
      statusCode: 300,
    };
  }
};

module.exports = {
  signinService,
  forgotPassword,
  changePassword,
  getProfile,
  updateProfile,
  signup,
  deleteAccount,
  recoveryAccount,
};
