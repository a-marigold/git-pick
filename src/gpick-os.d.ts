declare module 'gpick-os' {
	export const exec: (cmd: string[]) => { stdout: string; stderr: string };
}

export {};
