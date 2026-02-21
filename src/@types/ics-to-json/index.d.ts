declare module "ics-to-json" {
    export interface IcsItem {
        startDate?: string
        endDate?: string
        summary?: string
        description?: string
        [key: string]: unknown
    }

    export function icsToJson(icsData: string): IcsItem[]
}
