import { DiscordNotificationParams, Embed, Field } from './schemas'
import { GitEvent } from './schemas/git'
import {
    failureIcons,
    failureMessages,
    getColor,
    getStatusInfo,
    makePayloadField,
    successIcons,
    successMessages,
} from './utils'

const getFooterText = (params: DiscordNotificationParams) => {
    const { event } = params
    if (!event?.head_commit) return undefined
    return `
Commit: ${event.head_commit.timestamp}
Message: ${event.head_commit.message}
Hash: ${event.head_commit.id.slice(0, 7)}
`
}

const getSonarFields = (params: DiscordNotificationParams): Field[] => {
    const { sonarUrl, sonarProjectKey, sonarQualityGateStatus } = params

    const sonarUrlComputed = (() => {
        if (sonarUrl) {
            return sonarUrl
        }
        if (sonarProjectKey) {
            const branch = getBranch(params.event)
            return `https://sonarcloud.io/summary/new_code?id=${sonarProjectKey}&branch=${branch}`
        }
    })()

    const sonarMessage: Field[] = []
    if (sonarUrlComputed) {
        const sonarUrlField = makePayloadField('SonarCloud', sonarUrlComputed)
        sonarMessage.push(sonarUrlField)
    }
    if (sonarQualityGateStatus)
        sonarMessage.push(makePayloadField('Quality Gate', `*${sonarQualityGateStatus.toUpperCase()}*`))

    if (sonarMessage.length <= 0) return []

    return sonarMessage
}

const getBranch = (event: GitEvent): string => {
    if (event.pull_request) return event.pull_request.head.ref
    return event.ref!
}

export async function sendDiscordWebhook(params: DiscordNotificationParams): Promise<void> {
    const { webhookUrl, status, projectName, event } = params

    const author = event.sender.login
    const branch = getBranch(event)

    const { statusIcon, statusMessage } =
        status === 'success'
            ? getStatusInfo(successIcons, successMessages(author))
            : getStatusInfo(failureIcons, failureMessages(author))

    const sonarFields = getSonarFields(params)

    const jobField = makePayloadField('Status', `${statusIcon} ${params.status.toUpperCase()}`, true)
    const workflowField = makePayloadField('Workflow', `${params.workflow}: ${params.failedJob ?? params.job}`, true)
    const statusField = makePayloadField('Status', statusMessage)

    const fields: Field[] = [jobField, workflowField, ...sonarFields, statusField]

    if (params.testResultsUrl) fields.push(makePayloadField('Test Results', `[View Results](${params.testResultsUrl})`))

    const footerText = getFooterText(params)

    const embed: Embed = {
        title: `${projectName} branch: ${branch}`,
        author: { name: author },
        url: `${params.serverUrl}/${params.repository}/actions/runs/${params.runId}`,
        color: getColor(status),
        fields,
    }

    if (footerText) embed['footer'] = { text: footerText }

    const body = JSON.stringify({
        username: 'Github actions',
        avatar_url: params.avatarUrl,
        embeds: [embed],
    })

    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    })
}
