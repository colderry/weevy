export function findExport (file: any, expect: string): any {
	if (file === undefined) {
		return false;
	}

	let exp = false;

	if (typeof file.default === expect) {
		exp = file.default;
	} else if (typeof file === expect) {
		exp = file;
	}

	return exp;
}