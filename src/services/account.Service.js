const { createToken } = require('./jwt.Service');
const bcrypt = require('bcrypt');
const Account = require('../models/account.Model');
const Profile = require('../models/profile.Model');
const { sendSMS } = require('./sms.Service');
const GroupService = require('./group.Service');
const { result } = require('lodash');

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
        const profile = await Profile.findById({ _id: id });
        //const token = data.Token;
        return {
          msg: 'Login Successfull!',
          statusCode: 200,
          data: {
            token,
            role: data.role,
            profile,
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

// Reset Password
const resetPassword = async (body) => {
  let { userId, password, confirmPassword } = body;

  try {
    const account = await Account.findById({ _id: userId });
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
      msg: 'An error occurred during the reset password process',
      statusCode: 300,
    };
  }
};

// Change Password
const changePassword = async (userID, body) => {
  let { password, newPassword, confirmPassword } = body;

  try {
    const account = await Account.findById({ _id: userID });
    if (account != null) {
      const hashPassword = account.PassWord;
      const result = await bcrypt.compare(password, hashPassword);
      if (result) {
        if (newPassword === confirmPassword) {
          const saltOrRound = 8;
          const hashNewPassword = await bcrypt.hash(newPassword, saltOrRound);
          account.PassWord = hashNewPassword;
          await account.save();
          return {
            msg: 'Change Password Successful!',
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
          msg: 'Password incorrect',
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

      //create Profile
      try {
        await newProfile.save();
      } catch {
        message = ' An error occurred during signup profile at ' + data._id;
        logs.push(message);
        console.log(logs);
        continue;
      }

      /**CREATE ACCOUNT */
      const role = data.role;
      const randomNum = getRandomString();
      const password = data._id + '@social' + randomNum;
      const saltOrRound = 8;
      const hassPassword = await bcrypt.hash(password, saltOrRound);
      const newAccount = new Account({
        _id: data._id,
        password: hassPassword,
        role,
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

      /**ADD MAIN GROUP */
      var groupId = 'grsv';
      if (role !== 'student') groupId = 'grgv';
      var type = 'main';
      for (var i = 0; i < 2; i++) {
        //i=0 add grsv,grgv, =1 add gr fac
        if (i === 1) {
          groupId = data.faculity;
          type = 'fac';
        }
        try {
          const stt = (
            await GroupService.addUser({ _id: data._id, groupId, type, role })
          ).statusCode;
          if (stt === 300) {
            message =
              'An error occurred during add ' +
              data._id +
              ' to group ' +
              groupId +
              ' process';
            logs.push(message);
            console.log(logs);
            continue;
          }
        } catch {
          message =
            'An error occurred during add ' +
            data._id +
            ' to group ' +
            groupId +
            ' process';
          logs.push(message);
          console.log(logs);
          continue;
        }
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

//**PROFILE */
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

//search by name or identify
const searchUser = async (req) => {
  let keyword = req.query.keyword;
  let perPage = 10;
  let { page } = req.query || 1;
  try {
    const sub = 'admin';

    let result;

    //filter special characters and uppercase, lowercase
    let key = new RegExp(
      keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'),
      'i',
    );

    let total = 0;

    //check key is identify (number or admin)
    if (Number(keyword) === Number(keyword) + 0 || keyword.indexOf(sub) === 0) {
      total = await Profile.countDocuments({ _id: keyword });
      if (total > 0) {
        result = await Profile.findById({ _id: keyword })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    } else {
      //search by name
      total = await Profile.countDocuments({ fullname: key });
      if (total > 0) {
        result = await Profile.find({ fullname: key })
          .skip(perPage * page - perPage)
          .limit(perPage);
      }
    }
    return {
      msg: 'search successful',
      data: { result, total },
      statusCode: 200,
    };
  } catch {
    return {
      msg: 'An error occurred during the search user profile  process',
      statusCode: 300,
    };
  }
};

module.exports = {
  signinService,
  forgotPassword,
  resetPassword,
  signup,
  deleteAccount,
  recoveryAccount,
  getProfile,
  updateProfile,
  searchUser,
};
