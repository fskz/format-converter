<script lang="ts">
  import FileSelector from '../components/FileSelector.svelte';
  import { convertFile, showInFolder } from '../lib/tauri';

  let inputPath: string = $state('');
  let outputPath: string = $state('');
  let direction: string = $state('xlsx2json');
  let converting: boolean = $state(false);
  let result: { success: boolean; output_path: string; record_count: number; error: string | null } | null = $state(null);

  const xlsxFilters = [{ name: 'Excel', extensions: ['xlsx', 'xls'] }];
  const jsonFilters = [{ name: 'JSON', extensions: ['json'] }];

  let inputFilters = $derived(direction === 'xlsx2json' ? xlsxFilters : jsonFilters);
  let outputFilters = $derived(direction === 'xlsx2json' ? jsonFilters : xlsxFilters);

  function onInputChange(val: string) {
    inputPath = val;
    result = null;
    if (val) {
      const dotIdx = val.lastIndexOf('.');
      const base = dotIdx > 0 ? val.substring(0, dotIdx) : val;
      const ext = direction === 'xlsx2json' ? '.json' : '.xlsx';
      outputPath = base + ext;
    }
  }

  async function handleConvert() {
    if (!inputPath || !outputPath) return;
    converting = true;
    result = null;
    try {
      result = await convertFile(inputPath, outputPath, direction);
    } catch (e) {
      result = { success: false, output_path: '', record_count: 0, error: String(e) };
    }
    converting = false;
  }

  async function handleShowInFolder() {
    if (result?.output_path) {
      await showInFolder(result.output_path);
    }
  }
</script>

<div class="convert-page">
  <FileSelector
    label="选择输入文件"
    bind:value={inputPath}
    filters={inputFilters}
    onchange={onInputChange}
  />

  <div class="direction-toggle">
    <span class="direction-label">转换方向</span>
    <div class="direction-buttons">
      <button
        class="dir-btn"
        class:active={direction === 'xlsx2json'}
        onclick={() => { direction = 'xlsx2json'; inputPath = ''; outputPath = ''; result = null; }}
      >
        Excel → JSON
      </button>
      <button
        class="dir-btn"
        class:active={direction === 'json2xlsx'}
        onclick={() => { direction = 'json2xlsx'; inputPath = ''; outputPath = ''; result = null; }}
      >
        JSON → Excel
      </button>
    </div>
  </div>

  <FileSelector
    label="输出文件位置"
    bind:value={outputPath}
    filters={outputFilters}
    save={true}
  />

  <button
    class="convert-btn"
    onclick={handleConvert}
    disabled={!inputPath || !outputPath || converting}
  >
    {converting ? '转换中...' : '开始转换'}
  </button>

  {#if result}
    <div class="result" class:success={result.success} class:error={!result.success}>
      {#if result.success}
        <p class="result-text">✓ 转换完成: {result.record_count} 条记录</p>
        <div class="result-actions">
          <button class="action-btn" onclick={handleShowInFolder}>打开所在文件夹</button>
        </div>
      {:else}
        <p class="result-text">✗ 转换失败: {result.error}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .convert-page {
    max-width: 560px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .direction-toggle {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .direction-label {
    font-size: 14px;
    font-weight: 500;
  }

  .direction-buttons {
    display: flex;
    gap: 8px;
  }

  .dir-btn {
    flex: 1;
    padding: 10px 16px;
    border: 1px solid var(--border);
    background: var(--bg);
    border-radius: var(--radius);
    font-size: 14px;
    color: var(--text);
    transition: all 0.15s;
  }

  .dir-btn:hover {
    background: var(--bg-secondary);
  }

  .dir-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .convert-btn {
    padding: 12px 24px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 16px;
    font-weight: 500;
    transition: all 0.15s;
  }

  .convert-btn:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .convert-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .result {
    padding: 16px;
    border-radius: var(--radius);
    border: 1px solid;
  }

  .result.success {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .result.error {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .result-text {
    font-size: 14px;
    font-weight: 500;
  }

  .success .result-text {
    color: var(--success);
  }

  .error .result-text {
    color: var(--error);
  }

  .result-actions {
    margin-top: 8px;
  }

  .action-btn {
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--text-secondary);
  }

  .action-btn:hover {
    background: var(--bg-secondary);
  }
</style>
