export const HELP_TEXT = `usage:
 -h\tPrint help --- gpick -h
 status\tList paths to files with their indexes --- gpick status
 add\tAdd files of provided indexes to staging area --- gpick add 1 2 3`;

export const enum CharCode {
	'\n' = 10,
	Space = 32,
	'\t' = 9,

	'M' = 77,

	'?' = 63,
}

export const GIT_STATUS_COMMAND = 'git status --porcelain=v1 -b';

/**
 * Position in output of `git status --porcelain -b` when branch info starts.
 */
export const BRANCH_INFO_START = 3;
