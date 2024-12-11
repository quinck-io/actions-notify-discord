import fs from 'fs'
import { sendDiscordWebhook } from './discord'
import { actionInputSchema, eventSchema } from './schemas'


const work = async () => {
    const input = actionInputSchema.parse(process.env)
    const event = eventSchema.parse(JSON.parse(fs.readFileSync(input.eventPath, 'utf8')))

    await sendDiscordWebhook({
        ...input,
        event,
    })
}

work()
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
