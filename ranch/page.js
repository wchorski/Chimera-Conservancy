/**
 * @typedef {import('types/Emoji').Emoji} Emoji
 * @typedef {import('types/Messages').Message} Message
 * @typedef {import("types/Emoji").EmojiSet} EmojiSet
 * @typedef {import("types/Doc.js").DocDelete} DocDelete
 */
import { events } from "../events.js"
import { insertOneEmoji, parseSVGToEl } from "../ui.js"
import {
	getAllEmojiDocs,
	getAllMessageDocs,
	emojisMap,
	messagesMap,
} from "../db.js"
// TODO maybe consolidate these 3 vars into one `playfield` element?
const emojiAWrap = document.getElementById("emojiA")
const emojiBWrap = document.getElementById("emojiB")
const messageWrap = document.getElementById("messageWrap")
const emojisWrap = document.getElementById("emojis-wrap")


function twoRandomEmoji() {
  const messageDocs = [...messagesMap.values()]
	emojiAWrap?.replaceChildren()
	emojiBWrap?.replaceChildren()
	messageWrap?.replaceChildren()
	const emojiSVGEls = emojisWrap?.children
	// TODO handle empty database and re-route link to create page
	if (!emojiSVGEls) throw new Error("no emoji children found")

	const aNum = Math.floor(Math.random() * emojiSVGEls.length)
	const bNum = Math.floor(Math.random() * emojiSVGEls.length)

	const svgA = /** @type {Element} */ (emojiSVGEls[aNum].cloneNode(true))
	const svgB = /** @type {Element} */ (emojiSVGEls[bNum].cloneNode(true))
	if (!(svgA instanceof Element || !(svgB instanceof Element)))
		throw new Error("Cloned node is not an Element")

	const nameA = svgA.getAttribute("data-name") || "[NAME_A]"
	const nameB = svgB.getAttribute("data-name") || "[NAME_B]"

	svgA.classList.add("anim-fade-in")
	emojiAWrap?.appendChild(svgA)
	emojiAWrap?.appendChild(
		Object.assign(document.createElement("h3"), {
			textContent: nameA,
		})
	)

	svgB.classList.add("anim-fade-in")
	emojiBWrap?.appendChild(svgB)
	emojiBWrap?.appendChild(
		Object.assign(document.createElement("h3"), {
			textContent: nameB,
		})
	)

	// TODO make this cluttered function more modular
	const rndNum = Math.floor(Math.random() * messageDocs.length)

	const msg = messageDocs[rndNum].message

	//? unsafe to do
	// const parsedMsg =  msg.replace('[NAME_A]', `<strong>${emojiA.name}</strong>`).replace('NAME_B', emojiB.name)

	const p = renderMsg(msg, {
		"[NAME_A]": nameA,
		"[NAME_B]": nameB,
		"[NAME_C]": "Charlie",
	})

	p.classList.add("anim-fade-in")
	messageWrap?.appendChild(p)
}

// TODO use external db.js and ui.js functions
/**
 *
 * @param {string} msg
 * @param {Record<string, string>} nameMap
 */
function renderMsg(msg, nameMap) {
	const p = document.createElement("p")

	// Build a regex from all the placeholders in the map
	const placeholderPattern = new RegExp(
		Object.keys(nameMap)
			.map((ph) => ph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // escape regex chars
			.join("|"),
		"g"
	)

	let lastIndex = 0
	let match

	while ((match = placeholderPattern.exec(msg)) !== null) {
		// Append text before the match
		if (match.index > lastIndex) {
			p.append(document.createTextNode(msg.slice(lastIndex, match.index)))
		}

		// Append the replacement name in <strong>
		const strong = document.createElement("strong")
		strong.textContent = nameMap[match[0]]
		p.append(strong)

		lastIndex = placeholderPattern.lastIndex
	}

	// Append any trailing text
	if (lastIndex < msg.length) {
		p.append(document.createTextNode(msg.slice(lastIndex)))
	}
	return p
}

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

async function init() {
	await getAllMessageDocs()
	await getAllEmojiDocs()

	//@ts-ignore
	events.addEventListener("emojis:set", handleEmojiSet)
	//@ts-ignore
	events.addEventListener("emojis:delete", handleDocDelete)

	const emojiDocs = [...emojisMap.values()]

	renderEmojis(emojiDocs)

	twoRandomEmoji()
	setInterval(() => {
		twoRandomEmoji()
	}, 3000)
}
init()

/**
 * @param {Emoji[]} docs
 */
function renderEmojis(docs) {
	console.log("/ranch/page renderEmojis")
	if (!emojisWrap) throw new Error("doc wrapper not found on dom")
	// const docs = [...map.values()].toReversed()

	if (!docs.length) {
		emojisWrap.append(
			Object.assign(document.createElement("p"), {
				textContent: "No emojis found, create new one",
			})
		)
		return
	}

	const nodes = docs.toReversed().map((doc, i) => {
		const el = parseSVGToEl(doc)
		el.classList.add("emoji-thumbnail", "anim-fade-in")
		el.style.animationDelay = `${i * 80}ms`
		return el
	})

	// Append all at once
	emojisWrap.replaceChildren(...nodes)
}

// /** @param {EmojiSet} e */
// function handleEmojiSet(e) {
//   console.log('/ranch/page.js handleEmojiSet');
// 	if (!emojisWrap) throw new Error("wrap not found")
// 	// insertEmoji(e.detail)
// 	const el = parseSVGToEl(e.detail)
// 	el.classList.add("emoji-thumbnail", "anim-fade-in")
// 	emojisWrap.prepend(el)
// }
// //@ts-ignore
// events.addEventListener("emojis:set", handleEmojiSet)
