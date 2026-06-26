import { status } from './commands';
import { GIT_GET_DIR_CMD, GIT_STATUS_CMD, HELP_TEXT, STATUS_RESULT_PATH } from './constants';
import { spawnCmd } from './utils';

const argv = tjs.args;

if (argv.length === 1) {
	console.log(HELP_TEXT);

	tjs.exit(1);
}

const command = argv[1];

if (command === 'status') {
	const gitStatusResult = await spawnCmd(GIT_STATUS_CMD);

	const error = gitStatusResult[1];

	if (error) {
		console.log(error);

		tjs.exit(1);
	} else {
		const { paths, output } = status(gitStatusResult[0]);

		const gitDirResult = await spawnCmd(GIT_GET_DIR_CMD);

		const error = gitDirResult[1];

		if (error) {
			console.log(error);

			tjs.exit(1);
		} else {
			tjs.writeFile(gitDirResult[0] + STATUS_RESULT_PATH, paths);

			console.log(output);

			tjs.exit(0);
		}
	}
} else if (command === '-h') {
	console.log(HELP_TEXT);

	tjs.exit(0);
} else {
	console.log('Unknown command.\n\n' + HELP_TEXT);

	tjs.exit(1);
}
