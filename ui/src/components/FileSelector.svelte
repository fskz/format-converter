<script lang="ts">
  import { open, save } from '@tauri-apps/plugin-dialog';

  interface Props {
    label: string;
    value: string;
    filters?: { name: string; extensions: string[] }[];
    directory?: boolean;
    save?: boolean;
    onchange?: (value: string) => void;
  }

  let { label, value = $bindable(), filters, directory = false, save: isSave = false, onchange }: Props = $props();

  async function selectFile() {
    if (directory) {
      const selected = await open({ directory: true });
      if (selected) {
        value = selected;
        onchange?.(selected);
      }
      return;
    }

    if (isSave) {
      const selected = await save({ filters });
      if (selected) {
        value = selected;
        onchange?.(selected);
      }
      return;
    }

    const selected = await open({ multiple: false, filters });
    if (selected) {
      value = selected;
      onchange?.(selected);
    }
  }
</script>

<div class="file-selector">
  <label class="label">{label}</label>
  <div class="input-row">
    <input
      type="text"
      class="input"
      {value}
      readonly
      placeholder="点击选择..."
    />
    <button class="btn" onclick={selectFile}>选择</button>
  </div>
</div>

<style>
  .file-selector {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text);
  }

  .input-row {
    display: flex;
    gap: 8px;
  }

  .input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    color: var(--text);
    background: var(--bg);
  }

  .btn {
    padding: 8px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    color: var(--text);
    transition: all 0.15s;
  }

  .btn:hover {
    background: var(--border);
  }
</style>
