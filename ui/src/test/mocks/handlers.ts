import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/__tauri__/invoke', async ({ request }) => {
    const body = (await request.json()) as { cmd: string };

    if (body.cmd === 'convert_file') {
      return HttpResponse.json({
        success: true,
        output_path: '/mock/output.json',
        record_count: 100,
        error: null,
      });
    }

    if (body.cmd === 'preview_file') {
      return HttpResponse.json({
        file_type: 'xlsx',
        headers: ['A', 'B', 'C'],
        rows: [['1', '2', '3']],
        total_rows: 1,
      });
    }

    if (body.cmd === 'batch_convert') {
      return HttpResponse.json({ success: true });
    }

    return HttpResponse.json({ error: 'Unknown command' }, { status: 400 });
  }),
];
