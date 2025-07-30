import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastMessage[]>([]);

	const add = (message: string, type: ToastType = 'info', duration: number = 3000) => {
		const id = Math.random().toString(36).substr(2, 9);
		const toast: ToastMessage = { id, message, type, duration };

		update((toasts) => [...toasts, toast]);

		// Auto-remove after duration
		if (duration > 0) {
			setTimeout(() => {
				update((toasts) => toasts.filter((t) => t.id !== id));
			}, duration);
		}

		return id;
	};

	return {
		subscribe,
		add,
		remove: (id: string) => {
			update((toasts) => toasts.filter((t) => t.id !== id));
		},
		clear: () => {
			update(() => []);
		},
		success: (message: string, duration?: number) => {
			return add(message, 'success', duration);
		},
		error: (message: string, duration?: number) => {
			return add(message, 'error', duration);
		},
		info: (message: string, duration?: number) => {
			return add(message, 'info', duration);
		},
		warning: (message: string, duration?: number) => {
			return add(message, 'warning', duration);
		}
	};
}

export const toast = createToastStore();
