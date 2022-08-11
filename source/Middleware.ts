import { RequestHandler } from "express";

export type CacheTypeMiddleware = {
	[key: string]: RequestHandler[] | any;
}

export class Middleware {
	public cache = new Map<string, CacheTypeMiddleware>();

	public constructor () {
		this.cache = new Map();
	}

	public get (name: string, version?: string): RequestHandler[] {
		return this.use(name, version);
	}

	/**
	 * @param {string} name The name for the middleware.
	 * @param {string} version The version of the middleware.
	 * @param {RequestHandler[]} handlers The handler functions of the middleware.
	*/
	public set (
		name: string, 
		version: string, 
		...handlers: RequestHandler[]
	): Middleware;

	public set (
		name: string, 
		...handlers: RequestHandler[]
	): Middleware;

	public set (...params: any[]): this {
		const args: any[] = [...params];
		const name: string = args[0];
		let version: string | null = null;

		if (typeof name !== "string") {
			throw new Error(`Expected name to be 'string' but got ${typeof name} instead`);
		}

		if (typeof args[1] === "string") {
			version = args[1];
		}

		const middlewares: RequestHandler[] = args.slice(version ? 2 : 1, args.length);

		if (!middlewares.length) {
			throw new Error(`Expected at least one middleware but got ${middlewares.length}`);
		} else {
			middlewares.forEach((mid) => {
				if (typeof mid !== "function") {
					throw new Error(`Received a non function middleware: ${typeof mid} for set.`);
				}
			});
		}

		if (version) {
			if (!this.cache.get(version)) {
				this.cache.set(version, {});
			}

			const obj = this.cache.get(version)!;
			obj[name] = middlewares;
			this.cache.set(version, obj);
		} else {
			this.cache.set(name, middlewares);
		}

		return this;
	}

	/**
	 * This `use` method is used by the `get` method so their functionality is the same.
	 * 
	 * You can see the following code example:
	 * ```js
	 * const { middleware } = require("weevy");
	 * 
	 * middleware.use("henlo");
	 * middleware.use("henlo", "v1"); // Get from the version.
	 * ```
	 * @param {string} name The name of the middleware(s) set.
	 * @param {string?} version - The version of the middleware(s) (optional).
	*/
	public use (name: string, version?: string): RequestHandler[] {
		let mid: RequestHandler[] | undefined;

		if (version && this.cache.get(version)) {
			mid = this.cache.get(version)![name];
		} else {
			mid = this.cache.get(name) as RequestHandler[];
		}

		if (!mid) {
			throw new Error(`Middleware does not exist with the name - ${name} ${version ? `in ${version}` : ""}`);
		}

		return mid;
	}
}

export const middleware = new Middleware();