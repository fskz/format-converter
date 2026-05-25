<script lang="ts">
  interface Props {
    current: number;
    total: number;
    status?: string;
  }

  let { current, total, status = '' }: Props = $props();

  let percentage: number = $derived(
    total > 0 ? Math.round((current / total) * 100) : 0
  );
</script>

<div class="progress">
  <div class="progress-bar">
    <div class="progress-fill" style="width: {percentage}%"></div>
  </div>
  <div class="progress-info">
    <span class="progress-text">{current} / {total}</span>
    {#if status}
      <span class="progress-status">{status}</span>
    {/if}
  </div>
</div>

<style>
  .progress {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .progress-bar {
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid var(--border);
  }

  .progress-fill {
    height: 100%;
    background: var(--primary);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }

  .progress-text {
    color: var(--text-secondary);
  }

  .progress-status {
    color: var(--primary);
    font-weight: 500;
  }
</style>
