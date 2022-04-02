const path = require('path');

const { I18n } = require('i18n');

const i18n = new I18n({
  locales: ['en', 'vi'],
  directory: path.join(__dirname, '../i18n'),
});

module.exports = i18n;
