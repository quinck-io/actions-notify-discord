import fs from 'fs'
import { sendDiscordWebhook } from './discord'
import { actionInputSchema } from './schemas'
import { eventSchema } from './schemas/git'


const work = async () => {
    const input = actionInputSchema.parse(process.env)
    const rawEvent = fs.readFileSync(input.eventPath, 'utf8')
    console.log('rawEvent', rawEvent)
    const event = eventSchema.parse(JSON.parse(rawEvent))

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
