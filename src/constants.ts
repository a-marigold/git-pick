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
 *
 * Position in output of `git status --porcelain -b -z` when branch info starts.
 */
export const BRANCH_INFO_START = 3;

export const ANSI_RESET = '\x1b[0m';

export const ANSI_RED = '\x1b[31m';
export const ANSI_GREEN = '\x1b[32m';

/**
 *
 * Path to file in `.git` directory of repository where result of `status` command is saved.
 */

export const STATUS_RESULT_PATH = '/info/.gpick';

// --- Statuses of files printed by `status` command ---
// Double `_` means space (e.g M__STATUS is `M `).
export const A__STATUS = ' new:          ';
export const M__STATUS = ' mod:          ';
export const D__STATUS = ' del:          ';
export const R__STATUS = ' rename:       ';

export const AU_STATUS = ' new by us:    ';
export const AA_STATUS = ' both new:     ';

export const DD_STATUS = ' both del:     ';
export const DU_STATUS = ' del by us:    ';

export const UU_STATUS = ' both mod:     ';
export const UA_STATUS = ' new by them:  ';
export const UD_STATUS = ' del by them:  ';
