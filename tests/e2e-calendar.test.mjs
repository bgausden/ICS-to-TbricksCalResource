import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"
import { xml2js } from "xml-js"

const FIXTURE_PATH = new URL("../extra_src/hkex-calendar.ics", import.meta.url)

function findElement(parent, name) {
    return parent?.elements?.find(element => element.type === "element" && element.name === name)
}

function validateTbricksResourceXml(xml, expectedCountryCode) {
    const parsed = xml2js(xml, { compact: false })
    const resource = findElement(parsed, "resource")

    assert.ok(resource, "Missing <resource> root element")
    assert.equal(resource.attributes?.type, "application/x-calendar+xml", "Incorrect resource type")
    assert.equal(resource.attributes?.name, expectedCountryCode, "Incorrect resource name")

    const week = findElement(resource, "week")
    assert.ok(week, "Missing <week> element")

    const dayFlags = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    for (const dayFlag of dayFlags) {
        const value = week.attributes?.[dayFlag]
        assert.ok(value === "yes" || value === "no", `Invalid week flag for ${dayFlag}: ${String(value)}`)
    }

    const dayGroups = (resource.elements ?? []).filter(element => element.type === "element" && element.name === "days")
    assert.ok(dayGroups.length > 0, "Expected at least one <days> element")

    for (const dayGroup of dayGroups) {
        const year = Number(dayGroup.attributes?.year)
        assert.ok(Number.isInteger(year) && year >= 1900 && year <= 3000, `Invalid days year: ${String(dayGroup.attributes?.year)}`)

        const dayElements = (dayGroup.elements ?? []).filter(element => element.type === "element" && element.name === "day")
        assert.ok(dayElements.length > 0, "Each <days> element should contain at least one <day>")

        for (const dayElement of dayElements) {
            const date = String(dayElement.attributes?.date ?? "")
            const valid = String(dayElement.attributes?.valid ?? "")
            assert.match(date, /^\d{2}-\d{2}$/, `Invalid day date format: ${date}`)
            assert.ok(valid === "yes" || valid === "no", `Invalid day valid flag: ${valid}`)
        }
    }

    const documentation = findElement(resource, "documentation")
    assert.ok(documentation, "Missing <documentation> element")
}

test("server endpoint produces valid Tbricks XML from ICS", async () => {
    const { calResourceFromIcs } = await import("../dist/ics2tbricks.js")
    const icsData = await readFile(FIXTURE_PATH, "utf8")

    const xml = calResourceFromIcs(icsData, "HK")

    assert.ok(xml.includes("<resource"), "Expected XML resource output")
    validateTbricksResourceXml(xml, "HK")
})

test("browser endpoints produce valid and consistent Tbricks XML", async () => {
    const { calResourceFromIcs, calResourceFromIcsFile } = await import("../dist/browser.js")
    const icsData = await readFile(FIXTURE_PATH, "utf8")

    const fromText = calResourceFromIcs(icsData, "HK")
    const fromFile = await calResourceFromIcsFile(new Blob([icsData], { type: "text/calendar" }), "HK")

    validateTbricksResourceXml(fromText, "HK")
    validateTbricksResourceXml(fromFile, "HK")
    assert.equal(fromText, fromFile, "Browser text and file endpoints should produce identical XML")
})
