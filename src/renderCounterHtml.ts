/**
 * HTMLを生成する関数
 *
 * @param roomId
 * @param count
 * @returns HTML
 */
export const renderCounterHtml = (roomId: string, count: number): string => {
  return `
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>Room Counter</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            margin: 0;
            min-height: 100svh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #f6f8fa;
            font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
          }
          .container {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 40px 32px 32px 32px;
            text-align: center;
            min-width: 320px;
          }
          .counter-title {
            font-size: 1.2rem;
            color: #888;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          #counter {
            font-size: 3rem;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 24px;
            display: block;
          }
          .btn-group {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-top: 16px;
          }
          button {
            padding: 12px 28px;
            border: none;
            border-radius: 8px;
            background: #2563eb;
            color: #fff;
            font-size: 1.1rem;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            box-shadow: 0 2px 8px rgba(37,99,235,0.08);
          }
          button:hover {
            opacity: 0.7;
          }
          .btn-reset {
            background: #e11d48;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="counter-title">RoomId ${roomId}</div>
          <span id="counter">${count}</span>
          <div class="btn-group">
            <button id="decrement-btn">−</button>
            <button id="increment-btn">＋</button>
            <button id="reset-btn" class="btn-reset">リセット</button>
          </div>
        </div>

        <script>
          document.getElementById('increment-btn').onclick = async () => {
            const res = await fetch('/increment?roomId=${roomId}', { method: 'PUT' });
            const count = await res.text();
            document.getElementById('counter').textContent = count;
          };

          document.getElementById('decrement-btn').onclick = async () => {
            const res = await fetch('/decrement?roomId=${roomId}', { method: 'PUT' });
            const count = await res.text();
            document.getElementById('counter').textContent = count;
          };

          document.getElementById('reset-btn').onclick = async () => {
            const res = await fetch('/reset?roomId=${roomId}', { method: 'PUT' });
            const count = await res.text();
            document.getElementById('counter').textContent = count;
          };
        </script>
      </body>
    </html>
  `;
}
