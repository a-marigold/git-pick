// TODO: max path's len

import { ANSI_GREEN, ANSI_RED, ANSI_RESET, BRANCH_INFO_START } from './constants';

/**
 * @param statusText Output of `git status --porcelain=v1 -b` command.
 */
export const status = (statusText: string): void => {
	const textLength = statusText.length;

	const filesStart = statusText.indexOf('\n') + 1; // add 1 to skip `\n` char
	let output = statusText.slice(BRANCH_INFO_START, filesStart);

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

			pos = pathEnd;

			continue;
		}

		if (char === 'R') {
			pos += 2;

			const pathStart = statusText.indexOf('>', pos) + 2; // add 2 to skip space
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

	output += 'staged\n' + ANSI_GREEN;

	const stagedLength = staged.length;
	for (let stagIndex = 0; stagIndex < stagedLength; stagIndex++) {
		output += ' ' + staged[stagIndex];

		stagIndex++;
		const path = staged[stagIndex];

		output += path + ' ' + pathIndex + '\n';
		paths += path + ',';
	}

	output += ANSI_RESET + 'unstaged\n' + ANSI_RED;

	const unstagedLength = unstaged.length;
	for (let unstagIndex = 0; unstagIndex < unstagedLength; unstagIndex++) {
		output += ' ' + unstaged[unstagIndex];
		unstagIndex++;
		const path = unstaged[unstagIndex];

		output += path + ' ' + pathIndex + '\n';
		paths += path + ',';
	}

	output += ANSI_RESET + 'untracked\n' + ANSI_RED;

	const untrackedLength = untracked.length;
	for (let untrackIndex = 0; untrackIndex < untrackedLength; untrackIndex++) {
		const path = untracked[untrackIndex];

		output += path + ' ' + pathIndex + '\n';
		paths += path + ',';
	}
};
