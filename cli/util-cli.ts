#!/usr/bin/env node

export function findOption(name: string, args: string[]): any {
	let val: any = undefined;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === name) {
			if (args[i + 1] && !args[i + 1].startsWith("-")) {
				val = args[i + 1]
			}
			break;
		}
	}

	return val;
}

export function findOptions (args: string[], ...options: any[]): any {
	const ob: {
		[key: string]: any
	} = {};

	[...options].forEach((opt) => {
		const val = findOption(opt, args);

		if (val && !val.startsWith("-")) {
			ob[opt] = val;
		}
	});

	return ob;
}