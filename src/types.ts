export type StatusResult = {
	/**
	 *
	 * String with paths divided by comma.
	 *
	 * If split this string, paths' places are identical to {@link StatusResult.output} indexes.
	 */
	paths: string;

	/**
	 * String to be shown in console.
	 */
	output: string;
};

export type AddResult<E extends string> = {
	/**
	 * Formed `git add ...paths` command to be run via `spawnCmdErr`.
	 *
	 * Empty when {@link AddResult.error} is.
	 *
	 * @example
	 * `git add ./foo.ts ./bar/qux`
	 */
	cmd: E extends '' ? [] : string[];

	/**
	 * Error appeared while validated provided indexes (argv).
	 *
	 * Empty when there is no error.
	 */
	error: E;
};
