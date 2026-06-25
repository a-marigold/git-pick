import { BRANCH_INFO_START } from './constants';

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

		if (char === ' ') {
			pos++;
			unstaged.push(statusText[pos] === 'M' ? 'mod: ' : 'del: ');

			pos += 3;

			continue;
		}

		if (char === '?') {
			pos += 3;

			const pathEnd = statusText.indexOf('\n', pos);
			untracked.push(statusText.slice(pos, pathEnd));

			pos = pathEnd + 1;

			continue;
		}

		pos++;

		const nextChar = statusText[pos];

		if (char === 'A') {
			pos += 2;
			const pathEnd = statusText.indexOf('\n', pos);

			const path = statusText.slice(pos, pathEnd);

			staged.push('new: ', path);
			if (char === 'M') {
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
};
