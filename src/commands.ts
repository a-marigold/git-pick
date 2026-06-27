import { ANSI_GREEN, ANSI_RED, ANSI_RESET, BRANCH_INFO_START } from './constants';
import type { AddResult, StatusResult } from './types';

/**
 * @param statusText Output of `git status --porcelain=v1 -b` command.
 */
export const status = (statusText: string): StatusResult => {
	const textLength = statusText.length;

	const filesStart = statusText.indexOf('\n') + 1; // add 1 to skip `\n` char
	let output = statusText.slice(BRANCH_INFO_START, filesStart) + '\n';

	const staged: string[] = [];
	const unstaged: string[] = [];
	const untracked: string[] = [];

	let pos = filesStart;
	while (pos < textLength) {
		const char = statusText[pos];

		if (char === '?') {
			pos += 3;

			const pathEnd = statusText.indexOf('\n', pos);
			untracked.push(statusText.slice(pos, pathEnd));

			pos = pathEnd + 1;

			continue;
		}

		pos++;
		const nextChar = statusText[pos];

		if (char === ' ') {
			pos += 2;

			const pathEnd = statusText.indexOf('\n', pos);

			unstaged.push(
				nextChar === 'M' ? 'mod: ' : 'del: ',
				statusText.slice(pos, pathEnd),
			);

			pos = pathEnd + 1;

			continue;
		}

		if (char === 'A') {
			pos += 2;
			const pathEnd = statusText.indexOf('\n', pos);

			const path = statusText.slice(pos, pathEnd);

			staged.push('new: ', path);
			if (nextChar === 'M') {
				unstaged.push('mod: ', path);
			}

			pos = pathEnd + 1;

			continue;
		}

		if (char === 'R') {
			pos += 2;

			const pathStart = statusText.indexOf('>', pos) + 2; // Add 2 to skip space
			const pathEnd = statusText.indexOf('\n', pathStart);

			const path = statusText.slice(pathStart, pathEnd);

			staged.push('rnm: ', path);

			if (nextChar === 'M') {
				unstaged.push('rnm: ', path);
			}

			pos = pathEnd + 1;

			continue;
		}

		if (nextChar === ' ') {
			pos += 2;

			const pathEnd = statusText.indexOf('\n', pos);
			staged.push(
				char === 'M' ? 'mod: ' : 'del: ',
				statusText.slice(pos, pathEnd),
			);

			pos = pathEnd;

			continue;
		}
	}

	let paths = '';
	let pathIndex = 0;

	const stagedLength = staged.length;
	if (stagedLength) {
		output += 'staged\n' + ANSI_GREEN;

		for (let stagIndex = 0; stagIndex < stagedLength; stagIndex++) {
			output += ' ' + staged[stagIndex];

			stagIndex++;
			const path = staged[stagIndex];

			output += path + ' ' + pathIndex + '\n';

			paths += path + ',';
		}

		output += ANSI_RESET + '\n';
	}

	const unstagedLength = unstaged.length;
	if (unstagedLength) {
		output += 'unstaged\n' + ANSI_RED;

		for (let unstagIndex = 0; unstagIndex < unstagedLength; unstagIndex++) {
			output += ' ' + unstaged[unstagIndex];
			unstagIndex++;
			const path = unstaged[unstagIndex];

			output += path + ' ' + pathIndex + '\n';
			paths += path + ',';
		}

		output += ANSI_RESET + '\n';
	}

	const untrackedLength = untracked.length;
	if (untrackedLength) {
		output += 'untracked\n' + ANSI_RED;

		for (let untrackIndex = 0; untrackIndex < untrackedLength; untrackIndex++) {
			const path = untracked[untrackIndex];

			output += path + ' ' + pathIndex + '\n';

			paths += path + ',';
		}

		output += ANSI_RESET + '\b';
	}

	return {
		paths,
		output,
	};
};

/**
 * #### Validates path indexes from `argv` and creates {@link AddResult.cmd} from them.
 *
 * @param argv `argv` of process. It is not a prepared mapping for performance.
 * @param pathsArgvStart Index in `argv` from which to start paths handling. Used to skip non contentfull args.
 * @param paths Array with paths received from {@link status} command.
 *
 * @returns {AddResult} {@link AddResult}.
 */
export const add = (argv: string[], pathsArgvStart: number, paths: string[]): AddResult<string> => {
	const cmd: AddResult<string>['cmd'] = ['git', 'add', '--'];

	const pathsLength = paths.length;

	const argvLength = argv.length;

	for (let argIndex = pathsArgvStart; argIndex < argvLength; argIndex++) {
		const arg = argv[argIndex];

		let pathStart = '"';

		let argPos = 0;
		if (arg[0] === '!') {
			argPos++;
			pathStart += '!';
		}

		const pathIndex = Number(arg.slice(argPos));

		if (pathIndex) {
			if (pathIndex < pathsLength) {
				cmd.push(pathStart + paths[pathIndex] + '"');
				continue;
			}

			return {
				cmd: [],
				error: `Index ${pathIndex} is out of maximum path index.\nMaximum path index is ${pathsLength - 1}`,
			};
		}

		return { cmd: [], error: `Invalid path index ${arg}` };
	}

	return { cmd, error: '' };
};
