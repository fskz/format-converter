<script lang="ts">
  import ConvertPage from './pages/ConvertPage.svelte';
  import PreviewPage from './pages/PreviewPage.svelte';
  import BatchPage from './pages/BatchPage.svelte';

  type Tab = 'convert' | 'preview' | 'batch';

  let activeTab: Tab = $state('convert');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'convert', label: '转换' },
    { id: 'preview', label: '预览' },
    { id: 'batch', label: '批量' },
  ];
</script>

<div class="app">
  <header class="header">
    <h1 class="title">Format Converter</h1>
    <nav class="tabs">
      {#each tabs as tab}
        <button
          class="tab"
          class:active={activeTab === tab.id}
          onclick={() => (activeTab = tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </nav>
  </header>

  <main class="content">
    {#if activeTab === 'convert'}
      <ConvertPage />
    {:else if activeTab === 'preview'}
      <PreviewPage />
    {:else}
      <BatchPage />
    {/if}
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 12px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--bg);
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary);
    white-space: nowrap;
  }

  .tabs {
    display: flex;
    gap: 4px;
  }

  .tab {
    padding: 6px 16px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    border-radius: var(--radius);
    transition: all 0.15s;
  }

  .tab:hover {
    background: var(--bg-secondary);
    color: var(--text);
  }

  .tab.active {
    background: var(--primary);
    color: white;
  }

  .content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
</style>
