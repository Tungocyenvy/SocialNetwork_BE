const mongoose = require('mongoose');

async function connectDb() {
  try {
    await mongoose.connect(process.env.URI_ACCESS_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('connect successfully!');
  } catch (error) {
    console.log('connect failed!');
  }
}

module.exports = { connectDb };
