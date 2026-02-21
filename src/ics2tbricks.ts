import { pathToFileURL } from "node:url"
import { icsToJson } from "ics-to-json"
import { json2xml } from "xml-js"

export const DEFAULT_COUNTRY_CODE = "HK"
export const DEFAULT_CALENDAR_URL = "https://www.hkex.com.hk/News/HKEX-Calendar/Subscribe-Calendar?sc_lang=en"

const HONG_KONG_CLOSED = "Hong Kong Market is closed"
const RESOURCE_TYPE = "application/x-calendar+xml"

type YesNo = "yes" | "no"

interface CalendarItem {
    startDate?: string
    description?: string
}

interface DayElement {
    type: "element"
    name: "day"
    attributes: {
        date: string
        valid: YesNo
    }
}

interface DaysElement {
    type: "element"
    name: "days"
    attributes: {
        year: number
    }
    elements: DayElement[]
}

function parseIcsDate(value: string): Date | null {
    const plainDate = /^(\d{4})(\d{2})(\d{2})/.exec(value)
    if (plainDate !== null) {
        const year = Number(plainDate[1])
        const month = Number(plainDate[2])
        const day = Number(plainDate[3])
        return new Date(Date.UTC(year, month - 1, day))
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
        return null
    }

    return parsed
}

function formatMonthDay(date: Date): string {
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    return `${month}-${day}`
}

function extractDaysByYear(items: CalendarItem[]): Map<number, DayElement[]> {
    const daysByYear = new Map<number, DayElement[]>()

    for (const item of items) {
        if (item.description !== HONG_KONG_CLOSED || item.startDate === undefined) {
            continue
        }

        const date = parseIcsDate(item.startDate)
        if (date === null) {
            continue
        }

        const year = date.getUTCFullYear()
        const dayElement: DayElement = {
            type: "element",
            name: "day",
            attributes: {
                date: formatMonthDay(date),
                valid: "no",
            },
        }

        const current = daysByYear.get(year)
        if (current === undefined) {
            daysByYear.set(year, [dayElement])
        } else {
            current.push(dayElement)
        }
    }

    return daysByYear
}

function buildDaysElements(daysByYear: Map<number, DayElement[]>): DaysElement[] {
    return [...daysByYear.entries()]
        .sort(([leftYear], [rightYear]) => leftYear - rightYear)
        .map(([year, elements]) => ({
            type: "element",
            name: "days",
            attributes: { year },
            elements,
        }))
}

export function calResourceFromIcs(icsData: string, countryCode = DEFAULT_COUNTRY_CODE): string {
    const parsedItems = icsToJson(icsData) as CalendarItem[]
    const daysByYear = extractDaysByYear(parsedItems)
    const daysElements = buildDaysElements(daysByYear)

    const resource = {
        elements: [
            {
                type: "element",
                name: "resource",
                attributes: {
                    name: countryCode,
                    type: RESOURCE_TYPE,
                },
                elements: [
                    {
                        type: "element",
                        name: "week",
                        attributes: {
                            monday: "yes",
                            tuesday: "yes",
                            wednesday: "yes",
                            thursday: "yes",
                            friday: "yes",
                            saturday: "no",
                            sunday: "no",
                        },
                    },
                    ...daysElements,
                    {
                        type: "element",
                        name: "documentation",
                        elements: [
                            {
                                type: "text",
                                text: `Calendar defining bank/settlement days for ${countryCode}.`,
                            },
                        ],
                    },
                ],
            },
        ],
    }

    return json2xml(JSON.stringify(resource), { compact: false, spaces: 2 })
}

export async function calResourceFromURL(
    url = DEFAULT_CALENDAR_URL,
    countryCode = DEFAULT_COUNTRY_CODE,
): Promise<string> {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        throw new Error("url parameter must start with http:// or https://")
    }

    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`fetch() of ${url} failed with status ${response.status}`)
    }

    const icsData = await response.text()
    return calResourceFromIcs(icsData, countryCode)
}

async function runCli(): Promise<void> {
    const [urlArg, countryCodeArg] = process.argv.slice(2)
    const output = await calResourceFromURL(urlArg ?? DEFAULT_CALENDAR_URL, countryCodeArg ?? DEFAULT_COUNTRY_CODE)
    console.log(output)
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
    runCli().catch(error => {
        const message = error instanceof Error ? error.message : String(error)
        console.error(message)
        process.exitCode = 1
    })
}
