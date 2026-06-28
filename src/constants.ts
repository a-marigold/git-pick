import { styleInlineCode } from './utils';
// TODO: add docs link
export const HELP_TEXT = `usage:
 -h      Print help.                             ${styleInlineCode('gpick -h')}
 status  List paths to files with their indexes. ${styleInlineCode('gpick status')}
 add     Add files of provided indexes           ${styleInlineCode('gpick add 1 2 3')}
         to staging area.
`;

/**
 * Used with `exec` to provide status info to `status` command.
 */
export const GIT_STATUS_CMD = ['git', 'status', '--porcelain=v1', '-b', '-z'];

/**
 * Outputs path to `.git` dir.
 *
 */

export const GIT_GET_DIR_CMD = ['git', 'rev-parse', '--git-dir'];

export const NULL_TERMINATOR = String.fromCharCode(0);

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

// --- Statuses of files printed by `status` command
export const MOD_STATUS = ' mod:     ';
export const NEW_STATUS = ' new:     ';
export const DEL_STATUS = ' del:     ';
export const REN_STATUS = ' rename:  ';
export const COP_STATUS = ' copied:  ';
