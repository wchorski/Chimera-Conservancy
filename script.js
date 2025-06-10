/**
 * @typedef {import('./Types').PartType} PartType
 */
/**
 * Avatar parts manifest with nested arrays of options
 * @type {Object.<PartType, Array<{url: string}>>}
 */
const avatarParts = await fetch("./public/manifest.json")
	.then((r) => r.json())
	.catch((error) => console.log(error))

const faceContainer = document.getElementById("face-wrap")
const partTiles = document.getElementById("part-tiles")
const categoryTabs = document.getElementById("category-tabs")
let activeTileSet = document.createElement("div")

/**
 * @async
 * @param {string} url
 * @returns {Promise<string>}
 * @throws {Error}
 * */
async function fetchSVGText(url) {
	try {
		const response = await fetch(url)
		const svgText = await response.text()
		return svgText
	} catch (error) {
		throw new Error(error)
	}
}

/**
 * @param {string} svgText
 * @param {PartType} partType
 * @returns {SVGElement}
 */
function getSVGElement(svgText, partType) {
	const tempDiv = document.createElement("div")
	tempDiv.innerHTML = svgText

	const svgElement = tempDiv.querySelector("svg")
	if (svgElement) {
		svgElement.classList.add("avatar-part")
		svgElement.id = partType
		svgElement.setAttribute("data-part", partType)

		return svgElement
	}
}

/**
 * @param {string} url
 * @param {PartType} partType
 * @returns {Promise<void>}
 */
async function updatePart(url, partType) {
	// Remove existing element with this class
	const existingElement = document.getElementById(partType)
	if (existingElement) {
		existingElement.remove()
	}

	// Load and add new SVG
	const svgText = await fetchSVGText(url)
	const el = await getSVGElement(svgText, partType)
	faceContainer.append(el)
}

async function main() {
	try {
		// Loop through each key in avatarParts and get the first element from each array
		for (const [partType, partOptions] of Object.entries(avatarParts)) {
			// Get the first option from the array
			const firstOption = partOptions[0]

			if (firstOption && firstOption.url) {
				const svgText = await fetchSVGText(firstOption.url)
				const el = await getSVGElement(svgText, partType)
				faceContainer.append(el)
			} else {
				console.warn(`No valid option found for part type: ${partType}`)
			}

			loadTileSet(partType)
		}

		// console.log("Avatar loaded successfully")
	} catch (error) {
		console.error("Failed to load avatar parts:", error)
	}

	// loadTileSet("base")
	setupUi()
}

/**
 * @param {PartType} type
 */
async function loadTileSet(type) {
	const wrapper = document.createElement("div")
	wrapper.classList.add("tileset-grid")
	wrapper.id = `${type}-tiles`

	const btns = await Promise.all(
		avatarParts[type].map(async (part, i) => {
			const btn = document.createElement("button")
			btn.addEventListener("click", (e) => updatePart(part.url, type))

			const svgText = await fetchSVGText(part.url)
			const svgEl = getSVGElement(svgText, type)

			btn.appendChild(svgEl)
			return btn
		})
	)

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
	const keys = Object.keys(avatarParts)

	keys.map(async (type, i) => {
		const btn = document.createElement("button")
		btn.addEventListener("click", (e) => updateTileSet(type))
		btn.innerText = type
		categoryTabs.append(btn)
	})
}

main()
