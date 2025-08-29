import { match } from 'ts-pattern'
import { Field, WorkflowStatus } from './schemas'

export const successIcons = [':unicorn:', ':man_dancing:', ':ghost:', ':dancer:', ':scream_cat:']

export const failureIcons = [':fire:', 'dizzy_face', ':man_facepalming:', ':poop:', ':skull:']

export const cancelledIcons = [':stop_sign:', ':warning:', ':construction:', ':x:', ':no_entry_sign:']

export const skippedIcons = [':fast_forward:', ':next_track_button:', ':arrow_right:', ':zzz:', ':sleeping:']

/**
 * Get a random success message
 */
export const successMessages = (author: string) => [
    `:champagne::champagne:Congrats **${author}**, you made it. :sunglasses::champagne::champagne:`,
    `:moyai::moyai:Mah man **${author}**, you made it. :women_with_bunny_ears_partying::moyai::moyai:`,
    `:burrito::burrito:**${author}**, you did well. :women_with_bunny_ears_partying::burrito::burrito:`,
    `:pig::pig: **${author}** You son of a bitch, you did it. :women_with_bunny_ears_partying::pig::pig:`,
    `:ferris_wheel::ferris_wheel:**${author}** You're great.:ferris_wheel::ferris_wheel: `,
]

/**
 * Get a random failures message
 */
export const failureMessages = (author: string) => [
    `:fire::fire:* **${author}**, You're an idiot!*:fire::fire:`,
    `:bomb::bomb:*${author}*, How could this happen?:bomb::bomb:`,
    `:pouting_cat: :pouting_cat: *${author}*, What the hell are you doing?:pouting_cat: :pouting_cat:`,
    `:face_vomiting::face_vomiting:*${author}*, This commit made my mom cry!:face_vomiting::face_vomiting:`,
    `:facepalm::facepalm:${author}, Come on, at least offer a coffee before making such a commit!:facepalm::facepalm:`,
]

/**
 * Get a random cancelled message
 */
export const cancelledMessages = (author: string) => [
    `:stop_sign: **${author}**, the workflow was cancelled.`,
    `:warning: **${author}**, someone stopped the workflow.`,
    `:construction: **${author}**, workflow cancelled - maybe next time!`,
    `:x: **${author}**, workflow was interrupted.`,
    `:no_entry_sign: **${author}**, workflow cancelled before completion.`,
]

/**
 * Get a random skipped message
 */
export const skippedMessages = (author: string) => [
    `:fast_forward: **${author}**, workflow was skipped.`,
    `:next_track_button: **${author}**, skipping this one!`,
    `:arrow_right: **${author}**, workflow skipped - moving on.`,
    `:zzz: **${author}**, workflow took a nap (skipped).`,
    `:sleeping: **${author}**, nothing to do here (skipped).`,
]

/**
 * Get a random status icon and message
 */
export const getStatusInfo = (icons: string[], messages: string[]) => ({
    statusIcon: icons[Math.floor(Math.random() * icons.length)],
    statusMessage: messages[Math.floor(Math.random() * messages.length)],
})

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