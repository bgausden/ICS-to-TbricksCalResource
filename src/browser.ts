import { DEFAULT_COUNTRY_CODE, calResourceFromIcs } from "./core.js"

export { DEFAULT_COUNTRY_CODE, calResourceFromIcs }

export async function calResourceFromIcsFile(file: Blob, countryCode = DEFAULT_COUNTRY_CODE): Promise<string> {
    const icsData = await file.text()
    return calResourceFromIcs(icsData, countryCode)
}
