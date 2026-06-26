import { status } from './commands';
import { GIT_STATUS_COMMAND, HELP_TEXT } from './constants';

const argv = tjs.args;

if (argv.length === 1) {
	console.log(HELP_TEXT);

	tjs.exit(1);
}

const command = argv[1];
if (command === 'status') {
	const { stdout, stderr, wait } = tjs.spawn(GIT_STATUS_COMMAND, {
		stdout: 'pipe',
		stderr: 'pipe',
	});

	Promise.all([
		(stdout as tjs.ProcessReadableStream).text(),

		(stderr as tjs.ProcessReadableStream).text(),

		wait(),
	]).then((result) => {
		const error = result[1];

		if (error) {
			console.log(error);

			tjs.exit(1);
		} else {
			const statusResult = status(result[0]);

			console.log(statusResult.output);

			tjs.exit(0);
		}
	});
} else if (command === '-h') {
	console.log(HELP_TEXT);
	tjs.exit(0);
} else {
	console.log('Unknown command.\n\n' + HELP_TEXT);
	tjs.exit(1);
}
