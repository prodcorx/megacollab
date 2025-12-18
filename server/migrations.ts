import type { QueryHandler } from './database'

export type Migration = {
	id: number
	name: string
	func: (query: QueryHandler) => Promise<void>
}

const USERS_TABLE = 'megacollab_users' as const
const AUDIOFILES_TABLE = 'megacollab_audiofiles' as const
const CLIPS_TABLE = 'megacollab_clips' as const
const TRACKS_TABLE = 'megacollab_tracks' as const

/**
 * These happen top to bottom
 * New ones go at the bottom yes!
 */
export const migrations: Migration[] = [
	{
		id: 1,
		name: 'initial_schema',
		func: async (queryFn) => {
			await queryFn(`
                CREATE TABLE IF NOT EXISTS ${USERS_TABLE} (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    display_name TEXT NOT NULL,
			        color TEXT NOT NULL,
			        roles TEXT[] NOT NULL DEFAULT '{regular}' CHECK (array_length(roles, 1) >= 1)
                )`)

			await queryFn(`
                CREATE TABLE IF NOT EXISTS ${AUDIOFILES_TABLE} (
                    id TEXT PRIMARY KEY,
                    creator_user_id TEXT NOT NULL REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    file_name TEXT NOT NULL,
                    public_url TEXT NOT NULL,
                    duration DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    color TEXT NOT NULL
                )`)

			await queryFn(`
                CREATE TABLE IF NOT EXISTS ${TRACKS_TABLE} (
                    id TEXT PRIMARY KEY,
                    creator_user_id TEXT NOT NULL REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    belongs_to_user_id TEXT REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    title TEXT,
                    order_index INTEGER NOT NULL,
                    gain_db DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )`)

			await queryFn(`
                CREATE TABLE IF NOT EXISTS ${CLIPS_TABLE} (
                    id TEXT PRIMARY KEY,
                    track_id TEXT NOT NULL REFERENCES ${TRACKS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    audio_file_id TEXT NOT NULL REFERENCES ${AUDIOFILES_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    creator_user_id TEXT NOT NULL REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    start_beat DOUBLE PRECISION NOT NULL,
                    end_beat DOUBLE PRECISION NOT NULL,
                    offset_seconds DOUBLE PRECISION NOT NULL,
                    gain_db DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )`)
		},
	},
	{
		id: 2,
		name: 'add_tracks_table',
		func: async (queryFn) => {
			await queryFn(`
                CREATE TABLE IF NOT EXISTS ${TRACKS_TABLE} (
                    id TEXT PRIMARY KEY,
                    creator_user_id TEXT NOT NULL REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    belongs_to_user_id TEXT REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    title TEXT,
                    order_index INTEGER NOT NULL,
                    gain_db DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )`)
		},
	},
	{
		id: 3,
		name: 'add_clips_table',
		func: async (queryFn) => {
			await queryFn(`
                CREATE TABLE IF NOT EXISTS ${CLIPS_TABLE} (
                    id TEXT PRIMARY KEY,
                    track_id TEXT NOT NULL REFERENCES ${TRACKS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    audio_file_id TEXT NOT NULL REFERENCES ${AUDIOFILES_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    creator_user_id TEXT NOT NULL REFERENCES ${USERS_TABLE}(id) ON DELETE CASCADE ON UPDATE CASCADE,
                    start_beat DOUBLE PRECISION NOT NULL,
                    end_beat DOUBLE PRECISION NOT NULL,
                    offset_seconds DOUBLE PRECISION NOT NULL,
                    gain_db DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )`)
		},
	},
]
