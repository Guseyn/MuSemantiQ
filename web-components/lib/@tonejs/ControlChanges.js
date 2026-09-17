import { controlChangeIds } from '#msq/lib/@tonejs/ControlChange.js';

/**
 * Automatically creates an alias for named control values using Proxies
 * @hidden
 */
export function createControlChanges() {
	return new Proxy({}, {
		get(target, handler) {
			if (target[handler]) {
				return target[handler];
			} else if (Object.prototype.hasOwnProperty.call(controlChangeIds, handler)) {
				return target[controlChangeIds[handler]];
			}
		},
		set(target, handler, value) {
			if (Object.prototype.hasOwnProperty.call(controlChangeIds, handler)) {
				target[controlChangeIds[handler]] = value;
			} else {
				target[handler] = value;
			}
			return true;
		},
	});
}
