import WebSocket, { RawData, WebSocketServer } from "ws";
import { findExport } from "./util/FindExport";
import { IncomingMessage, Server } from "http";

import fs from "fs";
import path from "path";
import glob from "glob";

export class WeevySocket {
	public ws: WebSocketServer;
	public events = new Map<string, WSEvent>();

	public constructor (
		server: Server, 
		public options?: Partial<WeevySocketOptions>,
		public wsOptons?: Omit<WebSocket.ServerOptions, "server">
		) {
		this.options = Object.assign({
			defaultEvent: true,
			defaultMessage: true
		}, options);

		this.ws = new WebSocketServer({
			server,
			...options
		});

		this.init();
		this.ws.on("connection", (socket, request) => {
			this.handleConnection(socket, request);

			if (this.options?.defaultMessage === true) {
				socket.on("message", (data) => {
					let json = null;

					try {
						json = JSON.parse(data.toString());
					} catch {};

					if (!json && this.options?.invalidJSON?.close === true) {
						return socket.close();
					}

					if (this.options?.opcodes?.event !== undefined && json.op !== undefined) {
						if (json.op === this.options.opcodes.event && this.events.get(json.name)) {
							this.events.get(json.name)?.setProps(this, socket, request).action(json);
						}
					}

					this.handleMessage(json ?? {}, data);
				});
			}
		});
	}

	public init (): void {
		return;
	}

	/**
	 * Broadcast a message to all connected websockets
	 * @param {any} data The data to send for the broadcast
	 * @param {boolean} toJSON To `JSON.stringify` it
	*/
	public broadcast (data: any, toJSON = false) {
		this.ws.clients.forEach(socket => {
			socket.send(toJSON ? JSON.stringify(data) : data);
		});
	}

	public handleConnection(socket: WebSocket, request: IncomingMessage): any {
		return;
	}

	public handleMessage (data: { [key: string]: any }, rawData: RawData): any {
		return;
	}

	public loadEvents (globPath: string): void {
		const files = glob.sync(globPath)
			.filter(p => {
				let meet = false;
				meet = fs.statSync(p).isDirectory();
				meet = findExport(require(path.resolve(p)), "function");

				return Boolean(meet);
			}).map(p => findExport(require(path.resolve(p)), "function"));

		files.forEach((file) => {
			if (!(file.prototype instanceof WSEvent)) {
				throw new Error("A ws event file does not export a instance of WSEvent");
			}

			file = new file();
			if (file.name) {
				console.log("Set event")
				this.events.set(file.name, file);
			}
		})
	}
}

export class WSEvent {
	public name: string;
	public ws!: WeevySocket;
	public client!: WebSocket;
	public request!: IncomingMessage;

	public constructor (name: string) {
		this.name = name;
	}

	public action (data: any): any {
		return;
	}

	public setProps (ws: WeevySocket, client: WebSocket, request: IncomingMessage) {
		this.ws = ws;
		this.client = client;
		this.request = request;

		return this;
	}
}

export interface WeevySocketOptions {
	opcodes: Partial<WeevySocketOptionsOpCodes>;
	heartbeat: boolean;
	defaultEvent: boolean;
	defaultMessage: boolean;
	invalidJSON: WeevySocketOptionsInvalidJSON;
}

export interface WeevySocketOptionsOpCodes {
	event: number | string;
	heartbeat: string | number;
}

export interface WeevySocketOptionsInvalidJSON {
	close?: boolean;
}

export interface WeevySocketPayload {
	[key: string]: any;
	op: number | string;
	name: string;
	data: any;
}