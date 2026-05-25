<script lang="ts">
  import FileSelector from '../components/FileSelector.svelte';
  import DataTable from '../components/DataTable.svelte';
  import { previewFile, type PreviewData } from '../lib/tauri';

  let filePath: string = $state('');
  let loading: boolean = $state(false);
  let data: PreviewData | null = $state(null);
  let error: string | null = $state(null);

  const allFilters = [
    { name: 'Supported', extensions: ['xlsx', 'xls', 'json'] },
  ];

  async function onFileChange(val: string) {
    filePath = val;
    data = null;
    error = null;
    if (!val) return;

    loading = true;
    try {
      data = await previewFile(val);
    } catch (e) {
      error = String(e);
    }
    loading = false;
  }
</script>

<div class="preview-page">
  <FileSelector
    label="选择要预览的文件"
    bind:value={filePath}
    filters={allFilters}
    onchange={onFileChange}
  />

  {#if loading}
    <div class="loading">加载中...</div>
  {/if}

  {#if error}
    <div class="error-box">
      <p>{error}</p>
    </div>
  {/if}

  {#if data}
    <div class="file-info">
      <span class="info-tag">{data.file_type.toUpperCase()}</span>
      <span class="info-detail">{data.headers.length} 列 · {data.total_rows} 行</span>
      {#if data.total_rows > 100}
        <span class="info-note">预览前 100 行</span>
      {/if}
    </div>

    {#if data.headers.length > 0}
      <DataTable
        headers={data.headers}
        rows={data.rows}
        totalRows={data.total_rows}
      />
    {:else}
      <div class="empty">文件为空</div>
    {/if}
  {/if}
</div>

<style>
  .preview-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .error-box {
    padding: 12px 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: var(--radius);
    color: var(--error);
    font-size: 14px;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }

  .info-tag {
    padding: 2px 8px;
    background: var(--primary);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .info-detail {
    font-size: 14px;
    color: var(--text);
  }

  .info-note {
    font-size: 13px;
    color: var(--text-secondary);
    font-style: italic;
  }

  .empty {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
  }
</style>
