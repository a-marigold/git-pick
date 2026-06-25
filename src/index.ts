import { exit, popen } from 'std';

import { status } from './commands';
import { GIT_STATUS_COMMAND, HELP_TEXT } from './constants';
import { getExecFailError } from './utils';

if (scriptArgs.length === 1) {
	print(HELP_TEXT);

	exit(1);
}

const command = scriptArgs[1];

if (command === 'status') {
	const statusText = popen(GIT_STATUS_COMMAND, 'r');
	if (statusText) {
		status(statusText.readAsString());

		exit(0);
	} else {
		print(getExecFailError(command));

		exit(1);
	}
} else if (command === '-h') {
	print(HELP_TEXT);

	exit(0);
} else {
	print('Unknown command.\n\n' + HELP_TEXT);
	exit(1);
}
