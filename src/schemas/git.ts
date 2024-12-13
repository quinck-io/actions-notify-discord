import { z } from 'zod'

const userSchema = z.object({
    avatar_url: z.string().optional(),
    login: z.string(),
    url: z.string().url()
})

const pullHeadSchema = z.object({
    label: z.string(),
    ref: z.string(),
    sha: z.string()
})

const pullRequestSchema = z.object({
    head: pullHeadSchema
})


const headCommitSchema = z.object({
    timestamp: z.string(),
    message: z.string(),
    id: z.string(),
})

export const eventSchema = z.object({
    head_commit: headCommitSchema.optional(),
    pull_request: pullRequestSchema.optional(),
    sender: userSchema,
    ref: z.string().optional().transform(str => str?.replace('refs/heads/', ''))
})


export type GitEvent = z.infer<typeof eventSchema>