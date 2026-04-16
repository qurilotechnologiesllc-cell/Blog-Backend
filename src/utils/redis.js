// config/redis.js
const Redis = require('ioredis')

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
})

redis.on('connect', () => console.log('✅ Redis Cloud connected'))
redis.on('error', (err) => console.log('❌ Redis Error:', err))

module.exports = redis