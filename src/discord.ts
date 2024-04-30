import { failureIcons, failureMessages, getColor, getStatusInfo, successIcons, successMessages } from './utils'

export type DiscordNotificationParams = {
    webhookUrl: string
    status: string
    projectName: string
    refName: string
    testResultsUrl?: string
    event?: {
        head_commit?: {
            author: { name: string }
            timestamp: string
            message: string
            id: string
        }
    }
    sonarProjectKey?: string
    sonarQualityGateStatus?: string
    avatarUrl?: string
    username?: string
}

const getFooterText = (params: DiscordNotificationParams) => {
    const { event } = params
    if (!event?.head_commit) return undefined
    return `
Commit: ${event.head_commit.timestamp}
Message: ${event.head_commit.message}
Hash: ${event.head_commit.id.slice(0, 7)}
`
}

const getTestMessage = (params: DiscordNotificationParams) => {
    if (!params.testResultsUrl) return undefined
    return `Test Results: [View Results](${params.testResultsUrl})`
}

const getSonarMessage = (params: DiscordNotificationParams) => {
    const { sonarProjectKey, sonarQualityGateStatus, refName } = params

    const sonarMessage: string[] = []
    if (sonarProjectKey) {
        const sonarUrl = `https://sonarcloud.io/summary/new_code?id=${sonarProjectKey}&branch=${refName}`
        sonarMessage.push(`SonarCloud: [View Report](${sonarUrl})`)
    }
    if (sonarQualityGateStatus) sonarMessage.push(`Quality Gate: *${sonarQualityGateStatus}*`)

    if (sonarMessage.length <= 0) return undefined

    return sonarMessage.join('\n')
}

const getJobStatusMessage = (params: DiscordNotificationParams, statusIcon: string) => `
${statusIcon} Status: *${params.status.toUpperCase()}*
${process.env.GITHUB_WORKFLOW}: ${process.env.GITHUB_JOB}`

/**
 * Send a Discord webhook.
 */
export async function sendDiscordWebhook(params: DiscordNotificationParams): Promise<void> {
    const { webhookUrl, status, projectName, refName, event } = params

    const author = event?.head_commit?.author?.name ?? 'Unknown'

    const { statusIcon, statusMessage } =
        status === 'success'
            ? getStatusInfo(successIcons, successMessages(author))
            : getStatusInfo(failureIcons, failureMessages(author))

    const jobStatusMessage = getJobStatusMessage(params, statusIcon)
    const testMessage = getTestMessage(params)
    const sonarMessage = getSonarMessage(params)

    const descs = [jobStatusMessage, sonarMessage, testMessage, statusMessage]

    const embedDescription = descs.filter(desc => desc !== undefined).join('\n\n')

    const footerText = getFooterText(params)

    const embed = {
        title: `${projectName}/${refName}`,
        url: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
        description: embedDescription,
        color: getColor(status),
    }

    if (footerText) embed['footer'] = { text: footerText }

    const username = params.username ?? 'GitHub Actions'
    const avatar_url = params.avatarUrl ?? 'https://cdn-icons-png.flaticon.com/512/25/25231.png'

    const body = JSON.stringify({
        username,
        avatar_url,
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
