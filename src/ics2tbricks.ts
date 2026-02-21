import { pathToFileURL } from "node:url"
import { DEFAULT_CALENDAR_URL, DEFAULT_COUNTRY_CODE, calResourceFromIcs, calResourceFromURL } from "./core.js"

export { DEFAULT_CALENDAR_URL, DEFAULT_COUNTRY_CODE, calResourceFromIcs, calResourceFromURL }

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
