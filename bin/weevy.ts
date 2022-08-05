#! /usr/bin/env node
import helpCLI from "../cli/help-cli";
import startCLI from "../cli/start-cli";

const args: string[] = process.argv
	.slice(2, process.argv.length);

if (args[0] === "start") {
	startCLI(true);
} else {
	helpCLI("weevy");
}