import { z } from 'zod'
import { GitEvent } from './schemas/git'

const DEFAULT_USERNAME = 'Github Action'
const DEFAULT_AVATARURL = 'https://cdn-icons-png.flaticon.com/512/25/25231.png'

export const workflowStatusSchema = z.enum(['failure', 'success', 'skipped', 'cancelled'])
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>

const inputSchema = z.object({
    INPUT_WEBHOOKURL: z.string(),
    INPUT_STATUS: workflowStatusSchema,
    INPUT_PROJECTNAME: z.string(),
    INPUT_TESTRESULTSURL: z.string().optional(),
    INPUT_FAILEDJOB: z.string().optional(),
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
            url: z.string().url().optional(),
            icon_url: z.string().url().optional(),
        })
        .optional(),
    title: z.string().optional(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    color: z.number().optional(),
    fields: z.array(fieldSchema).optional(),
    thumbnail: z
        .object({
            url: z.string().url().optional(),
        })
        .optional(),
    image: z
        .object({
            url: z.string().url().optional(),
        })
        .optional(),
    footer: z
        .object({
            text: z.string(),
            icon_url: z.string().url().optional(),
        })
        .optional(),
})

export type Embed = z.infer<typeof embedSchema>

export const actionInputSchema = inputSchema.merge(envSchema).transform(input => ({
    webhookUrl: input.INPUT_WEBHOOKURL,
    status: input.INPUT_STATUS,
    projectName: input.INPUT_PROJECTNAME,
    testResultsUrl: input.INPUT_TESTRESULTSURL,
    failedJob: input.INPUT_FAILEDJOB,
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

export type ActionInput = z.infer<typeof actionInputSchema>

export type DiscordNotificationParams = ActionInput & {
    event: GitEvent
}
