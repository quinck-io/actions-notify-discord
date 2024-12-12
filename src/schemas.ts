import { z } from 'zod'

const inputSchema = z.object({
    INPUT_WEBHOOKURL: z.string(),
    INPUT_STATUS: z.enum(['failure', 'success', 'skipped']),
    INPUT_PROJECTNAME: z.string(),
    INPUT_TESTRESULTSURL: z.string().optional(),
    INPUT_FAILEDJOB: z.string().optional(),
    INPUT_SONARPROJECTKEY: z.string().optional(),
    INPUT_SONARQUALITYGATESTATUS: z.string().optional(),
    INPUT_AVATARURL: z.string().optional().default('https://cdn-icons-png.flaticon.com/512/25/25231.png'),
    INPUT_USERNAME: z.string().optional().default('Github Action')
})

const envSchema = z.object({
    GITHUB_EVENT_PATH: z.string(),
    GITHUB_REF_NAME: z.string(),
    GITHUB_JOB: z.string(),
    GITHUB_WORKFLOW: z.string(),
    GITHUB_REPOSITORY: z.string(),
    GITHUB_SERVER_URL: z.string(),
    GITHUB_RUN_ID: z.string(),
})

export const eventSchema = z.object({
    head_commit: z.object({
        author: z.object({ name: z.string().default('Unknown') }),
        timestamp: z.string(),
        message: z.string(),
        id: z.string(),
    }).optional()
}).optional()

const fieldSchema = z.object({
    name: z.string(),
    value: z.string(),
    inline: z.boolean().default(false)
})

export type Field = z.infer<typeof fieldSchema>

const embedSchema = z.object({
    author: z.object({
        name: z.string().optional(),
        url: z.string().url().optional(),
        icon_url: z.string().url().optional(),
    }).optional(),
    title: z.string().optional(),
    url: z.string().url().optional(),
    description: z.string().optional(),
    color: z.number().optional(),
    fields: z.array(fieldSchema).optional(),
    thumbnail: z.object({
        url: z.string().url().optional(),
    }).optional(),
    image: z.object({
        url: z.string().url().optional(),
    }).optional(),
    footer: z.object({
        text: z.string(),
        icon_url: z.string().url().optional(),
    }).optional()
})

export type Embed = z.infer<typeof embedSchema>

export const actionInputSchema = inputSchema.merge(envSchema)
    .transform((input) => ({
        webhookUrl: input.INPUT_WEBHOOKURL,
        status: input.INPUT_STATUS,
        projectName: input.INPUT_PROJECTNAME,
        testResultsUrl: input.INPUT_TESTRESULTSURL,
        failedJob: input.INPUT_FAILEDJOB,
        sonarProjectKey: input.INPUT_SONARPROJECTKEY,
        sonarQualityGateStatus: input.INPUT_SONARQUALITYGATESTATUS,
        avatarUrl: input.INPUT_AVATARURL,
        username: input.INPUT_USERNAME,
        eventPath: input.GITHUB_EVENT_PATH,
        refName: input.GITHUB_REF_NAME,
        job: input.GITHUB_JOB,
        workflow: input.GITHUB_WORKFLOW,
        repository: input.GITHUB_REPOSITORY,
        serverUrl: input.GITHUB_SERVER_URL,
        runId: input.GITHUB_RUN_ID,
    }))


export type ActionInput = z.infer<typeof actionInputSchema>
export type GitEvent = z.infer<typeof eventSchema>

export type DiscordNotificationParams = ActionInput & {
    event: GitEvent
}