
const path = require('path');

module.exports = {
    DEBUG: true,
    PORT: 3000,
    NO_AUTH_REG: /\.log$|\.ico$|_next/,
    API_LOG_PATH: path.resolve(__dirname, '../log'),
    PM2_LOG_PATH: path.resolve(__dirname, '../log/pm2/')
}