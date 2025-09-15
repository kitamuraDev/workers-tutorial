import { DurableObject } from "cloudflare:workers";

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

	async delete(): Promise<void> {
		await this.ctx.storage.delete('count');
	}
}

/**
 * TODO
 * 	- decrementを追加する
 * 	- resetを追加する
 * 	- Counter with WebSocketを実装する
 */
export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const roomId = url.searchParams.get('roomId') || '0'; // デフォルトは'0'

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

			if (url.pathname === '/reset') {
				await stub.delete();
				const count = await stub.count();
				return new Response(count.toString());
			}
		}

		return new Response('Method not allowed', { status: 405 });
	},
} satisfies ExportedHandler<Env>;

function renderCounterHtml(roomId: string, count: number): string {
  return `
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>Room Counter</title>
      </head>
      <body>
        <h1>RoomId ${roomId}: <span id="counter">${count}</span></h1>
        <button id="increment-btn">カウントアップ</button>
        <script>
          document.getElementById('increment-btn').onclick = async () => {
            const res = await fetch('/increment?roomId=${roomId}', { method: 'PUT' });
            const count = await res.text();
            document.getElementById('counter').textContent = count;
          };
        </script>
      </body>
    </html>
  `;
}
