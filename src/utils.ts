/**
 * #### Result includes promise of {@link tjs.Process.wait}, so child process is guaranted to exit.
 *
 * @param cmd Command with arts to be executed.
 *
 * @returns Promise with tuple: first element is text of `stdout`, second is text of `stderr` and third is {@link tjs.ProcessStatus}.
 */
export const spawnCmdOut = (cmd: string[]): Promise<[string, string, tjs.ProcessStatus]> => {
	const { stdout, stderr, wait } = tjs.spawn(cmd, { stdout: 'pipe', stderr: 'pipe' });

	return Promise.all([
		(stdout as tjs.ProcessReadableStream).text(),

		(stderr as tjs.ProcessReadableStream).text(),

		wait(),
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
	const { stderr, wait } = tjs.spawn(cmd, { stderr: 'pipe' });

	return Promise.all([(stderr as tjs.ProcessReadableStream).text(), wait()]);
};
