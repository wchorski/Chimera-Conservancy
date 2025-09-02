/**
 * @typedef {import('./types/Emoji').Emoji} Emoji
 * @typedef {import('./types/Response').Response} Response
 * @typedef {import('./types/RemoveObject').RemoveObject} RemoveObject
 * @typedef {import('./types/Emoji').NewEmoji} NewEmoji
 * @typedef {import('./types/Messages').Message} Message
 * @typedef {import('./types/Messages').NewMessage} NewMessage
 * @typedef {import('./types/PouchDBChange').PouchDBChange} PouchDBChange
 */
// console.log("db connected")
import { ENVS } from "./envs.js"
import { events } from "./events.js"
/**@type {HTMLFormElement|null} */
const emojiForm = document.forms.namedItem("saveForm")

// const faceSVG = document.getElementById("face-svg")
//? https://pouchdb.com/getting-started.html

if (!ENVS) throw new Error("check envs.js file")
const {
	DB_PROTOCOL,
	DB_USER,
	DB_PASSWORD,
	DB_COLLECTION,
	DB_URL,
	DB_COLLECTION_MESSAGES,
} = ENVS

const syncDom = document.querySelector("#sync-state")

const dbEmoji = new PouchDB(DB_COLLECTION, {
	//? creates database on remote CouchDB if none exists
	skip_setup: false,
	// TODO change to auth here for better readablility
	// auth: { username: DB_USER, password: DB_PASSWORD },
})
const dbMessages = new PouchDB(DB_COLLECTION_MESSAGES)
const remoteDbUrl = `${DB_PROTOCOL}://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_COLLECTION}`
const remoteDBMessages = `${DB_PROTOCOL}://${DB_USER}:${DB_PASSWORD}@${DB_URL}/${DB_COLLECTION_MESSAGES}`
const opts = { live: true, retry: true }
// /** @type {Message[]} */
// export let allMessages = []
/** @type {Map<string, Message>} */
export const messagesMap = new Map()
/** @type {Map<string, Emoji>} */
export const emojisMap = new Map()

// TODO have client login to play game
// // Client logs in with username/password
// async function login(username, password) {
//   const response = await fetch('https://couchdb.mydomain.site/_session', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ name: username, password: password })
//   });
//   // CouchDB returns a session cookie
//   return response.json();
// }

//? https://pouchdb.com/api.html#sync
// do one way, one-off sync from the server until completion
dbEmoji.replicate
	.from(remoteDbUrl)
	.on("complete", function (info) {
		// then two-way, continuous, retriable sync
		syncDom?.setAttribute("data-sync-state", "connected")
		syncDom?.setAttribute("title", `cloud sync: ${"connected"}`)
		dbEmoji
			.sync(remoteDbUrl, opts)
			//typescript no like
			// .on("change", onSyncChange)
			.on("paused", onSyncPaused)
			.on("error", onSyncError)
	})
	.on("error", onSyncError)

dbMessages.replicate
	.from(remoteDBMessages)
	.on("complete", function (info) {
		// then two-way, continuous, retriable sync
		syncDom?.setAttribute("data-sync-state", "connected")
		syncDom?.setAttribute("title", `cloud sync: ${"connected"}`)
		dbMessages
			.sync(remoteDBMessages, opts)
			//typescript no like
			// .on("change", onSyncChange)
			.on("paused", onSyncPaused)
			.on("error", onSyncError)
	})
	.on("error", onSyncError)

/**
 * @param {Message} doc
 */
async function updateMessage(doc) {
	try {
		await dbMessages.remove(doc)
	} catch (error) {
		console.error("Error deleting todo:", error)
		alert("Failed to delete todo. Please try again.")
	}
}

dbMessages
	.changes({
		since: "now",
		live: true,
		include_docs: true,
	})
	.on("change", (change) => {
		const { id, deleted, doc } = change

		if (deleted) {
			messagesMap.delete(id)
			events.dispatchEvent(
				new CustomEvent("messages:delete", { detail: change.id })
			)
		} else {
			messagesMap.set(id, doc)
			events.dispatchEvent(
				new CustomEvent("messages:set", { detail: change.doc })
			)
		}

		// react to both delete and update
		events.dispatchEvent(
			new CustomEvent("messages:change", { detail: messagesMap })
		)
	})

dbEmoji
	.changes({
		since: "now",
		live: true,
		include_docs: true,
	})
	.on("change", (change) => {
		const { id, deleted, doc } = change

		if (deleted) {
			emojisMap.delete(id)
			events.dispatchEvent(
				new CustomEvent("emojis:delete", { detail: change.id })
			)
		} else {
			emojisMap.set(id, doc)
			events.dispatchEvent(
				new CustomEvent("emojis:set", { detail: change.doc })
			)
		}

		// react to both delete and update
		events.dispatchEvent(
			new CustomEvent("emojis:change", { detail: emojisMap })
		)
	})

