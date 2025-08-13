/**
 * @typedef {import('./Types').PartType} PartType
 */

import { getAllDocs } from "./db.js"

//TODO wrap await functions in init() file without scope problems
// async function init() {}
/**
 * Avatar parts manifest with nested arrays of options
 * @type {Record<PartType, {url: string}[]>}
 */
const manifest = await fetch("./public/manifest.json")
	.then((r) => r.json())
	.catch((error) => {
		console.log(error)
		return {}
	})

/**
 * @type {Record<PartType, SVGElement[]>}
 */
const avatarEls = {
	base: [],
	eye: [],
	brow: [],
	mouth: [],
	cheek: [],
	nose: [],
	hat: [],
}
// const faceSVG = document.getElementById("face-svg")
window.faceSVG = document.getElementById("face-svg")
const partTiles = document.getElementById("part-tiles")
const categoryTabs = document.getElementById("category-tabs")
let activeTileSet = document.createElement("div")
let activeTileButton = document.createElement("button")

function drawAvatar() {
	const allElements = Object.values(avatarEls).flat()
	const sorted = allElements.sort(
		(a, b) => (Number(a.dataset.z) || 0) - (Number(b.dataset.z) || 0)
	)
	const title = window.faceSVG.querySelector("title")
	const defs = window.faceSVG.querySelector("defs")
	window.faceSVG.replaceChildren(title, defs, ...sorted)
}

/**
 * @async
 * @param {string} url
 * @returns {Promise<string>}
 * @throws {Error}
 * */
async function fetchSVGPartialText(url) {
	try {
		const response = await fetch(url)
		const svgText = await response.text()
		return svgText
	} catch (error) {
    throw new Error("fetchSVGPartialText failed", { cause: error })
	}
}

/**
 * Method 1: Using DOMParser (Recommended - Most Secure)
 * @param {string} svgText - SVG markup as string
 * @param {string} partType - Type identifier for the part
 * @returns {SVGGElement|null}
 */
function getSVGPartial(svgText, partType) {
	try {
		const parser = new DOMParser()
		const doc = parser.parseFromString(svgText, "image/svg+xml")

		// Check for parsing errors
		const errorNode = doc.querySelector("parsererror")
		if (errorNode) {
			console.error("SVG parsing error:", errorNode.textContent)
			return null
		}

		// const svgPartial = doc.querySelector("g")
		const svgPartials = doc.querySelectorAll("g")
		// console.log(svgPartials);
		// console.log(svgPartials.length);

		if (svgPartials.length > 0) {
			// // Need to import the node into the current document
			// const importedElement = document.importNode(svgPartial, true)
			// importedElement.classList.add("avatar-part")
			// importedElement.id = `${partType}`
			// importedElement.setAttribute("data-part", partType)

			// return importedElement
			return Array.from(svgPartials).map((svgPartial, i) => {
				const importedElement = document.importNode(svgPartial, true)
				importedElement.classList.add("avatar-part", partType)
				importedElement.id = i === 0 ? partType : `${partType}-${i}`
				importedElement.setAttribute("data-part", partType)
				return importedElement
			})
		} else {
			console.warn(`SVG g element not found for partType: ${partType}`)
			return null
		}
	} catch (error) {
		console.error("Error parsing SVG:", error)
		return null
	}
}

/**
 * @param {SVGElement[]} elements
 * @param {string} titleContent
 */
function createSVGElementWrapper(elements, titleContent) {
	// Create the SVG element
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
	svg.setAttribute("viewBox", "0 0 64 64")

	// Create and append the title element
	const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
	title.textContent = titleContent
	svg.append(title)

	// Create and append the g element
	// const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
	svg.append(...elements)

	return svg
}

/**
 * @param {PartType} type
 * @param {number} i
 * @returns {void}
 */
function updatePart(type, i) {
	// Remove existing element with this class
	// TODO remove all elements with class of `type` inside svg container
	// const existingElement = document.getElementById(type)
	const existingEls = window.faceSVG.querySelectorAll(`[data-part="${type}"]`)
	if (existingEls.length > 0) existingEls.forEach((elem) => elem.remove())

	// const existingElements = document.querySelectorAll(`[data-part="${type}"]`) // or however you identify existing elements
	// existingElements.forEach(el => el.remove())

	// const clonedEl = manifest[type][i].el.cloneNode(true)
	const clonedEls = manifest[type][i].el.map((element) =>
		element.cloneNode(true)
	)
	// find by type and replace current part
	avatarEls[type].length = 0
	avatarEls[type].push(...clonedEls)
	drawAvatar()
}

/** @param {string} svg  */
function renderSVG(svg) {
	const parser = new DOMParser()
	const doc = parser.parseFromString(svg, "image/svg+xml")
	const svgElement = doc.documentElement

	if (svgElement.tagName === "svg") {
		// Insert into DOM safely
		document.getElementById("face-container")?.appendChild(svgElement)
	}
}

async function main() {
	try {
		await Promise.all(
			Object.entries(manifest).map(async ([type, partOptions], index) => {
				await Promise.all(
					partOptions.map(async (part, i) => {
						const svgText = await fetchSVGPartialText(part.url)
						const el = await getSVGPartial(svgText, type)
						manifest[type][i].el = el
					})
				)
			})
		)

		await Promise.all(
			Object.entries(manifest).map(async ([type, partOptions], index) => {
				// const gNode = manifest[type][0].el.cloneNode(true)
				// avatarEls[type].push(gNode)

				const clonedEls = manifest[type][0].el.map((element) =>
					element.cloneNode(true)
				)

				avatarEls[type].push(...clonedEls)
			})
		)

		drawAvatar()

		Object.entries(manifest).forEach(([type, partOptions], index) => {
			loadTileSet(type)
		})
	} catch (error) {
		console.error("Failed to load avatar parts:", error)
	}

	const docs = await getAllDocs()
	if (!docs) throw new Error("emoji docs not found")
	docs?.map((doc) => renderSVG(doc.svg))

	setupUi()
}

/**
 * @param {PartType} type
 */
function loadTileSet(type) {
	const wrapper = document.createElement("div")
	wrapper.classList.add("tileset-grid")
	wrapper.id = `${type}-tiles`

	const btns = manifest[type].map((part, i) => {
		const btn = document.createElement("button")
		btn.addEventListener("click", (e) => updatePart(type, i))

		const elements = manifest[type][i].el

		const svgEl = createSVGElementWrapper(elements, type)

		btn.append(svgEl)
		return btn
	})

	if (type === "base") {
		wrapper.classList.add("active")
		activeTileSet = wrapper
	} else {
		wrapper.classList.add("hidden")
	}

	wrapper.replaceChildren(...btns)
	partTiles?.append(wrapper)
}

/**
 * @param {PartType} type
 * @param {HTMLButtonElement} btn
 */
function updateTileSet(type, btn) {
	activeTileSet.classList.add("hidden")
	activeTileSet = document.getElementById(`${type}-tiles`)
	activeTileSet.classList.remove("hidden")
	// remove any current selected
	// btn.classList.remove("selected")
	activeTileButton.classList.remove("selected")
	btn.classList.add("selected")
	activeTileButton = btn
}

function setupUi() {
	const keys = Object.keys(manifest)

	keys.map(async (type, i) => {
		const btn = document.createElement("button")
		btn.type = "button"
		btn.id = `tile-selector-${type}`
		if (type === "base") {
			activeTileButton = btn
			// btn.classList.add("selected")
			activeTileButton.classList.add("selected")
		}
		btn.addEventListener("click", (e) => updateTileSet(type, btn))
		btn.innerText = type
		categoryTabs.append(btn)
	})
}

main()
