export const HELP_TEXT = `usage:
 -h\tPrint help --- gpick -h
 status\tList paths to files with their indexes --- gpick status
 add\tAdd files of provided indexes to staging area --- gpick add 1 2 3`;

/**
 * Used with `exec` to provide status info to `status` command.
 */
export const GIT_STATUS_CMD = ['git', 'status', '--porcelain=v1', '-b'];

/**
 * Outputs path to `.git` dir.
 *
 */

export const GIT_GET_DIR_CMD = ['git', 'rev-parse', '--git-dir'];

/**
 * Position in output of `git status --porcelain -b` when branch info starts.
 */
export const BRANCH_INFO_START = 3;

export const ANSI_RESET = '\x1b[0m';

export const ANSI_RED = '\x1b[31m';
export const ANSI_GREEN = '\x1b[32m';

/**
 *
 * Path to file in `.git` directory of repository where result of `status` command is saved.
 */

export const STATUS_RESULT_PATH = '/info/.gpicks';
