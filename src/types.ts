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
