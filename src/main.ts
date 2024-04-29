import fs from 'fs'
import { sendDiscordWebhook } from './discord'

const required = <T extends {}>(obj: T): Required<T> => {
    Object.entries(obj).forEach(([key, value]) => {
        if (!value) throw new Error(`Required parameter ${key} is not set.`)
    })
    return obj as Required<T>
}

const webhookUrl = process.env.INPUT_WEBHOOKURL
const status = process.env.INPUT_STATUS
const projectName = process.env.INPUT_PROJECTNAME
const testResultsUrl = process.env.INPUT_TESTRESULTSURL
const sonarUrl = process.env.INPUT_SONARURL
const sonarQualityGateStatus = process.env.INPUT_SONARQUALITYGATESTATUS
const eventPath = process.env.GITHUB_EVENT_PATH
const refName = process.env.GITHUB_REF_NAME

type RequiredInputs = {
    webhookUrl?: string
    status?: string
    projectName?: string
    eventPath?: string
    refName?: string
}

const reqInputs = required<RequiredInputs>({
    webhookUrl,
    status,
    projectName,
    eventPath,
    refName,
})

const work = async () => {
    const event = JSON.parse(fs.readFileSync(reqInputs.eventPath, 'utf8'))

    await sendDiscordWebhook({
        webhookUrl: reqInputs.webhookUrl,
        status: reqInputs.status,
        projectName: reqInputs.projectName,
        refName: reqInputs.refName,
        event,
        testResultsUrl,
        sonarUrl,
        sonarQualityGateStatus,
    })
}

work().catch(err => {
    console.error(err)
    process.exit(1)
})
