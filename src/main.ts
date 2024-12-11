import fs from 'fs'
import { sendDiscordWebhook } from './discord'
import { getInputFromEnv } from './input'

const work = async () => {
    const input = getInputFromEnv()
    const event = JSON.parse(fs.readFileSync(input.eventPath, 'utf8'))

    console.log('debug input', JSON.stringify(input))
    console.log('debug event', JSON.stringify(event))

    await sendDiscordWebhook({
        ...input,
        event,
    })
}

work().catch(err => {
    console.error(err)
    process.exit(1)
})
