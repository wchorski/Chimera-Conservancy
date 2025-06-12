/**
 * @typedef {import('./Types').PartType} PartType
 */

/**
 * Avatar parts manifest with nested arrays of options
 * @type {Object.<PartType, Array<{url: string}>>}
 */
const manifest = await fetch("./public/manifest.json")
	.then((r) => r.json())
	.catch((error) => {
		console.log(error)
		return {}
	})

/**
 * @type {Object.<PartType, Array<SVGElement>>}
 */
const avatarEls = {
	base: [],
	eye: [],
}
const faceSVG = document.getElementById("face-svg")
const partTiles = document.getElementById("part-tiles")
const categoryTabs = document.getElementById("category-tabs")
let activeTileSet = document.createElement("div")

function drawAvatar() {
	const allElements = Object.values(avatarEls).flat()
	const sorted = allElements.sort(
		(a, b) => (Number(a.dataset.z) || 0) - (Number(b.dataset.z) || 0)
	)
	const title = faceSVG.querySelector("title")
	const defs = faceSVG.querySelector("defs")
	console.log(sorted)
	faceSVG.replaceChildren(title, defs, ...sorted)
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
		throw new Error(error)
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

		const svgPartial = doc.querySelector("g")

		if (svgPartial) {
			// Need to import the node into the current document
			const importedElement = document.importNode(svgPartial, true)
			importedElement.classList.add("avatar-part")
			importedElement.id = partType
			importedElement.setAttribute("data-part", partType)

			return importedElement
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
 * @param {SVGElement} g
 * @param {string} titleContent
 */
function createSVGElementWrapper(g, titleContent) {
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
	svg.append(g)

	return svg
}

/**
 * @param {PartType} type
 * @param {string} i
 * @returns {void}
 */
function updatePart(type, i) {
	// Remove existing element with this class
	const existingElement = document.getElementById(type)
	if (existingElement) {
		existingElement.remove()
	}
	console.log(avatarEls)

	const clonedEl = manifest[type][i].el.cloneNode(true)
	// find by type and replace current part
  avatarEls[type].length = 0
  avatarEls[type].push(clonedEl)
  console.log(avatarEls);
  drawAvatar()
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

		// const defaultBase = manifest.base[0].el.cloneNode(true)
		// const defaultEye = manifest.eye[0].el.cloneNode(true)
		// faceSVG.append(defaultBase)
		// faceSVG.append(defaultEye)

		const buildBase = manifest.base[0].el.cloneNode(true)
		const buildEye = manifest.eye[0].el.cloneNode(true)
		avatarEls.base.push(buildBase)
		avatarEls.eye.push(buildEye)

		drawAvatar()

		Object.entries(manifest).forEach(([type, partOptions], index) => {
			loadTileSet(type)
		})
	} catch (error) {
		console.error("Failed to load avatar parts:", error)
	}

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
		// TODO don't forget event listener
		btn.addEventListener("click", (e) => updatePart(type, i))

		const gEl = manifest[type][i].el
		const svgEl = createSVGElementWrapper(gEl, type)

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
	partTiles.append(wrapper)
}

/**
 * @param {PartType} type
 */
function updateTileSet(type) {
	activeTileSet.classList.add("hidden")
	activeTileSet = document.getElementById(`${type}-tiles`)
	activeTileSet.classList.remove("hidden")
}

function setupUi() {
	const keys = Object.keys(manifest)

	keys.map(async (type, i) => {
		const btn = document.createElement("button")
		btn.type = "button"
		btn.addEventListener("click", (e) => updateTileSet(type))
		btn.innerText = type
		categoryTabs.append(btn)
	})
}

main()

// debug

// Method 2: More direct approach using DOMParser
async function loadCircleSVGWithParser() {
	try {
		// const response = await fetch("./public/clown-face-copy.svg")
		const response = await fetch("./public/eyes/wide.svg")
		const svgText = await response.text()

		// Parse the SVG content
		const parser = new DOMParser()
		const svgDoc = parser.parseFromString(svgText, "image/svg+xml")

		// Get the <g> element
		const gElement = svgDoc.querySelector("g")

		// Get the existing SVG element
		const svg = document.getElementById("face-svg")

		if (gElement && svg) {
			// Import and append the node to the existing SVG
			const importedNode = document.importNode(gElement, true)
			svg.appendChild(importedNode)
		}

		let newRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
		newRect.setAttribute("x", "150")
		newRect.setAttribute("y", "150")
		newRect.setAttribute("width", "100")
		newRect.setAttribute("height", "100")
		newRect.setAttribute("fill", "#5cceee")

		svg.appendChild(newRect)
	} catch (error) {
		console.error("Error loading SVG:", error)
	}
}
// loadCircleSVGWithParser()
