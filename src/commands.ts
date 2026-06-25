import { popen, exit } from 'std';

import { BRANCH_INFO_START, CharCode } from './constants';

export const status = (): void => {
	const gitStatusPipe = popen('git status --porcelain=v1 -b', {});

	if (!gitStatusPipe) {
		print('Failed to execute: git status');

		return exit(1);
	}

	const statusText = gitStatusPipe.readAsString();

	const textLength = statusText.length;

	let paths: string = '';
	let output: string = '';

	/**
	 * `true` when a path of file is being parsed.
	 *
	 * `false` when state of file is being parsed.
	 */
	let isPath: boolean = false;

	/**
	 * `true` when branch info is being parsed.
	 */

	let isBranch: boolean = true;

	let lastPathStart = 0;

	let pos = BRANCH_INFO_START;
	while (pos < textLength) {
		const charCode = statusText.charCodeAt(pos);

		if (isBranch) {
			if (charCode === CharCode['\n']) {
				output += statusText.slice(BRANCH_INFO_START, pos);
			}
			pos++;

			continue;
		}

		if (isPath) {
			if (charCode === CharCode['\n']) {
				isPath = false;

				const path = statusText.slice(lastPathStart, pos);

				paths += path + ',';

				output += path + '\n';
			}

			pos++;

			continue;
		}

		// Skip 4 symbols of the two file codes (e.g ` M`, `??`) and space after them
		pos += 4;

		lastPathStart = pos;
	}
};
