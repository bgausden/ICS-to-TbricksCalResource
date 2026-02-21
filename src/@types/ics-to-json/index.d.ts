declare module "ics-to-json" {
    export default function icsToJson(icsData: string): Array<Record<string, unknown>>
}
