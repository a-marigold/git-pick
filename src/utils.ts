/**
 * @param command Command that failed execution (e.g `git status`)
 *
 * @returns `'Failed to execute: ${command}'`.
 */
export const getExecFailError = (command: string): `Failed to execute: ${string}` =>
	('Failed to execute: ' + command) as ReturnType<typeof getExecFailError>;
