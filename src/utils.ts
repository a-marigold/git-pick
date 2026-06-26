import { SPAWN_GIT_CMD_OPTIONS } from './constants';

/**
 * #### Result incldes promise of {@link tjs.Process.wait}, so child process is guaranted to exit.
 *
 * @param command Command with arts to be executed.
 *
 * @returns Tuple with promises: where first element is text of `stdout`, second is text of `stderr` and third is {@link tjs.ProcessStatus} of process.
 */
export const spawnCmd = (command: string[]): Promise<[string, string, tjs.ProcessStatus]> => {
	const { stdout, stderr, wait } = tjs.spawn(command, SPAWN_GIT_CMD_OPTIONS);

	// Assertions are not dangerous 'cause `SPAWN_GIT_CMD_OPTIONS` include `stdout` and `stderr`
	return Promise.all([
		(stdout as tjs.ProcessReadableStream).text(),

		(stderr as tjs.ProcessReadableStream).text(),

		wait(),
	]);
};
