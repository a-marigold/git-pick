/**
 * #### Result includes promise of {@link tjs.Process.wait}, so child process is guaranted to exit.
 *
 * @param cmd Command with arts to be executed.
 *
 * @returns Promise with tuple: first element is text of `stdout`, second is text of `stderr` and third is {@link tjs.ProcessStatus}.
 *
 */

export const spawnCmdOut = (cmd: string[]): Promise<[string, string, tjs.ProcessStatus]> => {
	const process = tjs.spawn(cmd, { stdout: 'pipe', stderr: 'pipe' });

	return Promise.all([
		(process.stdout as tjs.ProcessReadableStream).text(),

		(process.stderr as tjs.ProcessReadableStream).text(),

		process.wait(),
	]);
};

/**
 * #### Result includes promise of {@link tjs.Process.wait}, so child process is guaranted to exit.
 *
 * #### Unlike {@link spawnCmdOut}, does not handle `stdout`.
 *
 * @param cmd
 *
 * @returns Promise with tuple: first element is text of `stderr`, second is {@link tjs.ProcessStatus}.
 */
export const spawnCmdErr = (cmd: string[]): Promise<[string, tjs.ProcessStatus]> => {
	const process = tjs.spawn(cmd, { stderr: 'pipe' });

	return Promise.all([(process.stderr as tjs.ProcessReadableStream).text(), process.wait()]);
};

/**
 * @param code
 *
 * @returns `code` wrapped in ANSI styles to create markdown-like inline code effect.s
 */
export const styleInlineCode = (code: string) =>
	'\x1b[2m\x1b[59m\x1b[37m' + code + '\x1b[39m\x1b[49m\x1b[22m';
