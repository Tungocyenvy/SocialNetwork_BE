const { createToken } = require('./jwt.service');
const bcrypt = require('bcrypt');
const Account = require('../models/account.model');
const Profile = require('../models/profile.model');
const Role = require('../models/role.model');
const { sendSMS } = require('./sms.service');
const groupService = require('./group.service');
const moment = require('moment');

const { map, keyBy } = require('lodash');
const I18n = require('../config/i18n');

const removeVN = (Text) => {
  return Text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};


const getMsg = (req) => {
  let lang = req.headers['accept-language'] || 'en';
  I18n.setLocale(lang);
  return (msg = I18n.__('account'));
};
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
  const msg = getMsg(req);

  // kiểm tra tài khoản tồn tại trong Account chưa
  var data = await Account.findOne({ _id });
  if (data != null) {
    if (data.isDelete) {
      return {
        msg: msg.disabled,
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
            msg: msg.notProfile,
            statusCode: 300,
          };
        }
        //const token = data.Token;
        return {
          msg: msg.login,
          statusCode: 200,
          data: {
            token,
            role: role.nameEn,
            profile,
          },
        };
      } else {
        return {
          msg: msg.incorrect,
          statusCode: 300,
        };
      }
    } catch {
      return {
        msg: msg.err,
        statusCode: 300,
      };
    }
  } else {
    return {
      msg: msg.notFound.replace('%s', _id),
      statusCode: 300,
    };
  }
};

//forgotPassword
const forgotPassword = async (req) => {
  let { _id } = req.body || {};
  const msg = getMsg(req);
  // check account
  var data = await Profile.findById({ _id });
  if (data != null) {
    try {
      var toPhone = data.phone;
      var content = getOTP() + ' is your OTP. Only valid for 3 min!';
      const sendsms = sendSMS(toPhone, content);
      return {
        msg: msg.sms,
        statusCode: 200,
        data: { content },
      };
    } catch {
      return {
        msg: msg.err,
        statusCode: 300,
      };
    }
  } else {
    return {
      msg: msg.notFound.replace('%s', _id),
      statusCode: 300,
    };
  }
};

