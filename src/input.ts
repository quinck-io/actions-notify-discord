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
    INPUT_USERNAME: z.string().optional().default('GitHub Actions'),
})

const envSchema = z.object({
    GITHUB_EVENT_PATH: z.string(),
    GITHUB_REF_NAME: z.string(),
})

const eventSchema = z.object({
    head_commit: z.object({
        author: z.object({ name: z.string() }),
        timestamp: z.string(),
        message: z.string(),
        id: z.string(),
    }).optional()
}).optional()


const actionInputSchema = inputSchema.merge(envSchema)
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
        refName: input.GITHUB_REF_NAME
    }))


export type ActionInput = z.infer<typeof actionInputSchema>
export type GitEvent = z.infer<typeof eventSchema>

export type DiscordNotificationParams = ActionInput & {
    event: GitEvent
}

export const getInputFromEnv = (): ActionInput => {
    return actionInputSchema.parse(process.env)
}

