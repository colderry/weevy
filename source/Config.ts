import { CorsOptions } from "cors";
import fs from "fs";
import path from "path";
import WebSocket from "ws";

export function getConfig (dest = "./weevy.config.js") {
	const isExist = fs.existsSync(dest);

	if (!isExist) {
		throw new Error("'weevy.config.js' does not exist");
	}

	const filePath = path.join(process.cwd(), "weevy.config.js");
	const config = require(filePath);

	return Object.assign({
		cors: {},
		websocket: {
			directory: "./ws",
			options: {}
		},
		routes: null,
		controllers: null,
		middlewares: null
	}, config);
}

export interface WeevyConfig {
	cors?: CorsOptions;

	websocket?: {
		directory?: string;
		options?: Omit<WebSocket.ServerOptions, "server">;
	}

	routes?: string;
	controllers?: string;
	middleware?: string;
}