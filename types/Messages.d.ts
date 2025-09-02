export type Message = {
	_id: string
	_rev: string
	message: string
}
export type MessageSet = CustomEvent<Message>
export type MessageDelete = CustomEvent<string>

export type NewMessage = {
  _id?: string
	message: string
}

export type MessagesChangeEvent = CustomEvent<Map<string, Message>>