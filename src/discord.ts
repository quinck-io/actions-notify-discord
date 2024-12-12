
import { DiscordNotificationParams, Embed, Field } from './schemas'
import { failureIcons, failureMessages, getColor, getStatusInfo, makePayloadField, successIcons, successMessages } from './utils'

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
    const { sonarProjectKey, sonarQualityGateStatus, refName } = params

    const sonarMessage: Field[] = []
    if (sonarProjectKey) {
        const sonarUrl = `https://sonarcloud.io/summary/new_code?id=${sonarProjectKey}&branch=${refName}`
        const sonarUrlField = makePayloadField('SonarCloud', sonarUrl)
        sonarMessage.push(sonarUrlField)
    }
    if (sonarQualityGateStatus) sonarMessage.push(makePayloadField('Quality Gate', `*${sonarQualityGateStatus.toUpperCase()}*`))

    if (sonarMessage.length <= 0) return []

    return sonarMessage
}


export async function sendDiscordWebhook(params: DiscordNotificationParams): Promise<void> {
    const { webhookUrl, status, projectName, refName, event } = params

    console.log('params', params)

    const author = event?.head_commit?.author?.name ?? 'Unknown'

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
        title: `${projectName}/${refName}`,
        author: { name: params.username },
        url: `${params.serverUrl}/${params.repository}/actions/runs/${params.runId}`,
        color: getColor(status),
        fields
    }


    console.log('embed', embed)

    if (footerText) embed['footer'] = { text: footerText }

    const body = JSON.stringify({
        username: params.username,
        avatar_url: params.avatarUrl,
        embeds: [embed],
    })

    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    }).then(r => r.json())
        .then(console.log)
}
