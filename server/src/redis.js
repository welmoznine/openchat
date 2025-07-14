import {createClient} from 'redis'

const pub = createClient()
const sub = createClient()

await pub.connect()
await sub.connect()
console.log('Redis clients connected')

export { pub, sub }