import { fitFields, parseFields } from './fields'
import type { DiscordNotificationParams, Embed } from './schemas'
import type { GitEvent } from './schemas/git'
import { formatCommitLines, getColor, getStatusIcon, makeDescription, selectCommits } from './utils'

const getBranch = (event: GitEvent): string => {
    if (event.pull_request) return event.pull_request.head.ref
    return event.ref ?? ''
}

export async function sendDiscordWebhook(params: DiscordNotificationParams): Promise<void> {
    const { webhookUrl, status, projectName, event } = params

    const author = event.sender.login
    const branch = getBranch(event)

    const commits = selectCommits(event, { onlyHead: params.onlyHeadCommit, order: params.commitOrder })
    const header = `**${params.workflow}: ${params.failedJob ?? params.job}** — ${status.toUpperCase()} ${getStatusIcon(status)}`

    const embed: Embed = {
        title: `${projectName} branch: ${branch}`,
        author: { name: author },
        url: `${params.serverUrl}/${params.repository}/actions/runs/${params.runId}`,
        color: getColor(status),
        description: makeDescription(header, formatCommitLines(commits, { showDates: params.showCommitDates })),
    }
    embed.fields = fitFields(embed, parseFields(params.fields, { inline: params.inlineFields }))

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
