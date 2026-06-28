import {
	ANSI_GREEN,
	ANSI_RED,
	ANSI_RESET,
	BRANCH_INFO_START,
	A__STATUS,
	M__STATUS,
	D__STATUS,
	R__STATUS,
	AU_STATUS,
	AA_STATUS,
	DD_STATUS,
	DU_STATUS,
	UU_STATUS,
	UA_STATUS,
	UD_STATUS,
	NULL_TERMINATOR,
} from './constants';
import type { AddResult, StatusResult } from './types';

/**
 *
 *
 *
 *
 *
 * @param statusText Output of `git status --porcelain=v1 -b` command.
 */
export const status = (statusText: string): StatusResult => {
	const textLength = statusText.length;

	const branchEnd = statusText.indexOf(NULL_TERMINATOR);

	let output = statusText.slice(BRANCH_INFO_START, branchEnd) + '\n\n';

	const staged: string[] = [];
	const unstaged: string[] = [];
	const untracked: string[] = [];
	const unmerged: string[] = [];

	let pos = branchEnd + 1;
	while (pos < textLength) {
		const char = statusText[pos];

		if (char === '?') {
			pos += 3;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);
			untracked.push(statusText.slice(pos, pathEnd));

			pos = pathEnd + 1;

			continue;
		}
		pos++;

		const nextChar = statusText[pos];

		if (char === ' ') {
			pos += 2;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);

			unstaged.push(
				nextChar === 'M' ? M__STATUS : D__STATUS,
				statusText.slice(pos, pathEnd),
			);

			pos = pathEnd + 1;

			continue;
		}

		if (char === 'M') {
			pos += 2;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);
			const path = statusText.slice(pos, pathEnd);

			staged.push(M__STATUS, path);
			if (nextChar === 'M') {
				unstaged.push(M__STATUS, path);
			}

			pos = pathEnd + 1;

			continue;
		}

		if (char === 'A') {
			pos += 2;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);
			const path = statusText.slice(pos, pathEnd);

			if (nextChar === 'U') {
				unmerged.push(AU_STATUS, path);
			} else if (nextChar === 'A') {
				unmerged.push(AA_STATUS, path);
			} else {
				staged.push(A__STATUS, path);

				if (nextChar === 'M') {
					unstaged.push(M__STATUS, path);
				}
			}

			pos = pathEnd + 1;

			continue;
		}

		if (char === 'D') {
			pos += 2;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);

			const path = statusText.slice(pos, pathEnd);

			if (nextChar === ' ') {
				unstaged.push(D__STATUS, path);
			} else {
				unmerged.push(nextChar === 'D' ? DD_STATUS : DU_STATUS, path);
			}

			pos += pathEnd + 1;

			continue;
		}

		if (char === 'U') {
			pos += 2;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);
			const path = statusText.slice(pos, pathEnd);

			unmerged.push(
				nextChar === 'U'
					? UU_STATUS
					: nextChar === 'A'
						? UA_STATUS
						: UD_STATUS,
				path,
			);
		}

		if (char === 'R') {
			pos += 2;

			const pathStart = statusText.indexOf(NULL_TERMINATOR, pos) + 1;
			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pathStart);

			const path = statusText.slice(pathStart, pathEnd);

			staged.push(R__STATUS, path);
			if (nextChar === 'M') {
				unstaged.push(M__STATUS, path);
			}
			pos = pathEnd + 1;

			continue;
		}

		if (nextChar === ' ') {
			pos += 2;

			const pathEnd = statusText.indexOf(NULL_TERMINATOR, pos);

			staged.push(
				char === 'M' ? M__STATUS : M__STATUS,

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
		output += 'staged:\n' + ANSI_GREEN;

		for (let stagIndex = 0; stagIndex < stagedLength; stagIndex++) {
			output += staged[stagIndex];

			stagIndex++;
			const path = staged[stagIndex];

			output += path + ' ' + pathIndex + '\n';
			paths += path + ',';

			pathIndex++;
		}

		output += ANSI_RESET + '\n';
	}

	const unstagedLength = unstaged.length;
	if (unstagedLength) {
		output += 'unstaged:\n' + ANSI_RED;

		for (let unstagIndex = 0; unstagIndex < unstagedLength; unstagIndex++) {
			output += unstaged[unstagIndex];

			unstagIndex++;
			const path = unstaged[unstagIndex];

			output += path + ' ' + pathIndex + '\n';

			paths += path + ',';

			pathIndex++;
		}

		output += ANSI_RESET + '\n';
	}

	const untrackedLength = untracked.length;
	if (untrackedLength) {
		output += 'untracked:\n' + ANSI_RED;

		for (let untrackIndex = 0; untrackIndex < untrackedLength; untrackIndex++) {
			const path = untracked[untrackIndex];

			output += path + ' ' + pathIndex + '\n';
			paths += path + ',';

			pathIndex++;
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
 *
 *
 *
 *
 *
 *
 *
 *
 * @param argv `argv` of process. It is not a prepared mapping for performance.
 * @param pathsArgvStart Index in `argv` from which to start paths handling. Used to skip non contentfull args.
 * @param paths Array with paths received from {@link status} command.
 *
 * @returns {AddResult} {@link AddResult}.
 */
export const add = (argv: typeof tjs.args, pathsArgvStart: number, paths: string[]): AddResult => {
	const cmd: AddResult['cmd'] = ['git', 'add', '--'];

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
