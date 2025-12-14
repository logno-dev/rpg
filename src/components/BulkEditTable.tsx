import { createSignal, For, Show, createMemo } from "solid-js";

type ColumnDef<T> = {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'number' | 'select' | 'readonly';
  options?: { value: any; label: string }[];
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  render?: (value: any, row: T) => any;
  sortable?: boolean;
};

type FilterConfig = {
  key: string;
  label: string;
  type: 'select' | 'multiselect';
  options: { value: any; label: string }[];
};

type BulkEditTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  filters?: FilterConfig[];
  onSave: (changes: Map<number | string, Partial<T>>) => Promise<void>;
  onDelete?: (id: number | string) => Promise<void>;
  onCreate?: () => void;
  getRowId: (row: T) => number | string;
  title: string;
  expandable?: boolean;
  renderExpanded?: (row: T) => any;
};

export function BulkEditTable<T extends Record<string, any>>(props: BulkEditTableProps<T>) {
  const [search, setSearch] = createSignal("");
  const [sortColumn, setSortColumn] = createSignal<string | null>(null);
  const [sortDirection, setSortDirection] = createSignal<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = createSignal<Map<string, Set<any>>>(new Map());
  const [editedRows, setEditedRows] = createSignal<Map<number | string, Partial<T>>>(new Map());
  const [saving, setSaving] = createSignal(false);
  const [expandedRows, setExpandedRows] = createSignal<Set<number | string>>(new Set());
  const [currentPage, setCurrentPage] = createSignal(1);
  const [pageSize, setPageSize] = createSignal(50);
  
  // Toggle sort
  const handleSort = (columnKey: string) => {
    if (sortColumn() === columnKey) {
      setSortDirection(sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };
  
  // Toggle filter value
  const toggleFilter = (filterKey: string, value: any) => {
    const filters = new Map(activeFilters());
    if (!filters.has(filterKey)) {
      filters.set(filterKey, new Set());
    }
    const values = filters.get(filterKey)!;
    if (values.has(value)) {
      values.delete(value);
      if (values.size === 0) {
        filters.delete(filterKey);
      }
    } else {
      values.add(value);
    }
    setActiveFilters(filters);
    resetPagination();
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilters(new Map());
  };
  
  // Update cell value
  const updateCell = (rowId: number | string, columnKey: string, value: any) => {
    const changes = new Map(editedRows());
    const rowChanges = changes.get(rowId) || {};
    changes.set(rowId, { ...rowChanges, [columnKey]: value });
    setEditedRows(changes);
  };
  
  // Get cell value (edited or original)
  const getCellValue = (row: T, columnKey: string) => {
    const rowId = props.getRowId(row);
    const changes = editedRows().get(rowId);
    if (changes && columnKey in changes) {
      return changes[columnKey];
    }
    return row[columnKey];
  };
  
  // Check if row has changes
  const hasChanges = (rowId: number | string) => {
    return editedRows().has(rowId);
  };
  
  // Toggle row expansion
  const toggleExpanded = (rowId: number | string) => {
    const expanded = new Set(expandedRows());
    if (expanded.has(rowId)) {
      expanded.delete(rowId);
    } else {
      expanded.add(rowId);
    }
    setExpandedRows(expanded);
  };
  
  // Discard changes
  const discardChanges = () => {
    setEditedRows(new Map());
  };
  
  // Save changes
  const saveChanges = async () => {
    setSaving(true);
    try {
      await props.onSave(editedRows());
      setEditedRows(new Map());
    } catch (error) {
      console.error("Failed to save changes:", error);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };
  
  // Filtered and sorted data
  const processedData = createMemo(() => {
    let result = [...props.data];
    
    // Apply search
    const searchTerm = search().toLowerCase();
    if (searchTerm) {
      result = result.filter(row => {
        return props.columns.some(col => {
          const value = row[col.key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm);
        });
      });
    }
    
    // Apply filters
    const filters = activeFilters();
    if (filters.size > 0) {
      result = result.filter(row => {
        return Array.from(filters.entries()).every(([key, values]) => {
          const rowValue = row[key];
          return values.has(rowValue);
        });
      });
    }
    
    // Apply sorting
    const sortCol = sortColumn();
    if (sortCol) {
      const direction = sortDirection();
      result.sort((a, b) => {
        const aVal = a[sortCol];
        const bVal = b[sortCol];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return direction === 'asc' ? comparison : -comparison;
      });
    }
    
    return result;
  });
  
  // Pagination
  const totalPages = createMemo(() => Math.ceil(processedData().length / pageSize()));
  const paginatedData = createMemo(() => {
    const start = (currentPage() - 1) * pageSize();
    const end = start + pageSize();
    return processedData().slice(start, end);
  });
  
  // Reset to page 1 when filters/search changes
  const resetPagination = () => {
    setCurrentPage(1);
  };
  
  return (
    <div class="card">
      {/* Header */}
      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "1rem", "flex-wrap": "wrap", gap: "1rem" }}>
        <h2>{props.title} ({processedData().length} {processedData().length !== props.data.length ? `of ${props.data.length}` : ''})</h2>
        <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          <Show when={editedRows().size > 0}>
            <span style={{ 
              padding: "0.5rem 1rem", 
              background: "var(--warning)", 
              "border-radius": "4px",
              "font-weight": "600",
              display: "flex",
              "align-items": "center"
            }}>
              {editedRows().size} unsaved changes
            </span>
            <button 
              class="button secondary" 
              onClick={discardChanges}
              disabled={saving()}
            >
              Discard
            </button>
            <button 
              class="button primary" 
              onClick={saveChanges}
              disabled={saving()}
            >
              {saving() ? "Saving..." : "Save All"}
            </button>
          </Show>
          <Show when={props.onCreate}>
            <button class="button primary" onClick={props.onCreate}>
              Add New
            </button>
          </Show>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div style={{ "margin-bottom": "1rem", display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
        <input 
          type="text" 
          placeholder="Search..." 
          value={search()}
          onInput={(e) => { setSearch(e.currentTarget.value); resetPagination(); }}
          style={{ flex: "1", "min-width": "200px", padding: "0.5rem" }}
        />
        <Show when={props.filters && props.filters.length > 0}>
          <For each={props.filters}>
            {(filter) => (
              <div style={{ position: "relative" }}>
                <details class="filter-dropdown">
                  <summary style={{ 
                    padding: "0.5rem 1rem", 
                    cursor: "pointer",
                    background: "var(--bg-light)",
                    border: "1px solid var(--border)",
                    "border-radius": "4px",
                    "user-select": "none"
                  }}>
                    {filter.label}
                    <Show when={activeFilters().has(filter.key)}>
                      <span style={{ 
                        "margin-left": "0.5rem",
                        background: "var(--accent)",
                        color: "var(--bg-dark)",
                        padding: "0.1rem 0.4rem",
                        "border-radius": "10px",
                        "font-size": "0.75rem",
                        "font-weight": "600"
                      }}>
                        {activeFilters().get(filter.key)?.size}
                      </span>
                    </Show>
                  </summary>
                  <div style={{ 
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    "margin-top": "0.25rem",
                    background: "var(--bg-medium)",
                    border: "1px solid var(--border)",
                    "border-radius": "4px",
                    padding: "0.5rem",
                    "min-width": "150px",
                    "max-height": "300px",
                    overflow: "auto",
                    "z-index": 1000,
                    "box-shadow": "0 4px 6px rgba(0, 0, 0, 0.3)"
                  }}>
                    <For each={filter.options}>
                      {(option) => (
                        <label style={{ 
                          display: "flex", 
                          "align-items": "center", 
                          gap: "0.5rem",
                          padding: "0.25rem",
                          cursor: "pointer",
                          "user-select": "none"
                        }}>
                          <input 
                            type="checkbox" 
                            checked={activeFilters().get(filter.key)?.has(option.value) || false}
                            onChange={() => toggleFilter(filter.key, option.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      )}
                    </For>
                  </div>
                </details>
              </div>
            )}
          </For>
          <Show when={activeFilters().size > 0}>
            <button 
              class="button secondary" 
              onClick={clearFilters}
              style={{ "white-space": "nowrap" }}
            >
              Clear Filters
            </button>
          </Show>
        </Show>
      </div>
      
      {/* Table */}
      <div style={{ overflow: "auto", "max-height": "600px" }}>
        <table style={{ width: "100%", "border-collapse": "collapse", "font-size": "0.85rem", "table-layout": "fixed" }}>
          <thead style={{ position: "sticky", top: 0, background: "var(--bg-dark)", "z-index": 10 }}>
            <tr style={{ "border-bottom": "2px solid var(--bg-light)" }}>
              <Show when={props.expandable}>
                <th style={{ padding: "0.5rem", "text-align": "center", width: "40px" }}></th>
              </Show>
              <For each={props.columns}>
                {(col) => (
                  <th 
                    style={{ 
                      padding: "0.5rem", 
                      "text-align": col.align || "left",
                      width: col.width,
                      cursor: col.sortable !== false ? "pointer" : "default",
                      "user-select": "none"
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "0.25rem", "justify-content": col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }}>
                      <span>{col.label}</span>
                      <Show when={col.sortable !== false}>
                        <span style={{ opacity: sortColumn() === col.key ? 1 : 0.3 }}>
                          {sortColumn() === col.key && sortDirection() === 'desc' ? '▼' : '▲'}
                        </span>
                      </Show>
                    </div>
                  </th>
                )}
              </For>
              <Show when={props.onDelete}>
                <th style={{ padding: "0.5rem", "text-align": "center", width: "100px" }}>Actions</th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <For each={paginatedData()}>
              {(row) => {
                const rowId = props.getRowId(row);
                const isEdited = hasChanges(rowId);
                const isExpanded = expandedRows().has(rowId);
                
                return (
                  <>
                    <tr style={{ 
                      "border-bottom": isExpanded ? "none" : "1px solid var(--bg-light)",
                      background: isEdited ? "rgba(var(--warning-rgb), 0.1)" : "transparent"
                    }}>
                      <Show when={props.expandable}>
                        <td style={{ padding: "0.25rem 0.5rem", "text-align": "center" }}>
                          <button
                            class="button secondary"
                            style={{ padding: "0.2rem 0.4rem", "font-size": "0.8rem", "min-width": "auto" }}
                            onClick={() => toggleExpanded(rowId)}
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </td>
                      </Show>
                      <For each={props.columns}>
                      {(col) => {
                        const value = getCellValue(row, col.key);
                        const isEditable = col.editable !== false && col.type !== 'readonly';
                        
                        return (
                          <td style={{ 
                            padding: "0.25rem 0.5rem", 
                            "text-align": col.align || "left",
                            width: col.width,
                            "max-width": col.width,
                            "min-width": col.width
                          }}>
                            <Show 
                              when={isEditable}
                              fallback={col.render ? col.render(value, row) : value || "-"}
                            >
                              <Show
                                when={col.type === 'select'}
                                fallback={
                                  <input
                                    type="text"
                                    inputmode={col.type === 'number' ? 'decimal' : undefined}
                                    value={value ?? ""}
                                    onChange={(e) => {
                                      if (col.type === 'number') {
                                        const parsed = parseFloat(e.currentTarget.value);
                                        if (!isNaN(parsed)) {
                                          updateCell(rowId, col.key, parsed);
                                        } else if (e.currentTarget.value === '') {
                                          updateCell(rowId, col.key, '');
                                        }
                                      } else {
                                        updateCell(rowId, col.key, e.currentTarget.value);
                                      }
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "0.25rem",
                                      background: "var(--bg-light)",
                                      border: "1px solid var(--border)",
                                      "border-radius": "2px",
                                      color: "inherit"
                                    }}
                                    class="no-spinners"
                                  />
                                }
                              >
                                <select
                                  value={String(value ?? "")}
                                  onChange={(e) => updateCell(rowId, col.key, e.currentTarget.value || null)}
                                  style={{
                                    width: "100%",
                                    padding: "0.25rem",
                                    background: "var(--bg-light)",
                                    border: "1px solid var(--border)",
                                    "border-radius": "2px",
                                    color: "inherit"
                                  }}
                                >
                                  <For each={col.options || []}>
                                    {(option) => (
                                      <option value={String(option.value)}>{option.label}</option>
                                    )}
                                  </For>
                                </select>
                              </Show>
                            </Show>
                          </td>
                        );
                      }}
                    </For>
                    <Show when={props.onDelete}>
                      <td style={{ padding: "0.5rem", "text-align": "center" }}>
                        <button 
                          class="button" 
                          style={{ 
                            padding: "0.25rem 0.5rem", 
                            "font-size": "0.8rem", 
                            background: "var(--danger)" 
                          }}
                          onClick={() => props.onDelete!(rowId)}
                        >
                          Delete
                        </button>
                      </td>
                    </Show>
                  </tr>
                  <Show when={props.expandable && isExpanded && props.renderExpanded}>
                    <tr style={{ "border-bottom": "1px solid var(--bg-light)" }}>
                      <td colspan={props.columns.length + (props.onDelete ? 2 : 1)} style={{ padding: "1rem", background: "var(--bg-medium)" }}>
                        {props.renderExpanded!(row)}
                      </td>
                    </tr>
                  </Show>
                  </>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
      
      <Show when={processedData().length === 0}>
        <div style={{ 
          padding: "2rem", 
          "text-align": "center", 
          color: "var(--text-secondary)" 
        }}>
          No items match your search or filters
        </div>
      </Show>
      
      {/* Pagination Controls */}
      <Show when={processedData().length > 0}>
        <div style={{ 
          display: "flex", 
          "justify-content": "space-between", 
          "align-items": "center", 
          "margin-top": "1rem",
          padding: "1rem",
          "border-top": "1px solid var(--border)",
          "flex-wrap": "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
            <label>Show:</label>
            <select 
              value={pageSize()} 
              onChange={(e) => { setPageSize(Number(e.currentTarget.value)); resetPagination(); }}
              style={{
                padding: "0.25rem 0.5rem",
                background: "var(--bg-light)",
                border: "1px solid var(--border)",
                "border-radius": "4px",
                color: "var(--text)"
              }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            <span>per page</span>
          </div>
          
          <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
            <span>
              Showing {((currentPage() - 1) * pageSize()) + 1} - {Math.min(currentPage() * pageSize(), processedData().length)} of {processedData().length}
            </span>
          </div>
          
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <button
              class="button secondary"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage() === 1}
              style={{ padding: "0.25rem 0.5rem" }}
            >
              ««
            </button>
            <button
              class="button secondary"
              onClick={() => setCurrentPage(Math.max(1, currentPage() - 1))}
              disabled={currentPage() === 1}
              style={{ padding: "0.25rem 0.5rem" }}
            >
              «
            </button>
            <span style={{ padding: "0.25rem 0.5rem", display: "flex", "align-items": "center" }}>
              Page {currentPage()} of {totalPages()}
            </span>
            <button
              class="button secondary"
              onClick={() => setCurrentPage(Math.min(totalPages(), currentPage() + 1))}
              disabled={currentPage() === totalPages()}
              style={{ padding: "0.25rem 0.5rem" }}
            >
              »
            </button>
            <button
              class="button secondary"
              onClick={() => setCurrentPage(totalPages())}
              disabled={currentPage() === totalPages()}
              style={{ padding: "0.25rem 0.5rem" }}
            >
              »»
            </button>
          </div>
        </div>
      </Show>
      
      <style>{`
        /* Hide number input spinners */
        .no-spinners::-webkit-outer-spin-button,
        .no-spinners::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-spinners[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