// Reset Password
//when forgot password
const resetPassword = async (req) => {
  let { userId, password, confirmPassword } = req.body || {};
  const msg = getMsg(req);

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
            msg: msg.resetPass,
            statusCode: 200,
          };
        } else {
          return {
            msg: msg.err,
            statusCode: 300,
          };
        }
      } else {
        return {
          msg: msg.incorrectConfirm,
          statusCode: 300,
        };
      }
    } else {
      return {
        msg: msg.notFound.replace('%s', userId),
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

// Change Password
const changePassword = async (userID, req) => {
  let { password, newPassword, confirmPassword } = req.body || {};
  const msg = getMsg(req);

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
              msg: msg.changePass,
              statusCode: 200,
            };
          } else {
            return {
              msg: msg.incorrectConfirm,
              statusCode: 300,
            };
          }
        } else {
          return {
            msg: msg.incorrectConfirm,
            statusCode: 300,
          };
        }
      } else {
        return {
          msg: msg.incorrectPass,
          statusCode: 300,
        };
      }
    } else {
      return {
        msg: msg.notFound.replace('%s', userID),
        statusCode: 300,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

// Sign up both excel and handle
const signup = async (req) => {
  let body = req.body || {};
  const msg = getMsg(req);
  try {
    let logs = [];
    let accountData = {};
    let message = '';
    for (var i in body) {
      let objAccount = {};
      let data = body[i];
      let userId = String(data._id);
      const profile = await Profile.findById({ _id: userId });
      const account = await Account.findById({ _id: userId });
      //check profile && account
      if (profile || account) {
        message = msg.exists.replace('%s', userId);
        logs.push({message});
        continue;
      }

      const roleId = Number(data.roleId);

      data.email = userId + '@gmail.com';
      data.dob = new Date(data.dob);
      delete data.roleId;

      let keyword = userId+" "+data.fullname +" "+ removeVN(data.fullname);
      data.keyword= keyword;

      //create Profile
      try {
        await Profile.create(data);
      } catch {
        message = msg.errAddProfile.replace('%s', userId);
        logs.push({message});
        continue;
      }

      /**CREATE ACCOUNT */
      const randomNum = getRandomString();
      const password = userId + '@social' + randomNum;
      const saltOrRound = 8;
      const hassPassword = await bcrypt.hash(password, saltOrRound);
      if (!hassPassword) {
        await Profile.findByIdAndDelete({ _id: userId });
        message = msg.errHashPass.replace('%s', userId);
        logs.push({message});
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
        message = msg.arrAddAccount.replace('%s', userId);
        logs.push({message});
        continue;
      }

      /**ADD MAIN GROUP */
      let groupId = 'grsv';
      if (roleId !== 4) groupId = 'grgv';
      let type = 'main';
      let isAdmin= false;
      for (var k = 0; k < 2; k++) {
        //i=0 add grsv,grgv,
        //i=1 add gr faculity
        if (k === 1) {
          groupId = data.faculty ? data.faculty : {};
        }
        if (!groupId) {
          message = msg.faculty.replace('%s', userId);
          logs.push({message});
          continue;
        }
        try {
          const stt = await groupService.addUser({
            userId,
            groupId,
            type,
            roleId,
          });
          if (stt.statusCode === 300) {
            message = stt.msg; //msg.group.replace('%s', userId).replace('%s', groupId);
            logs.push({message});
            continue;
          }
        } catch {
          message = msg.group.replace('%s', userId).replace('%s', groupId);
          logs.push({message});
          continue;
        }
      }

      objAccount._id = userId;
      objAccount.password = password;
      accountData[i] = objAccount;
    }
    return {
      msg: msg.signup,
      statusCode: 200,
      data: { logs, accountData },
    };
  } catch (err) {
    console.log(err);
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

// delete Account (change isDelete: false->true)
const deleteAccount = async (req) => {
  let body = req.body || {};
  const msg = getMsg(req);
  try {
    let logs = [];
    let message = '';
    for (var i in body) {
      let data = body[i];
      const account = await Account.findById({ _id: data._id });
      //check profile && account
      if (account) {
        let result ={...account._doc,deletedDate:moment().toDate()};
        result.isDelete = true;
        try {
          await Account.findOneAndUpdate({ _id: data._id },result);
        } catch {
          message = msg.errDelete.replace('%s', data._id);
          logs.push(message);
          continue;
        }
      } else {
        message = msg.notFound.replace('%s', data._id);
        logs.push(message);
        continue;
      }
    }
    return {
      msg: msg.delete,
      statusCode: 200,
      data: { logs },
    };
  } catch (err) {
    console.log(err);
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

// recovery Account (change isDelete: true->false)
const recoveryAccount = async (req) => {
  let { _id } = req.body || {};
  const msg = getMsg(req);
  try {
    const account = await Account.findById(_id);
    //check profile && account
    if (account) {
      account.isDelete = false;
      await account.save();
      return {
        msg: msg.recovery,
        statusCode: 200,
        data: account,
      };
    } else {
      return {
        msg: msg.notFound.replace('%s', _id),
        statusCode: 200,
        data: account,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//**PROFILE */
//get Infor User
const getProfile = async (AccountId, req) => {
  const msg = getMsg(req);
  try {
    const data = await Profile.findById({ _id: AccountId });
    if (!data) {
      return {
        msg: msg.notFound.replace('%s', AccountId),
        statusCode: 300,
      };
    } else {
      return {
        msg: msg.getProfile,
        statusCode: 200,
        data: data,
      };
    }
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const updateProfile = async (AccountId, req) => {
  let body = req.body || {};
  const msg = getMsg(req);
  try {
    if(body._id)
    {
      AccountId=body._id;
    }
    const res = await Profile.findById({ _id: AccountId });
    if (res) {
      await Profile.findOneAndUpdate({ _id: AccountId }, body);
      return {
        msg: msg.updateProfile,
        statusCode: 200,
        data: res,
      };
    } else {
      return {
        msg: msg.notFound.replace('%s', AccountId ),
        statusCode: 300,
      };
    }
  } catch (err) {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

const getListAccount = async (req) => {
  let perPage = 10;
  const msg = getMsg(req);
  let {
    roleId = 4,
    faculty = 'grsv',
    page = 1,
    isDelete = false,
  } = req.query || {};

  try {
    const listAccount = await Account.find({
      roleId: roleId,
      isDelete: isDelete,
    });
    if (listAccount <= 0) {
      return {
        msg: msg.notHaveAccount,
        statusCode: 200,
        data: [],
      };
    }
    const userIds = map(listAccount, '_id');
    const total = await Profile.countDocuments({
      _id: { $in: userIds },
      faculty: faculty,
    });
    if (total <= 0) {
      return {
        msg: msg.notHaveAccount,
        statusCode: 200,
        data: [],
      };
    }
    const profile = await Profile.find({
      _id: {
        $in: userIds,
      },
      faculty: faculty,
    })
      .skip(perPage * page - perPage)
      .limit(perPage);

    return {
      msg: msg.getListAccount,
      statusCode: 200,
      data: { profile, total },
    };
  } catch {
    return {
      msg: msg.err,
      statusCode: 300,
    };
  }
};

//for change phone
const verifyPhoneNumber = async (req) => {
  let { _id } = req.body || {};
  const msg = getMsg(req);
  // check account
  var data = await Profile.findById({ _id });
  if (data != null) {
    try {
      var toPhone = data.phone;
      var content = getOTP();
      const sendsms = sendSMS(toPhone, content);
      return {
        msg: msg.sms,
        statusCode: 200,
        data: { content },
      };
    } catch {
      return {
        msg: msg.err,
        statusCode: 300,
      };
    }
  } else {
    return {
      msg: msg.notFound.replace('%s', _id),
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
  changePassword,
  getListAccount,
  verifyPhoneNumber
};