// /**@param {PouchDBChange} data */
// function onSyncChange(data) {
// 	syncDom?.setAttribute("data-sync-state", "syncing")
// }
function onSyncPaused() {
	// console.log("onSyncPaused")
	syncDom?.setAttribute("data-sync-state", "paused")
	syncDom?.setAttribute("title", `cloud sync: ${"idle"}`)
}

/**
 *  @param {any} error
 *  @return {void}
 */
function onSyncError(error) {
	if (error) {
		syncDom?.setAttribute("data-sync-state", "error")
		syncDom?.setAttribute("title", `cloud sync: ${"error"}`)
		// console.log("DB SYNC ERROR: ", error)
	}
}

/**
 * Retrieves all documents from the database
 * @returns {Promise<Emoji[]|undefined>} Array of document objects
 */
export async function getAllEmojiDocs() {
	try {
		const res = await dbEmoji.allDocs({ include_docs: true })

		res.rows.forEach((row) => {
			emojisMap.set(row.id, row.doc)
		})

		return res.rows.map((row) => row.doc)
	} catch (error) {
		console.log("dbEmoji.js getAllEmojiDocs: ", error)
	}
}
/**
 * Retrieves all documents from the database
 * @returns {Promise<Message[]|undefined>} Array of document objects
 */
export async function getAllMessageDocs() {
	try {
		const res = await dbMessages.allDocs({ include_docs: true })

		res.rows.forEach((row) => {
			messagesMap.set(row.id, row.doc)
		})

		return res.rows.map((row) => row.doc)
	} catch (error) {
		console.log("db.js getAllMessageDocs: ", error)
	}
}
// getAllDocs()

//? Emoji form submit
emojiForm?.addEventListener("submit", async (e) => {
	e.preventDefault()

	//@ts-ignore
	const data = Object.fromEntries(new FormData(e.target))
	const { name } = data
	// TODO validate string min max
	if (!name) throw new Error("name field empty")
	// const svg = formData.get('svg');
	// console.log(window.faceSVG);
	const clonedSVG = document.getElementById("face-svg")?.cloneNode(true)
	if (!clonedSVG) throw new Error("Face SVG not found")
	if (!(clonedSVG instanceof SVGElement))
		throw new Error("Element is not an SVG")

	// Your logic here
	// console.log("Form submitted:", name)
	try {
		const point = await createEmojiPoint(name, clonedSVG)
		//? use put if creating a custom id (must be unique)
		// const res = await db.put(point)
		const res = await dbEmoji.post(point)

		if (!res.ok) throw new Error("emoji form save res not OK")
		// console.log("pouchdb ok: ", res.ok)
		const newPoint = {
			...point,
			_id: res.id,
			_rev: res.rev,
		}
		// renderSVG(point.svg)
		emojiForm.reset()
		return newPoint

		// console.log(res)
	} catch (error) {
		console.log("createEmoji error: ", error)
	}
})

/**
 *
 * @param {Emoji[]} docs
 */
async function dbCreateManyEmojis(docs) {
	try {
		const result = await dbEmoji.bulkDocs(docs)
		console.log(result)
	} catch (err) {
		console.log(err)
	}
}

/**
 *  @param {string} name
 *  @param {SVGElement} svg
 */
async function createEmojiPoint(name, svg) {
	// 1. remove id
	svg.removeAttribute("id")
	// 2. add style from `parts.css` as <def> <style> in svg
	const css = await fetchCSS("/parts.css")
	let defs = svg.querySelector("defs")
	if (!defs) {
		defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
		svg.insertBefore(defs, svg.firstChild)
	}
	const style = document.createElementNS("http://www.w3.org/2000/svg", "style")
	style.setAttribute("type", "text/css")
	style.textContent = css
	defs.appendChild(style)
	const svgString = new XMLSerializer().serializeToString(svg)

	/** @type {NewEmoji} */
	const point = {
		//? if using put instead of post set _id
		// _id: new Date().toISOString(),
		date: new Date().toISOString(),
		name,
		svg: svgString,
	}

	if (!point.date || !point.name || !point.svg)
		throw new Error("data is not correct model shape")

	return point
}

/**
 *  @param {string} message
 */
export async function createMessage(message) {
	// POST to db
	/** @type {NewMessage} */
	const point = {
		message,
	}

	if (!point.message) throw new Error("data is not correct model shape")

	try {
		const res = await dbMessages.post(point)

		if (!res.ok) throw new Error("createMessage form save res not OK")

		// console.log("pouchdb ok: ", res.ok)
		const newPoint = {
			...point,
			_id: res.id,
			_rev: res.rev,
		}
		return newPoint
	} catch (error) {
		console.log("createMessage error: ", error)
	}
}

// /** @param {string} svg  */
// function renderSVG(svg) {
// 	const parser = new DOMParser()
// 	const doc = parser.parseFromString(svg, "image/svg+xml")
// 	const svgElement = doc.documentElement

