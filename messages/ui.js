/**
 * @typedef {import("types/Messages.js").Message} Message
 * @typedef {import("types/Messages.js").MessageSet} MessageSet
 * @typedef {import("types/Messages.js").MessageDelete} MessageDelete
 * @typedef {import("types/Messages.js").MessagesChangeEvent} MessagesChangeEvent
 */
import { messagesMap, getAllMessageDocs, deleteMessage } from "../db.js"
import { events } from "../events.js"

const msgWrap = document.getElementById("messages-wrap")

/** @param {MessageSet} e */
function handleMessageSet(e) {
	insertMessage(e.detail)
}
/** @param {MessageDelete} e */
function handleMessageDelete(e) {
	
  const id = e.detail
  const el = msgWrap?.querySelector(`[data-id="${id}"]`)
	if (el) el.remove()
}
//@ts-ignore
events.addEventListener("messages:set", handleMessageSet)
//@ts-ignore
events.addEventListener("messages:delete", handleMessageDelete)

/**
 * Add a single new message to the top of the container
 * @param {Message} doc
 * @param {number} index - optional index for animation delay
 */
function insertMessage(doc, index = 0) {
	if (!msgWrap) throw new Error("msgWrap not found")

	const p = buildMsgEl(doc)
	p.classList.add("msg-card", "anim-fade-in")
	p.style.animationDelay = `${index * 80}ms`

	msgWrap.prepend(p)
}

/**
 * @param {Map<string, Message>} map
 */
async function render(map) {
	if (!msgWrap) throw new Error("msgWrap not found on dom")
	//? don't do any data fetching here multi times

	const docs = [...map.values()].toReversed()

	if (!docs.length) {
		msgWrap.append(
			Object.assign(document.createElement("p"), {
				textContent: "No messages found, create new one",
			})
		)
		return
	}

	const nodes = docs.map((doc, i) => {
		// const p = document.createElement("p")
		// p.textContent = `${i}: ${doc.message}`
		const p = buildMsgEl(doc)
		p.classList.add("msg-card", "anim-fade-in")
		p.style.animationDelay = `${i * 80}ms`
		return p
	})

	// Append all at once
	msgWrap.replaceChildren(...nodes)
}

async function init() {
	await getAllMessageDocs()
	render(messagesMap)
}

init()

// helpers
/**
 * @param {Message} doc
 */
function buildMsgEl(doc) {
	const { message, _id } = doc
	/** @type {Record<string, string>} */
	const nameMap = {
		"[NAME_A]": "Alice",
		"[NAME_B]": "Bob",
		"[NAME_C]": "Charlie",
	}
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

	while ((match = placeholderPattern.exec(message)) !== null) {
		// Append text before the match
		if (match.index > lastIndex) {
			p.append(document.createTextNode(message.slice(lastIndex, match.index)))
		}

		// Append the replacement name in <strong>
		const strong = document.createElement("strong")
		strong.textContent = nameMap[match[0]]
		p.append(strong)

		lastIndex = placeholderPattern.lastIndex
	}

	// Append any trailing text
	if (lastIndex < message.length) {
		p.append(document.createTextNode(message.slice(lastIndex)))
	}

	// add delete button
	const deleteBtn = document.createElement("button")
	deleteBtn.textContent = "x"
	deleteBtn.title = "delete"
	deleteBtn.classList.add("delete")
	deleteBtn.addEventListener("pointerup", () => {
		deleteMessage(doc)
	})
	p.append(deleteBtn)

  p.setAttribute("data-id", _id)
	p.id = _id

	return p
}
