import { exit } from 'std';

import { add, help, status } from './commands';
import { GIT_GET_DIR_CMD, GIT_STATUS_CMD, STATUS_RESULT_PATH } from './constants';
import { spawnCmdErr, spawnCmdOut } from './utils';
/**
 * @param argv The first arg must be script name.
 */

export const init = async (argv: string[]): Promise<void> => {
	if (argv.length === 1) {
		print(help());

		exit(2);
	}
	const command = argv[1];

	if (command === 'status') {
		const gitStatusResult = await spawnCmdOut(GIT_STATUS_CMD);
		const gitStatusError = gitStatusResult[1];

		if (gitStatusError) {
			print(gitStatusError);

			exit(1);
		}

		const { paths, output } = status(gitStatusResult[0]);

		const gitDirResult = await spawnCmdOut(GIT_GET_DIR_CMD);

		const gitDirError = gitDirResult[1];

		if (gitDirError) {
			print(gitDirError);

			exit(1);
		}

		await tjs.writeFile(
			// slice not to include `\n`
			gitDirResult[0].slice(0, -1) + STATUS_RESULT_PATH,
			paths,
		);

		print(output);

		exit(0);
	}

	if (command === 'add') {
		const gitDirResult = await spawnCmdOut(GIT_GET_DIR_CMD);

		const gitDirError = gitDirResult[1];

		if (gitDirError) {
			print(gitDirError);

			exit(1);
		} else {
			const paths = new TextDecoder()
				.decode(await tjs.readFile(gitDirResult[0] + STATUS_RESULT_PATH))
				.split(',');

			const { cmd, error: addError } = add(argv, 2, paths);

			if (addError) {
				print(addError);

				exit(2);
			} else {
				const gitAddError = (await spawnCmdErr(cmd))[0];

				if (gitAddError) {
					print(gitAddError);

					exit(1);
				} else {
					exit(0);
				}
			}
		}
	}

	if (command === '-h') {
		print(help());

		exit(0);
	}

	print('Unknown command.\n\n' + help());

	exit(2);
};