// 	if (svgElement.tagName === "svg") {
// 		// Insert into DOM safely
// 		document.getElementById("emojis-wrap")?.appendChild(svgElement)
// 	}
// }

/**
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
async function fetchCSS(url) {
	const response = await fetch(url)
	if (!response.ok) throw new Error("Failed to fetch CSS")
	return await response.text()
}

/**
 * @param {RemoveObject} doc
 */
export async function deleteMessage(doc) {
	try {
		const res = await dbMessages.remove(doc)
		if (!res.ok) throw new Error("deleteMessage res is not OK")
	} catch (error) {
		throw new Error("deleteMessage failed", { cause: error })
	}
}
/**
 * @param {RemoveObject} doc
 */
export async function deleteEmoji(doc) {
	try {
		const res = await dbEmoji.remove(doc)
		if (!res.ok) throw new Error("dbEmoji res is not OK")
	} catch (error) {
		throw new Error("dbEmoji failed", { cause: error })
	}
}

export async function dbSeedDatabase() {
	try {
		/**
		 * @param {string} url
		 * @returns {Promise<Array<NewEmoji | NewMessage>>}
		 */
		const fetchAndProcess = async (url) => {
			const response = await fetch(url)
			/** @type {Array<Emoji | Message>} */
			const docs = await response.json()
			return docs.map(({ _rev, ...data }) => data)
		}

		/**
		 * @param {any[]} results
		 * @returns {number}
		 */
		const countErrors = (results) =>
			results.reduce((count, obj) => count + (obj.error ? 1 : 0), 0)
		/**
		 * @param {any[]} results
		 * @returns {boolean}
		 */
		const hasErrors = (results) => results.some((obj) => obj.error === true)

		const [emojiDocs, messageDocs] = await Promise.all([
			fetchAndProcess("/public/ini/emojis-seed.json"),
			fetchAndProcess("/public/ini/messages-seed.json"),
		])

		const [emojiRes, messagesRes] = await Promise.all([
			dbEmoji.bulkDocs(emojiDocs),
			dbMessages.bulkDocs(messageDocs),
		])

		if (hasErrors(emojiRes) || hasErrors(messagesRes)) {
			const emojiErrors = countErrors(emojiRes)
			const messageErrors = countErrors(messagesRes)

			throw new Error(
				`🌱 Database already (or partially) seeded with data.\n` +
					`Emoji errors: ${emojiErrors}/${emojiRes.length}, ` +
					`Message errors: ${messageErrors}/${messagesRes.length}`
			)
		}

		return {
			ok: true,
			message: `Database seeded with ${messagesRes.length} messages and ${emojiRes.length} emojis`,
		}
	} catch (error) {
		return {
			error: true,
			message: error instanceof Error ? error.message : String(error),
		}
	}
}

/**
 * Seeds the database with emoji data
 * @param {Emoji[]} docs
 * @returns {Promise<Response>} The result of the seeding operation
 */
export async function dbEmojiDeleteMany(docs) {
	try {
		const res = await dbEmoji.bulkDocs(
			docs.map((doc) => ({ ...doc, _deleted: true }))
		)
		// if(!res) throw new Error('db delete res not OK')
		return {
			ok: true,
			message: "All Emoji Docs have been marked as _deleted",
		}
	} catch (error) {
		console.log(error)
		// const seedError = new Error("seedDatabase failed", { cause: error })
		// console.error(seedError)
		return {
			error: true,
			message:
				error instanceof Error ? "Database not found" : "Database not found",
		}
	}
}
/**
 * @param {Message[]} docs
 * @returns {Promise<Response>}
 */
export async function dbMessageDeleteMany(docs) {
	console.log(docs)
	try {
		const res = await dbMessages.bulkDocs(
			docs.map((doc) => ({ ...doc, _deleted: true }))
		)
		// if(!res.ok) throw new Error('db delete res not OK')
		return {
			ok: true,
			message: "All Message Docs have been marked as _deleted",
		}
	} catch (error) {
		console.log(error)
		return {
			error: true,
			message:
				error instanceof Error ? "Database not found" : "Database not found",
		}
	}
}
/**
 *
 * @param {Emoji[]} emojiDocs
 * @param {Message[]} messageDocs
 */
export async function dbDeleteAllDocs(emojiDocs, messageDocs) {
	try {
		await dbEmojiDeleteMany(emojiDocs)
		await dbMessageDeleteMany(messageDocs)
		return {
			ok: true,
			message: "Database: All Docs have been marked as _deleted",
		}
	} catch (error) {
		console.log(error)
		return {
			error: true,
			message:
				error instanceof Error ? "Database not found" : "Database not found",
		}
	}
}

/**
 * @returns {Promise<Response>}
 */
export async function dbEmojiDestroy() {
	try {
		const res = await dbEmoji.destroy()
		return {
			ok: true,
			message: "Database has been destroyed",
		}
	} catch (error) {
		console.log(error)
		return {
			error: true,
			message:
				error instanceof Error ? "Database not found" : "Database not found",
		}
	}
}
