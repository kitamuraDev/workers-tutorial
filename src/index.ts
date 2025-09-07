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

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const lastAccess = await env.my_first_kv.get('last_access');
		if (lastAccess) {
			return new Response(lastAccess);
		} else {
			await env.my_first_kv.put('last_access', formatDate(new Date()), {
				expirationTtl: 60 // 1m
			});
			return new Response('new_access');
		}
	},
} satisfies ExportedHandler<Env>;

// format to `YYYY-MM-DD HH:MM:SS`
const formatDate = (d: Date) =>
	`${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
