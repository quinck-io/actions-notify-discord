import { z } from 'zod'

import type { GitEvent } from './schemas/git'

const DEFAULT_USERNAME = 'Github Action'
const DEFAULT_AVATARURL = 'https://cdn-icons-png.flaticon.com/512/25/25231.png'

const workflowStatusSchema = z.enum(['failure', 'success', 'skipped', 'cancelled'])
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>

/**
 * A single entry of the GitHub `needs` context. Only `result` matters to us;
 * `outputs`/`outcome` are ignored via the loose object.
 */
const needSchema = z.looseObject({
    result: workflowStatusSchema,
})

/**
 * The `needs` input, passed by the caller as `${{ toJson(needs) }}`.
 * Shape: `{ "<jobId>": { "result": "success" | ... }, ... }`.
 */
const needsSchema = z
    .string()
    .transform((raw, ctx) => {
        try {
            return JSON.parse(raw) as unknown
        } catch {
            ctx.addIssue({
                code: 'custom',
                message: 'The `needs` input must be valid JSON, pass `${{ toJson(needs) }}`.',
            })
            return z.NEVER
        }
    })
    .pipe(z.record(z.string(), needSchema))

export type Needs = z.infer<typeof needsSchema>

/** A boolean action input: the strings 'true'/'false', empty or absent means false. */
const booleanInput = z
    .enum(['true', 'false', ''])
    .optional()
    .default('false')
    .transform(value => value === 'true')

/** The order of the commit list, empty or absent means newest first. */
const commitOrderInput = z
    .enum(['newest-first', 'oldest-first', ''])
    .optional()
    .default('newest-first')
    .transform(value => (value === '' ? 'newest-first' : value))

export type CommitOrder = z.infer<typeof commitOrderInput>

const inputSchema = z.object({
    INPUT_WEBHOOKURL: z.string(),
    INPUT_PROJECTNAME: z.string(),
    INPUT_NEEDS: needsSchema,
    INPUT_TESTRESULTSURL: z.string().optional(),
    INPUT_ONLYHEADCOMMIT: booleanInput,
    INPUT_COMMITORDER: commitOrderInput,
    INPUT_SHOWCOMMITDATES: booleanInput,
    INPUT_SONARPROJECTKEY: z.string().optional(),
    INPUT_SONARURL: z.string().optional(),
    INPUT_SONARQUALITYGATESTATUS: z.string().optional(),
    INPUT_AVATARURL: z
        .string()
        .optional()
        .default(DEFAULT_AVATARURL)
        .transform(avatarUrl => (avatarUrl === '' ? DEFAULT_AVATARURL : avatarUrl)),
    INPUT_USERNAME: z
        .string()
        .optional()
        .default(DEFAULT_USERNAME)
        .transform(username => (username === '' ? DEFAULT_USERNAME : username)),
})

const envSchema = z.object({
    GITHUB_EVENT_PATH: z.string(),
    GITHUB_JOB: z.string(),
    GITHUB_WORKFLOW: z.string(),
    GITHUB_REPOSITORY: z.string(),
    GITHUB_SERVER_URL: z.string(),
    GITHUB_RUN_ID: z.string(),
})

const fieldSchema = z.object({
    name: z.string(),
    value: z.string(),
    inline: z.boolean().default(false),
})

export type Field = z.infer<typeof fieldSchema>

const embedSchema = z.object({
    author: z
        .object({
            name: z.string().optional(),
            url: z.url().optional(),
            icon_url: z.url().optional(),
        })
        .optional(),
    title: z.string().optional(),
    url: z.url().optional(),
    description: z.string().optional(),
    color: z.number().optional(),
    fields: z.array(fieldSchema).optional(),
    thumbnail: z
        .object({
            url: z.url().optional(),
        })
        .optional(),
    image: z
        .object({
            url: z.url().optional(),
        })
        .optional(),
    footer: z
        .object({
            text: z.string(),
            icon_url: z.url().optional(),
        })
        .optional(),
})

export type Embed = z.infer<typeof embedSchema>

export const actionInputSchema = inputSchema.extend(envSchema.shape).transform(input => ({
    webhookUrl: input.INPUT_WEBHOOKURL,
    projectName: input.INPUT_PROJECTNAME,
    needs: input.INPUT_NEEDS,
    testResultsUrl: input.INPUT_TESTRESULTSURL,
    onlyHeadCommit: input.INPUT_ONLYHEADCOMMIT,
    commitOrder: input.INPUT_COMMITORDER,
    showCommitDates: input.INPUT_SHOWCOMMITDATES,
    avatarUrl: input.INPUT_AVATARURL,
    username: input.INPUT_USERNAME,
    eventPath: input.GITHUB_EVENT_PATH,
    job: input.GITHUB_JOB,
    workflow: input.GITHUB_WORKFLOW,
    repository: input.GITHUB_REPOSITORY,
    serverUrl: input.GITHUB_SERVER_URL,
    runId: input.GITHUB_RUN_ID,

    // Sonar
    sonarUrl: input.INPUT_SONARURL,
    sonarProjectKey: input.INPUT_SONARPROJECTKEY,
    sonarQualityGateStatus: input.INPUT_SONARQUALITYGATESTATUS,
}))

type ActionInput = z.infer<typeof actionInputSchema>

export type DiscordNotificationParams = ActionInput & {
    event: GitEvent
    /** Overall status derived from `needs`. */
    status: WorkflowStatus
    /** Comma-separated list of failed jobs, or `undefined` when none failed. */
    failedJob?: string
}
