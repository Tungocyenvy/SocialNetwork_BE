const cron = require('node-cron');

/**
 * 1.Delete account
 * 2.Delete profile
 * 3.Delete in group (sub/main)
 * 4.delete post
 * 5. delete comment
 * 6.delete reply
 * 7.delete msg->conversation->participant 
 */
// cron.schedule('* * 0/1  * * *', () => {
//   });