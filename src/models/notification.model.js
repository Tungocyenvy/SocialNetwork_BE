const mongoose = require('mongoose');

const schema = mongoose.Schema;

const NotifySchema = new schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  templateId: { type: String, required: true },
  groupId:{ type: String, required: true },
  postId: { type: String, required: true },
  commentId: { type: String,default:null },
  replyId: { type: String,default:null},
  isRead: { type: Boolean,default:false },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}).index({senderId:1,receiverId:1,postId:1,templateId:1});

const notify = mongoose.model('notification', NotifySchema);
module.exports = notify;
