/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { DurableObject } from "cloudflare:workers";

export class MyDurableObject extends DurableObject {
	async increment(): Promise<number> {
		const count = await this.ctx.storage.get<number>('count') || 0;
		const addedCount = count + 1;
		await this.ctx.storage.put('count', addedCount);

		return addedCount;
	}

	async deleteCount(): Promise<void> {
		await this.ctx.storage.delete('count');
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const roomId = url.searchParams.get('roomId') || '0'; // デフォルトは'0'

		const id = env.MY_DURABLE_OBJECT.idFromName(roomId)
		const stub = env.MY_DURABLE_OBJECT.get(id)

		if (request.method === 'GET') {
			const count = await stub.increment()
			return new Response(`RoomId ${roomId}: ${count}`);
		}

		if (request.method === 'DELETE') {
			await stub.deleteCount();
			return new Response(`RoomId ${roomId}: deleted`);
		}

		return new Response('Method not allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;
