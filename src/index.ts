import { DurableObject } from "cloudflare:workers";
import { renderCounterHtml } from "./renderCounterHtml";

export class MyDurableObject extends DurableObject {
	async count(): Promise<number> {
		return (await this.ctx.storage.get<number>('count')) || 0;
	}

	async increment(): Promise<number> {
		const count = await this.count();
		const addedCount = count + 1;
		await this.ctx.storage.put('count', addedCount);

		return addedCount;
	}

	async decrement(): Promise<number> {
		const count = await this.count();
		const subtractedCount = count - 1;
		await this.ctx.storage.put('count', subtractedCount);

		return subtractedCount;
	}

	async delete(): Promise<void> {
		await this.ctx.storage.delete('count');
	}
}

/**
 * TODO
 * 	- Counter with WebSocketを実装する
 */
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const roomId = getAllowedRoomId(url);

		const id = env.MY_DURABLE_OBJECT.idFromName(roomId)
		const stub = env.MY_DURABLE_OBJECT.get(id)

		// ==============================
		// GET
		// ==============================
		if (request.method === 'GET') {
			if (url.pathname === '/') {
				const count = await stub.count();
				const html = renderCounterHtml(roomId, count);

				return new Response(html, {
					headers: { "content-type": "text/html; charset=UTF-8" }
				});
			}

			// デバッグ用（画面からは呼ばれない）
			if (url.pathname === '/count') {
				const count = await stub.count();
				return new Response(count.toString());
			}
		}

		// ==============================
		// PUT
		// ==============================
		if (request.method === 'PUT') {
			if (url.pathname === '/increment') {
				const count = await stub.increment();
				return new Response(count.toString());
			}

			if (url.pathname === '/decrement') {
				const count = await stub.decrement();
				return new Response(count.toString());
			}

			if (url.pathname === '/reset') {
				await stub.delete();
				const count = await stub.count();
				return new Response(count.toString());
			}
		}

		return new Response('Method not allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;


// 許可するクエリパラメータ名からroomIdを取得する
function getAllowedRoomId(url: URL): string {
    const allowedRoomIdParams = ['roomid', 'roomId', 'room_id'];

    return (
      allowedRoomIdParams
        .map(name => url.searchParams.get(name))
        .find(val => typeof val === 'string' && val.trim().length > 0) || '0'
    );
}