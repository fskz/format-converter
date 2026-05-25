<script lang="ts">
  interface Props {
    headers: string[];
    rows: string[][];
    totalRows: number;
    pageSize?: number;
  }

  let { headers, rows, totalRows, pageSize = 20 }: Props = $props();

  let currentPage: number = $state(1);
  let totalPages: number = $derived(Math.max(1, Math.ceil(rows.length / pageSize)));

  let pageRows: string[][] = $derived(
    rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  );

  function prevPage() {
    if (currentPage > 1) currentPage--;
  }

  function nextPage() {
    if (currentPage < totalPages) currentPage++;
  }
</script>

<div class="data-table">
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          {#each headers as header}
            <th>{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each pageRows as row}
          <tr>
            {#each row as cell}
              <td>{cell}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="pagination">
    <span class="page-info">
      显示 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, rows.length)} / {rows.length} 行
    </span>
    <div class="page-buttons">
      <button class="page-btn" onclick={prevPage} disabled={currentPage <= 1}>上一页</button>
      <button class="page-btn" onclick={nextPage} disabled={currentPage >= totalPages}>下一页</button>
    </div>
  </div>
</div>

<style>
  .data-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .table-wrapper {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th {
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    color: var(--text);
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text);
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .page-info {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .page-buttons {
    display: flex;
    gap: 8px;
  }

  .page-btn {
    padding: 4px 12px;
    border: 1px solid var(--border);
    background: var(--bg);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--text);
  }

  .page-btn:hover:not(:disabled) {
    background: var(--bg-secondary);
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
