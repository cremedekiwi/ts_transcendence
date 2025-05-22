import { FastifySchema } from "fastify"
import User from "../../core/types.js"

export type RelationshipType = "friend" | "blocked" | null

export type UserWithRelationship = {
	id: number
	username: string
	avatar: string
	status: string
	relationship?: RelationshipType
}

export type UserData = {
	user: User
	chats: Array<any> // Replace with ChatMessage | ChatReply schema if available
	relationship: RelationshipType
}

// ---------- Reusable Schemas ----------

const errorResponseSchema = {
	type: "object",
	properties: {
		error: { type: "string" },
	},
}

const userSchema = {
	type: "object",
	properties: {
		id: { type: "number" },
		username: { type: "string" },
		avatar: { type: "string" },
		status: { type: "string" },
	},
	required: ["id", "username", "avatar", "status"],
}

const userDataSchema = {
	type: "object",
	properties: {
		user: userSchema,
		chats: {
			type: "array",
			items: { type: "object" }, // Replace with stricter Chat schema if defined
		},
		relationship: {
			type: ["string", "null"],
			enum: ["friend", "blocked", null],
		},
	},
	required: ["user", "chats", "relationship"],
}

// ---------- Route Schemas ----------

export const getAllUsersSchema: FastifySchema = {
	response: {
		200: {
			type: "array",
			items: userSchema,
		},
		500: errorResponseSchema,
	},
}

export const getUserSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^\\d+$" },
		},
		required: ["id"],
	},
	response: {
		200: userSchema,
		404: errorResponseSchema,
		500: errorResponseSchema,
	},
}

export const getCustomUserListSchema: FastifySchema = {
	response: {
		200: {
			type: "array",
			items: userSchema,
		},
		500: errorResponseSchema,
	},
}

export const getCustomUserDataSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "number" },
		},
		required: ["id"],
	},
	response: {
		200: userDataSchema,
		400: errorResponseSchema,
		500: errorResponseSchema,
	},
}

export const modifyRelationshipSchema: FastifySchema = {
	body: {
		type: "object",
		properties: {
			targetId: { type: "number" },
			relationship: {
				type: ["string", "null"],
				enum: ["friend", "blocked", null],
			},
		},
		required: ["targetId", "relationship"],
	},
	response: {
		200: {
			type: "object",
			properties: { success: { type: "boolean" } },
		},
		400: errorResponseSchema,
		401: errorResponseSchema,
	},
}

export const updateUsernameSchema: FastifySchema = {
	body: {
		type: "object",
		properties: {
			username: { type: "string", minLength: 1 },
		},
		required: ["username"],
	},
	response: {
		200: { type: "object", properties: { success: { type: "boolean" } } },
		400: errorResponseSchema,
		401: errorResponseSchema,
		500: errorResponseSchema,
	},
}

export const updateAvatarSchema: FastifySchema = {
	body: {
		type: "object",
		properties: {
			avatar: {
				type: "object",
				properties: {
					data: { type: "string" },
					mimeType: { type: "string" },
					filename: { type: "string" },
				},
				required: ["data", "mimeType", "filename"],
			},
		},
		required: ["avatar"],
	},
	response: {
		200: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				filename: { type: "string" },
			},
		},
		401: errorResponseSchema,
		500: errorResponseSchema,
	},
}

export const updatePasswordSchema: FastifySchema = {
	body: {
		type: "object",
		properties: {
			oldPassword: { type: "string", minLength: 1 },
			newPassword: { type: "string", minLength: 6 }, // Update per password policy
		},
		required: ["oldPassword", "newPassword"],
	},
	response: {
		200: { type: "object", properties: { success: { type: "boolean" } } },
		400: errorResponseSchema,
		401: errorResponseSchema,
	},
}

export const deleteUserSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^\\d+$" },
		},
		required: ["id"],
	},
	response: {
		200: { type: "object", properties: { success: { type: "boolean" } } },
		401: errorResponseSchema,
		403: errorResponseSchema,
		500: errorResponseSchema,
	},
}

export const unblockUserSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			userId: { type: "string", pattern: "^\\d+$" },
		},
		required: ["userId"],
	},
	response: {
		501: errorResponseSchema,
	},
}
