/**
 * @typedef {import('../types/Emoji')} Emoji
 * @typedef {import('../types/Messages')} Message
 */

import { getAllEmojiDocs, getAllMessageDocs } from "../db.js"
const emojiAEl = document.getElementById("emojiA")
const emojiBEl = document.getElementById("emojiB")
const messageWrap = document.getElementById("messageWrap")
const playfield = document.getElementById("playfield")

/** @param {string} svg  */
function renderSVG(svg) {
	const parser = new DOMParser()
	const doc = parser.parseFromString(svg, "image/svg+xml")
	const svgElement = doc.documentElement

	if (svgElement.tagName === "svg") {
		// Insert into DOM safely
		document.getElementById("emojis-wrap")?.appendChild(svgElement)
	}
}

/**
 *
 * @param {string} svg
 * @returns {HTMLElement}
 */
function createSVGElement(svg) {
	const parser = new DOMParser()
	const doc = parser.parseFromString(svg, "image/svg+xml")
	const svgElement = doc.documentElement

	if (svgElement.tagName !== "svg" || !svgElement)
		throw new Error("not valid svg text")

	return svgElement
}

/**
 * @param {Emoji[]} emojis
 * @param {Message[]} messages
 * */
function twoRandomEmoji(emojis, messages) {
  // playfield?.replaceChildren()
  emojiAEl?.replaceChildren()
  emojiBEl?.replaceChildren()
  messageWrap?.replaceChildren()
  
	const aNum = Math.floor(Math.random() * emojis.length)
	const bNum = Math.floor(Math.random() * emojis.length)
	const emojiA = emojis[aNum]
	const emojiB = emojis[bNum]
	const svgA = createSVGElement(emojiA.svg)
	const svgB = createSVGElement(emojiB.svg)

  svgA.classList.add("anim-fade-in")
	emojiAEl?.appendChild(svgA)
	emojiAEl?.appendChild(
		Object.assign(document.createElement("h3"), {
			textContent: emojiA.name,
		})
	)

  svgB.classList.add("anim-fade-in")
	emojiBEl?.appendChild(svgB)
	emojiBEl?.appendChild(
		Object.assign(document.createElement("h3"), {
			textContent: emojiB.name,
		})
	)

	// TODO make this cluttered function more modular
	const rndNum = Math.floor(Math.random() * messages.length)

	const msg = messages[rndNum].message

	//? unsafe to do
	// const parsedMsg =  msg.replace('[NAME_A]', `<strong>${emojiA.name}</strong>`).replace('NAME_B', emojiB.name)

	let nameA = emojiA.name // user input
	let nameB = emojiB.name // user input

	const p = renderMsg(msg, {
		"[NAME_A]": nameA,
		"[NAME_B]": nameB,
		"[NAME_C]": "Charlie",
	})

  p.classList.add("anim-fade-in")
	messageWrap?.appendChild(p)
}

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

async function ranch() {
	const messages = await getAllMessageDocs()
	if (!messages) throw new Error("no messages found")

	const docs = await getAllEmojiDocs()
	if (!docs) throw new Error("emoji docs not found")
	docs?.map((doc) => renderSVG(doc.svg))

	twoRandomEmoji(docs, messages)

	setInterval(() => {
		twoRandomEmoji(docs, messages)
	}, 10000)
}
ranch()
// TODO select 2 random emoji
// select one random fill-in-the-blank (create database for mad libs)
// show emoji 1 in deck A with name underneith
// show emoji 2 in deck B with name underneith
// show mad lib between, filling in the 2 blanks with first blank going to emoji 1 and 2nd blank to emoji 2
