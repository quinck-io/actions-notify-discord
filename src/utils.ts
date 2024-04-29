export const successIcons = [
    ':unicorn:',
    ':man_dancing:',
    ':ghost:',
    ':dancer:',
    ':scream_cat:',
]

export const failureIcons = [
    ':fire:',
    'dizzy_face',
    ':man_facepalming:',
    ':poop:',
    ':skull:',
]

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
 * Get a random status icon and message
 */
export const getStatusInfo = (icons: string[], messages: string[]) => ({
    statusIcon: icons[Math.floor(Math.random() * icons.length)],
    statusMessage: messages[Math.floor(Math.random() * messages.length)],
})

/**
 * Get the color for the embed
 */
export const getColor = (status: string): number => {
    switch (status) {
        case 'success':
            return 3066993 // green
        case 'failure':
            return 15158332 // red
        default:
            return 0 // white
    }
}
