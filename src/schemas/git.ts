import { z } from 'zod'

const userSchema = z.object({
    avatar_url: z.string().optional(),
    login: z.string(),
    url: z.url(),
})

const pullHeadSchema = z.object({
    label: z.string(),
    ref: z.string(),
    sha: z.string(),
})

const pullRequestSchema = z.object({
    head: pullHeadSchema,
})

const commitSchema = z.object({
    id: z.string(),
    message: z.string(),
    url: z.string(),
    // GitHub sends the timestamp with the committer UTC offset.
    timestamp: z.iso.datetime({ offset: true }),
})

export const eventSchema = z.object({
    head_commit: commitSchema.optional(),
    // All commits of the push, oldest first. GitHub caps the array at 20.
    // Absent on pull_request events, empty on some force pushes.
    commits: z.array(commitSchema).optional(),
    pull_request: pullRequestSchema.optional(),
    sender: userSchema,
    ref: z
        .string()
        .optional()
        .transform(str => str?.replace('refs/heads/', '')),
})

export type GitEvent = z.infer<typeof eventSchema>
export type Commit = z.infer<typeof commitSchema>
