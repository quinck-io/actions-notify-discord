import fs from 'fs'
import { sendDiscordWebhook } from './discord'

const required = <T extends Record<string, unknown>>(obj: T): Required<T> => {
    Object.entries(obj).forEach(([key, value]) => {
        if (!value) throw new Error(`Required parameter ${key} is not set.`)
    })
    return obj as Required<T>
}

const webhookUrl = process.env.INPUT_WEBHOOKURL
const status = process.env.INPUT_STATUS
const projectName = process.env.INPUT_PROJECTNAME
const testResultsUrl = process.env.INPUT_TESTRESULTSURL
const failedJob = process.env.INPUT_FAILEDJOB
const sonarProjectKey = process.env.INPUT_SONARPROJECTKEY
const sonarQualityGateStatus = process.env.INPUT_SONARQUALITYGATESTATUS
const eventPath = process.env.GITHUB_EVENT_PATH
const refName = process.env.GITHUB_REF_NAME
const avatarUrl = process.env.INPUT_AVATARURL
const username = process.env.INPUT_USERNAME

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
        sonarProjectKey,
        sonarQualityGateStatus,
        avatarUrl,
        username,
        failedJob
    })
}

work().catch(err => {
    console.error(err)
    process.exit(1)
})
