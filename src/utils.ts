import { match } from 'ts-pattern'

import type { CommitOrder, Field, Needs, WorkflowStatus } from './schemas'
import type { Commit, GitEvent } from './schemas/git'

/**
 * Derive the overall workflow status from the `needs` context.
 *
 * `skipped` is treated as neutral: jobs gated off by event/branch skip by
 * design and must not downgrade an otherwise green run. This mirrors how
 * GitHub itself concludes a run: green when every job either succeeded or
 * was skipped, only `failure`/`cancelled` pull it down.
 */
export const aggregateStatus = (needs: Needs): WorkflowStatus => {
    const results = new Set(Object.values(needs).map(job => job.result))
    if (results.has('failure')) return 'failure'
    if (results.has('cancelled')) return 'cancelled'
    return 'success'
}

/**
 * List the ids of the jobs that failed, in declaration order.
 */
export const getFailedJobs = (needs: Needs): string[] =>
    Object.entries(needs)
        .filter(([, job]) => job.result === 'failure')
        .map(([jobId]) => jobId)

// Discord caps the embed description at 4096 characters. Keep a margin.
const MAX_COMMIT_LIST_LENGTH = 3500
const MAX_COMMIT_LINE_LENGTH = 100

export type CommitSelectionOptions = {
    /** Keep only the head commit instead of the full push. */
    onlyHead: boolean
    /** Order of the list, `newest-first` or `oldest-first`. */
    order: CommitOrder
}

/**
 * Select the commits to show.
 * Falls back to `head_commit` when the push has no commit array (force push).
 * Returns an empty list on pull request events.
 */
export const selectCommits = (event: GitEvent, options: CommitSelectionOptions): Commit[] => {
    const newestFirst = (event.commits ?? []).toReversed()
    if (newestFirst.length === 0) return event.head_commit ? [event.head_commit] : []
    const selected = options.onlyHead ? newestFirst.slice(0, 1) : newestFirst
    return options.order === 'oldest-first' ? selected.toReversed() : selected
}

export type CommitListOptions = {
    /** Add the ISO date of each commit to its line. */
    showDates: boolean
}

/**
 * Format commits under a bold "Commits" header, one markdown line per commit:
 * linked short hash, optional ISO date, and the first line of the message.
 * Lines that pass the Discord description cap are dropped and counted.
 */
export const formatCommitList = (commits: Commit[], options: CommitListOptions): string => {
    const lines = commits.map(commit => {
        const firstLine = commit.message.split('\n')[0] ?? ''
        const message =
            firstLine.length > MAX_COMMIT_LINE_LENGTH ? `${firstLine.slice(0, MAX_COMMIT_LINE_LENGTH)}…` : firstLine
        const date = options.showDates ? ` \`${commit.timestamp.slice(0, 10)}\`` : ''
        return `[\`${commit.id.slice(0, 7)}\`](${commit.url})${date} ${message}`
    })

    const kept: string[] = []
    let length = 0
    for (const line of lines) {
        if (length + line.length + 1 > MAX_COMMIT_LIST_LENGTH) break
        kept.push(line)
        length += line.length + 1
    }

    const dropped = lines.length - kept.length
    if (dropped > 0) kept.push(`…and ${dropped} more commits`)

    if (kept.length === 0) return ''
    return ['**Commits**', ...kept].join('\n')
}

/**
 * Fixed status icon, used by the default message format.
 */
export const getStatusIcon = (status: WorkflowStatus): string =>
    match(status)
        .with('success', () => ':white_check_mark:')
        .with('failure', () => ':x:')
        .with('cancelled', () => ':no_entry_sign:')
        .with('skipped', () => ':fast_forward:')
        .exhaustive()

/**
 * Get the color for the embed
 */
export const getColor = (status: WorkflowStatus): number =>
    match(status)
        .with('success', () => 3066993) // green
        .with('failure', () => 15158332) // red
        .with('cancelled', () => 16753920) // orange
        .with('skipped', () => 10197915) // light gray
        .exhaustive()

/**
 * Make a field for webhook payload
 * @param title title of the field
 * @param description description
 * @returns a Field which is sendable to discord
 */
export const makePayloadField = (title: string, description: string, inline: boolean = false): Field => {
    return { name: title, value: description, inline }
}
