declare module 'gpick-os' {
	/**
	 * Creates a child process and promotes argv from `cmd` to it.
	 *
	 * Works without shell.
	 *
	 * @param cmd Array with strings, the first element is name of executable in PATH, the other are argv.
	 *
	 * @returns Object with already read `stdout` and `stderr`.
	 * @throws
	 */
	export const exec: (cmd: string[]) => { stdout: string; stderr: string };

	/**
	 *
	 * @param path Path to file (relative to cwd).
	 *
	 * @returns String with read data of file.
	 * @throws `RangeError` when file data is more that 1GB.
	 * @throws `RangeError` when heap memory is out.
	 */
	export const readFileSync: (path: string) => string;
}

export {};
