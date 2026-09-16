import type { Embed, Field } from './schemas'

// Discord caps an embed at 25 fields, a field name at 256 characters, a field
// value at 1024 and the whole embed (title, description, author, fields) at 6000.
const MAX_FIELDS = 25
const MAX_FIELD_NAME_LENGTH = 256
const MAX_FIELD_VALUE_LENGTH = 1024
const MAX_EMBED_LENGTH = 6000

/**
 * Emit a GitHub Actions warning annotation. The action runs with `if: always()`
 * at the end of the pipeline, so a cosmetic mistake in the inputs must never
 * fail it and hide the pipeline result.
 */
export const warn = (message: string): void => {
    console.log(`::warning::${message}`)
}

const truncate = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

export type FieldsOptions = {
    /** Render every field inline, Discord lays them out in up to three columns. */
    inline: boolean
}

/**
 * Parse the `fields` input, one `Name: value` per line.
 *
 * - the first `: ` splits name and value, so URLs in values are safe
 * - a line ending with `:` opens a field with an empty value
 * - a line starting with whitespace continues the previous value on a new line
 * - blank lines are ignored
 * - fields whose value is empty are dropped silently: a `${{ }}` expression
 *   that evaluates to nothing removes its field, that is how conditional
 *   fields work
 * - any other line is a caller mistake, it is reported and skipped
 *
 * Names and values longer than Discord allows are truncated with a warning.
 */
export const parseFields = (raw: string, options: FieldsOptions): Field[] => {
    const fields: Field[] = []
    let current: Field | undefined

    for (const [index, line] of raw.split('\n').entries()) {
        if (line.trim() === '') continue

        if (/^\s/.test(line)) {
            if (!current) {
                warn(`fields: line ${index + 1} is indented but there is no field to continue, ignored.`)
                continue
            }
            current.value = current.value === '' ? line.trim() : `${current.value}\n${line.trim()}`
            continue
        }

        const parsed = splitLine(line)
        if (!parsed) {
            warn(`fields: line ${index + 1} is not a \`Name: value\` pair, ignored.`)
            current = undefined
            continue
        }

        current = { name: parsed.name, value: parsed.value, inline: options.inline }
        fields.push(current)
    }

    return fields.filter(field => field.value.trim() !== '').map(clampField)
}

const splitLine = (line: string): { name: string; value: string } | undefined => {
    if (line.endsWith(':')) {
        const name = line.slice(0, -1).trim()
        return name === '' ? undefined : { name, value: '' }
    }
    const separator = line.indexOf(': ')
    if (separator <= 0) return undefined
    const name = line.slice(0, separator).trim()
    if (name === '') return undefined
    return { name, value: line.slice(separator + 2).trim() }
}

const clampField = (field: Field): Field => {
    if (field.name.length > MAX_FIELD_NAME_LENGTH)
        warn(
            `fields: the name of "${truncate(field.name, 30)}" exceeds ${MAX_FIELD_NAME_LENGTH} characters, truncated.`,
        )
    if (field.value.length > MAX_FIELD_VALUE_LENGTH)
        warn(`fields: the value of "${field.name}" exceeds ${MAX_FIELD_VALUE_LENGTH} characters, truncated.`)
    return {
        ...field,
        name: truncate(field.name, MAX_FIELD_NAME_LENGTH),
        value: truncate(field.value, MAX_FIELD_VALUE_LENGTH),
    }
}

const embedBaseLength = (embed: Embed): number =>
    (embed.title?.length ?? 0) + (embed.description?.length ?? 0) + (embed.author?.name?.length ?? 0)

/**
 * Keep as many fields as Discord accepts: at most 25, and only while the whole
 * embed stays under 6000 characters. The description already spends up to
 * 4096 of those on the commit list, so the fields get what is left.
 */
export const fitFields = (embed: Embed, fields: Field[]): Field[] => {
    if (fields.length > MAX_FIELDS)
        warn(`fields: ${fields.length} fields given, Discord allows ${MAX_FIELDS}, extra dropped.`)

    const kept: Field[] = []
    let length = embedBaseLength(embed)
    for (const field of fields.slice(0, MAX_FIELDS)) {
        if (length + field.name.length + field.value.length > MAX_EMBED_LENGTH) {
            warn(
                `fields: the embed would exceed ${MAX_EMBED_LENGTH} characters, "${field.name}" and following dropped.`,
            )
            break
        }
        kept.push(field)
        length += field.name.length + field.value.length
    }
    return kept
}
