import { BRANCH_INFO_START } from './constants';

/**
 * @param statusText Output of `git status --porcelain=v1 -b` command.
 */
export const status = (statusText: string): void => {
	const textLength = statusText.length;

	let paths: string = '';
	let output: string = '';

	/**
	 * `true` when a path of file is being parsed.
	 * `false` when code of file (e.g ` M`, `??`) is being parsed.
	 */
	let isPath: boolean = false;

	/**
	 * `true` when branch info is being parsed.
	 */
	let isBranch: boolean = true;

	let pathIndex = 0;

	let lastPathStart = 0;

	let pos = BRANCH_INFO_START;
	while (pos < textLength) {
		const char = statusText[pos];

		if (isBranch) {
			if (char === '\n') {
				output += statusText.slice(BRANCH_INFO_START, pos);
			}

			pos++;
			continue;
		}

		if (isPath) {
			if (char === '\n') {
				isPath = false;

				const path = statusText.slice(lastPathStart, pos);

				paths += path + ',';

				output += path + ' ' + pathIndex + '\n';
			}

			pos++;
			continue;
		}

		// Skip 4 symbols of the file code (e.g ` M`, `??`) and space after it

		pos += 4;

		lastPathStart = pos;
	}
};
