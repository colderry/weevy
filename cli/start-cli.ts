#!/usr/bin/env node

import express from "express";
import { Server } from "http";

export default function start(prod: boolean = false) {
	
	if (prod) {
		process.env.NODE_ENV = "production";
	}

	let port: number = parseInt(process.env.PORT ?? "3000");
	const app = express();

	function fnListen (): Server {
		let server;

		try {
			server = app.listen(port);
		} catch {
			port += 1;
			server = fnListen();
		}

		return server;
	};

	fnListen();
}