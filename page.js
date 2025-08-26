import { insertOneEmoji, renderEmojiEls } from "./ui.js"
import {
	dbEmojiDestroy,
	getAllEmojiDocs,
	dbSeedDatabase,
	emojisMap,
	dbEmojiDeleteMany,
} from "./db.js"
import { events } from "./events.js"

const seedDbBtn = document.getElementById("seed-db-btn")
const destroyDdBtn = document.getElementById("destroy-db-btn")
const dbMessage = document.getElementById("db-message")
const emojisWrap = document.getElementById("emojis-wrap")

/** @param {import("types/Emoji.js").EmojiSet} e */
function handleEmojiSet(e) {
	if (!emojisWrap) throw new Error("wrap not found on dom")
	insertOneEmoji(e.detail, 0, emojisWrap)
}

/** @param {import("types/Doc.js").DocDelete} e */
function handleDocDelete(e) {
	const id = e.detail
	const el = emojisWrap?.querySelector(`[data-id="${id}"]`)
	if (el) el.remove()
}

async function init() {
	if (!dbMessage) throw new Error("dbMessage not found in dom")
	if (!emojisWrap) throw new Error("dbMessage not found in dom")
	await getAllEmojiDocs()

	seedDbBtn?.addEventListener("pointerup", async (e) => {
		const res = await dbSeedDatabase()
		if (res.error) dbMessage.style.setProperty("--c-status", "red")
		if (res.ok) dbMessage.style.setProperty("--c-status", "green")
		dbMessage.textContent = res.message
	})

	destroyDdBtn?.addEventListener("pointerup", async (e) => {
		const res = await dbEmojiDeleteMany([...emojisMap.values()])
		if (res.error) dbMessage.style.setProperty("--c-status", "red")
		if (res.ok) dbMessage.style.setProperty("--c-status", "green")
		dbMessage.textContent = res.message
	})

	//@ts-ignore
	events.addEventListener("emojis:set", handleEmojiSet)
	//@ts-ignore
	events.addEventListener("emojis:delete", handleDocDelete)

	renderEmojiEls(emojisMap, emojisWrap)
}
init()
