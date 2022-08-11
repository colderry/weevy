import { Application, RequestHandler } from "express";

export function Routing (app: Application, path: string, config: RoutingConfig = {}): void {
	return Object.keys(config).forEach(key => {
		const option = config[key];

		if (option.active === false) {
			if (option.fallback) {
				app.use(path + key + "*", option.fallback ?? []);
			}
		} else {

			const mid: RequestHandler[] = [];
			const exec: RequestHandler[] = [];

			if (option.mid) {
				if (Array.isArray(option.mid)) {
					option.mid.forEach(m => {
						if (typeof m === "function") mid.push(m);
					})
				} else if (typeof option.mid === "function") {
					mid.push(option.mid);
				}
			}

			if (Array.isArray(option.exec)) {
				option.exec.forEach(ex => {
					if (typeof ex === "function") mid.push(ex);
				})
			} else if (typeof option.exec === "function") {
				exec.push(option.exec);
			}

			if (option.endpoint) {
				Routing(app, path + key, option.endpoint);
			}

			app.use(key === "/" ? path : path + key, mid, exec);
		}
	});
}

export interface RoutingConfig {
	[key: string]: {
		active?: boolean;
		fallback?: RequestHandler;
		mid?: RequestHandler[] | string[] | RequestHandler;
		endpoint?: RoutingConfig;
		exec?: RequestHandler[] | string[] | RequestHandler;
	}
}