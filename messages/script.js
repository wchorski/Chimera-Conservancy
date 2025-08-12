/**
 * @typedef {import('../types/Messages').Message} Message
 */
import { getAllMessageDocs, createMessage, deleteMessage } from "../db.js"
const msgWrap = document.getElementById("messages-wrap")
const shortCodeBtnWrap = document.getElementById("shortcode-btn-wrap")
/**@type {HTMLTextAreaElement|null} */
const msgTextarea = document.getElementById("msg-textarea")
const form = document.forms.namedItem("msgForm")
let msgCardLastAdded = document.createElement("p")

document.addEventListener("DOMContentLoaded", function () {
	// Add event listeners to all shortcode buttons using event delegation

	shortCodeBtnWrap?.addEventListener("click", function (e) {
		if (e.target?.classList.contains("shortcode-btn")) {
			const shortcode = e.target.getAttribute("data-shortcode")
			if (shortcode) {
				insertShortcode(shortcode)
			}
		}
	})

	form?.addEventListener("submit", async function (e) {
		e.preventDefault()

		const formData = new FormData(this)
		/** @type {string|null} */
		const message = formData.get("message")
		if (!message || message === "") throw new Error("no message in input field")

		try {
			// Your logic here
			// console.log("Form submitted:", name)
			const res = await createMessage(message)
			if (!res) throw new Error("submit res undefined")
			const p = renderMsg(res)
			msgCardLastAdded.classList.remove("new")
			p.classList.add("msg-card", "anim-fade-in", "new")
			msgCardLastAdded = p
			msgWrap?.prepend(p)

			form.reset()

			const successMessage = form.querySelector(".success")
			if (successMessage) {
				successMessage.style.display = "block"

				// Optional: Hide success message after 3 seconds
				setTimeout(() => {
					successMessage.style.display = "none"
				}, 3000)
			}
		} catch (error) {
			console.log("submit message: ", error)
		}
	})
})

/**
 * @param {string} shortcode
 */
function insertShortcode(shortcode) {
	const textarea = msgTextarea
	if (!textarea) throw new Error("textarea missing")
	const start = textarea.selectionStart
	const end = textarea.selectionEnd
	const currentValue = textarea.value

	// Insert the shortcode at cursor position
	const newValue =
		currentValue.substring(0, start) + shortcode + currentValue.substring(end)
	textarea.value = newValue

	// Set cursor position after the inserted shortcode
	const newCursorPos = start + shortcode.length
	textarea.setSelectionRange(newCursorPos, newCursorPos)

	// Focus back to textarea
	textarea.focus()
}

/**
 * @param {Message} doc
 */
function renderMsg(doc) {
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
		deleteMsg(doc)
	})
	p.append(deleteBtn)

	p.id = _id

	return p
}

/**
 * @param {import("types/RemoveObject").RemoveObject} doc
 */
async function deleteMsg(doc) {
	try {
		await deleteMessage(doc)
		// remove from local db
	} catch (error) {
		throw new Error("deleteMsg: ", error)
	}
}

async function main() {
	const messages = await getAllMessageDocs()
	if (!messages) throw new Error("no messages found")
	if (!msgWrap) throw new Error("msgWrap not found on dom")
	if (messages.length === 0) {
		const p = document.createElement("p")
		p.textContent = "No messages found, create new one"
		msgWrap.prepend(p)
	}

	messages.map((doc) => {
		const p = renderMsg(doc)
		p.classList.add("msg-card", "anim-fade-in")
		msgWrap?.prepend(p)
	})
}

main()
