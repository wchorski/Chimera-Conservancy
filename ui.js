/**
 * @typedef {import("types/Emoji.js").Emoji} Emoji
 * @typedef {import("types/Emoji.js").EmojiSet} EmojiSet
 * @typedef {import("types/Doc.js").DocDelete} DocDelete
 * @typedef {import("types/Messages.js").MessagesChangeEvent} MessagesChangeEvent
 */
import { deleteEmoji, emojisMap, getAllEmojiDocs } from "./db.js"
import { events } from "./events.js"

const emojisWrap = document.getElementById("emojis-wrap")

/** @param {EmojiSet} e */
function handleEmojiSet(e) {
	if (!emojisWrap) throw new Error("wrap not found on dom")
	insertOneEmoji(e.detail, 0, emojisWrap)
}

/** @param {DocDelete} e */
function handleDocDelete(e) {
	const id = e.detail
	const el = emojisWrap?.querySelector(`[data-id="${id}"]`)
	if (el) el.remove()
}

/**
 * Add a single new message to the top of the container
 * @param {Emoji} doc
 * @param {number} i - optional index for animation delay
 * @param {HTMLElement} wrap - optional index for animation delay
 */
export function insertOneEmoji(doc, i = 0, wrap) {
	if (!emojisWrap) throw new Error("wrap not found")

	const el = parseSVGToEl(doc, true)
	el.classList.add("emoji-thumbnail", "anim-fade-in")
	el.style.animationDelay = `${i * 80}ms`

	wrap.prepend(el)
}

/**
 * @param {Map<string, Emoji>} map
 */
export async function renderEmojiEls(map) {
	if (!emojisWrap) throw new Error("doc wrapper not found on dom")
	//? don't do any data fetching here multi times

	const docs = [...map.values()].toReversed()

	if (!docs.length) {
		emojisWrap.append(
			Object.assign(document.createElement("p"), {
				textContent: "No emojis found, create new one",
			})
		)
		return
	}

	const nodes = docs?.map((doc, i) => {
		const el = parseSVGToEl(doc, true)
		el.classList.add("emoji-thumbnail", "anim-fade-in")
		el.style.animationDelay = `${i * 80}ms`
		return el
	})

	// Append all at once
	emojisWrap.replaceChildren(...nodes)
}

export async function initUI() {
	await getAllEmojiDocs()
	renderEmojiEls(emojisMap)
	//@ts-ignore
	events.addEventListener("emojis:set", handleEmojiSet)
	//@ts-ignore
	events.addEventListener("emojis:delete", handleDocDelete)
}

// initUI()

// TODO should i keep nested option to add delete button or just add it outside of this function?
// TODO should i make it nested object `{ isDelete: true}` ?
//* helpers
/**
 * @param {Emoji} doc
 * @param {boolean} isDelete  */
export function parseSVGToEl(doc, isDelete = false) {
	const { svg, _id, name } = doc
	const parser = new DOMParser()
	const el = parser.parseFromString(svg, "image/svg+xml")
	const svgElement = el.documentElement

	if (svgElement.tagName != "svg") throw Error("svg tagName is not `svg`")
	// Insert into DOM safely

	if (isDelete) {
		const deleteBtn = svgGDeleteButton(() => deleteEmoji(doc))
		svgElement.appendChild(deleteBtn)
	}

	svgElement.setAttribute("data-id", _id)
	svgElement.setAttribute("data-name", name)
	svgElement.id = _id

	return svgElement
	// document.getElementById("emojis-wrap")?.appendChild(svgElement)
}

// TODO trigger a "are you sure" dialog box
/** @param {(e: PointerEvent) => any} onDelete */
function svgGDeleteButton(onDelete) {
	const x = 1
	const y = 1
	const size = 20
	const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
	// TODO reveal btn on hover
	g.innerHTML = `
    <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="red" rx="2"/>
    <text x="${x + size / 2}" y="${
		y + size / 2 + 3
	}" text-anchor="middle" fill="white" font-size="${
		size * 0.7
	}" font-family="Arial">×</text>
  `
	g.style.cursor = "pointer"
	g.addEventListener("pointerup", onDelete)
	g.classList.add("delete-btn")
	return g
}
