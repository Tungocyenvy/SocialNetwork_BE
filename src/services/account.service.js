const { createToken } = require('./jwt.service');
const bcrypt = require('bcrypt');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');
const Role = require('../models/role.model');
const { sendSMS } = require('./sms.service');
const groupService = require('./group.service');
const moment = require('moment');

const I18n = require('../config/i18n');

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
const signinService = async (req) => {
  let { _id, password } = req.body || {};
  let lang = req.headers['accept-language'] || 'en';
  I18n.setLocale(lang);
  // kiểm tra tài khoản tồn tại trong Account chưa
  var data = await Account.findOne({ _id });
  if (data != null) {
    if (data.isDelete) {
      return {
        msg: I18n.__('account').disabled,
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
        const role = await Role.findById({ _id: data.roleId });

        if (!profile) {
          return {
            msg: I18n.__('account').notProfile,
            statusCode: 300,
          };
        }
        //const token = data.Token;
        return {
          msg: I18n.__('account').login,
          statusCode: 200,
          data: {
            token,
            role: role.nameEn,
            isAdminSG: data.isAdminSG,
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
  let { _id } = body || {};
  // check account
  var data = await Profile.findById({ _id });
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
  let { userId, password, confirmPassword } = body || {};

  try {
    const account = await Account.findById({ _id: userId });
    if (account != null) {
      if (password === confirmPassword) {
        const saltOrRound = 8;
        const HashNewPassword = await bcrypt.hash(password, saltOrRound);
        if (HashNewPassword) {
          account.password = HashNewPassword;
          await Account.findByIdAndUpdate({ _id: userId }, account);
          return {
            msg: 'Reset password successful!',
            statusCode: 200,
          };
        } else {
          return {
            msg: 'An error occurred during the hash password process',
            statusCode: 300,
          };
        }
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
  let { password, newPassword, confirmPassword } = body || {};

  try {
    const account = await Account.findById({ _id: userID });
    if (account != null) {
      const hashPassword = account.password;
      const result = await bcrypt.compare(password, hashPassword);
      if (result) {
        if (newPassword === confirmPassword) {
          const saltOrRound = 8;
          const hashNewPassword = await bcrypt.hash(newPassword, saltOrRound);
          if (hashNewPassword) {
            account.password = hashNewPassword;
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
      let userId = String(data._id);
      console.log(userId);
      const profile = await Profile.findById({ _id: userId });
      const account = await Account.findById({ _id: userId });
      //check profile && account
      if (profile || account) {
        message = userId + ' already exists';
        logs.push(message);
        continue;
      }

      const roleId = Number(data.roleId);

      data.email = userId + '@gmail.com';
      data.dob = new Date(data.dob);
      delete data.roleId;

      //create Profile
      try {
        await Profile.create(data);
      } catch {
        message = ' An error occurred during signup profile at ' + userId;
        logs.push(message);
        continue;
      }

      /**CREATE ACCOUNT */
      const randomNum = getRandomString();
      const password = userId + '@social' + randomNum;
      const saltOrRound = 8;
      const hassPassword = await bcrypt.hash(password, saltOrRound);
      if (!hassPassword) {
        await Profile.findByIdAndDelete({ _id: userId });
        message =
          ' An error occurred during hash password account at ' + userId;
        logs.push(message);
        continue;
      }
      const newAccount = new Account({
        _id: userId,
        password: hassPassword,
        roleId,
      });

      try {
        await newAccount.save();
      } catch {
        await Profile.findByIdAndDelete({ _id: userId });
        message = ' An error occurred during signup account at ' + userId;
        logs.push(message);
        continue;
      }

      /**ADD MAIN GROUP */
      let groupId = 'grsv';
      if (roleId !== 4) groupId = 'grgv';
      let type = 'main';
      for (var k = 0; k < 2; k++) {
        //i=0 add grsv,grgv,
        //i=1 add gr faculity
        if (k === 1) {
          groupId = data.faculty ? data.faculty : {};
        }
        if (!groupId) {
          message = ' Not found faculty for user ' + userId;
          logs.push(message);
          continue;
        }
        try {
          const stt = (
            await groupService.addUser({
              userId,
              groupId,
              type,
              roleId,
            })
          ).statusCode;
          if (stt === 300) {
            message =
              'An error occurred during add ' +
              userId +
              ' to group ' +
              groupId +
              ' process';
            logs.push(message);
            continue;
          }
        } catch {
          message =
            'An error occurred during add ' +
            userId +
            ' to group ' +
            groupId +
            ' process';
          logs.push(message);
          continue;
        }
      }

      objAccount._id = userId;
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
      let account = await Account.findById({ _id: data._id });
      //check profile && account
      if (account) {
        account.isDelete = true;
        account.deletedDate = moment().format('YYYY-MM-DD HH:mm:ss');
        try {
          await account.save();
        } catch {
          message = 'An error occurred during delete account at ' + data._id;
          logs.push(message);
          continue;
        }
      } else {
        message = data._id + ' does not exists';
        logs.push(message);
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
  let { _id } = body || {};
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
  let { AccountId } = body || {};
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
    const res = await Profile.findById({ _id: AccountId });
    if (res) {
      await Profile.findOneAndUpdate({ _id: AccountId }, body);
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
  changePassword,
};
