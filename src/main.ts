import fs from 'fs'
import { sendDiscordWebhook } from './discord'
import { actionInputSchema } from './schemas'
import { eventSchema } from './schemas/git'
import { aggregateStatus, getFailedJobs } from './utils'


const work = async () => {
    const input = actionInputSchema.parse(process.env)
    const rawEvent = fs.readFileSync(input.eventPath, 'utf8')
    console.log('rawEvent', rawEvent)
    const event = eventSchema.parse(JSON.parse(rawEvent))

    const status = aggregateStatus(input.needs)
    const failedJobs = getFailedJobs(input.needs)

    await sendDiscordWebhook({
        ...input,
        event,
        status,
        failedJob: failedJobs.length > 0 ? failedJobs.join(', ') : undefined,
    })
}

work()
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
