/**
 * @typedef {import('../types/Messages').Message} Message
 */
import { createMessage, getAllMessageDocs, messagesMap } from "../db.js"
import { renderMessagesEls } from "./ui.js"
const shortCodeBtnWrap = document.getElementById("shortcode-btn-wrap")
const msgTextareaEl = document.getElementById("msg-textarea")
const msgTextarea =
	msgTextareaEl instanceof HTMLTextAreaElement ? msgTextareaEl : null
const form = document.forms.namedItem("msgForm")
const msgWrap = document.getElementById("messages-wrap")

document.addEventListener("DOMContentLoaded", function () {
	// Add event listeners to all shortcode buttons using event delegation

	shortCodeBtnWrap?.addEventListener("click", (e) => {
		const target = e.target

		if (
			target instanceof HTMLElement &&
			target.classList.contains("shortcode-btn")
		) {
			const shortcode = target.getAttribute("data-shortcode")
			if (shortcode) {
				insertShortcode(shortcode)
			}
		}
	})

	form?.addEventListener("submit", async (e) => {
		e.preventDefault()

		//@ts-ignore
		const data = Object.fromEntries(new FormData(e.target))
		const { message } = data
		if (!message || message === "") throw new Error("no message in input field")

		try {
			// Your logic here
			// console.log("Form submitted:", name)
			const doc = await createMessage(message)
			if (!doc) throw new Error("no message doc returned")

			form.reset()

			const successEl = form.querySelector(".success")
			if (!(successEl instanceof HTMLElement))
				throw new Error("not HTML element")
			if (successEl) {
				successEl.style.visibility = "visible"

				// Optional: Hide success message after 3 seconds
				setTimeout(() => {
					successEl.style.visibility = "hidden"
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

async function init() {
	if (!msgWrap) throw new Error("no msgWrap")
	await getAllMessageDocs()
	renderMessagesEls(messagesMap, msgWrap)
}

init()