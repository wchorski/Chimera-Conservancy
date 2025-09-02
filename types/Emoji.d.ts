export type Emoji = {
	_id: string
	_rev: string
	name: string
	svg: string
	date: string
}

export type NewEmoji = {
	_id?: string
	name: string
	svg: string
	date: string
}

export type EmojiSet = CustomEvent<Emoji>
