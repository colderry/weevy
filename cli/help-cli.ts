function logCommand (name: string, desc: string) {
	console.log(`    ${name}`, `=> ${desc}`);
}

export default function help(exec: string) {
	console.log(`USAGE: ${exec} [command]\n`);
	console.log("COMMANDS:");
	logCommand("start", "Start the app for production.");
}