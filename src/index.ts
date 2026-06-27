import { add, status } from './commands';
import { GIT_GET_DIR_CMD, GIT_STATUS_CMD, HELP_TEXT, STATUS_RESULT_PATH } from './constants';
import { spawnCmdErr, spawnCmdOut } from './utils';

/**
 * @param argv The first arg must be script name.
 */
export const init = async (argv: typeof tjs.args): Promise<void> => {
	if (argv.length === 1) {
		console.log(HELP_TEXT);

		tjs.exit(1);
	}

	const command = argv[1];
	if (command === 'status') {
		const gitStatusResult = await spawnCmdOut(GIT_STATUS_CMD);
		const gitStatusError = gitStatusResult[1];

		if (gitStatusError) {
			console.log(gitStatusError);

			tjs.exit(1);
		} else {
			const { paths, output } = status(gitStatusResult[0]);

			const gitDirResult = await spawnCmdOut(GIT_GET_DIR_CMD);

			const gitDirError = gitDirResult[1];

			if (gitDirError) {
				console.log(gitDirError);

				tjs.exit(1);
			} else {
				tjs.writeFile(gitDirResult[0] + STATUS_RESULT_PATH, paths);

				console.log(output);

				tjs.exit(0);
			}
		}
	} else if (command === 'add') {
		const gitDirResult = await spawnCmdOut(GIT_GET_DIR_CMD);

		const gitDirError = gitDirResult[1];

		if (gitDirError) {
			console.log(gitDirError);

			tjs.exit(1);
		} else {
			const paths = new TextDecoder()
				.decode(await tjs.readFile(gitDirResult[0] + STATUS_RESULT_PATH))

				.split(',');

			const { cmd, error: addError } = add(argv, 2, paths);

			if (addError) {
				console.log(addError);

				tjs.exit(1);
			} else {
				const gitAddError = (await spawnCmdErr(cmd))[0];

				if (gitAddError) {
					console.log(gitAddError);

					tjs.exit(1);
				} else {
					tjs.exit(0);
				}
			}
		}
	} else if (command === '-h') {
		console.log(HELP_TEXT);

		tjs.exit(0);
	} else {
		console.log('Unknown command.\n\n' + HELP_TEXT);

		tjs.exit(1);
	}
};

init(tjs.args);
