import type { DiscordNotificationParams, Embed, Field } from './schemas'
import type { GitEvent } from './schemas/git'
import { formatCommitLines, getColor, getStatusIcon, makeDescription, makePayloadField, selectCommits } from './utils'

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
        return undefined
    })()

    const sonarMessage: Field[] = []
    if (sonarUrlComputed) {
        const sonarUrlField = makePayloadField('SonarCloud', sonarUrlComputed)
        sonarMessage.push(sonarUrlField)
    }
    if (sonarQualityGateStatus)
        sonarMessage.push(makePayloadField('Quality Gate', `*${sonarQualityGateStatus.toUpperCase()}*`))

    return sonarMessage
}

const getBranch = (event: GitEvent): string => {
    if (event.pull_request) return event.pull_request.head.ref
    return event.ref ?? ''
}

export async function sendDiscordWebhook(params: DiscordNotificationParams): Promise<void> {
    const { webhookUrl, status, projectName, event } = params

    const author = event.sender.login
    const branch = getBranch(event)

    const fields: Field[] = [...getSonarFields(params)]

    if (params.testResultsUrl) fields.push(makePayloadField('Test Results', `[View Results](${params.testResultsUrl})`))

    const commits = selectCommits(event, { onlyHead: params.onlyHeadCommit, order: params.commitOrder })
    const header = `**${params.workflow}: ${params.failedJob ?? params.job}** — ${status.toUpperCase()} ${getStatusIcon(status)}`

    const embed: Embed = {
        title: `${projectName} branch: ${branch}`,
        author: { name: author },
        url: `${params.serverUrl}/${params.repository}/actions/runs/${params.runId}`,
        color: getColor(status),
        description: makeDescription(header, formatCommitLines(commits, { showDates: params.showCommitDates })),
        fields,
    }

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
    })
}
