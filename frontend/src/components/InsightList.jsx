import React, { useState, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { Search, ChevronRight, ChevronLeft, ArrowUpDown, RefreshCw } from 'lucide-react';

const InsightList = ({ insights, pagination, onPageChange, onRefresh, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'summary', direction: 'asc' });
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedInsights = useMemo(() => {
    let result = [...insights];

    if (debouncedSearch) {
      result = result.filter(item => 
        item.summary.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.response_text.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [insights, debouncedSearch, sortConfig]);

  return (
    <>
      <div className="toolbar">
        <h2 className="card-title">Analysis Results</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-base"
              placeholder="Filter analysis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="btn-ghost" 
            onClick={onRefresh} 
            disabled={isLoading}
            style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <div className="sort-trigger" onClick={() => handleSort('summary')}>
                  Response Summary <ArrowUpDown size={12} />
                </div>
              </th>
              <th>
                <div className="sort-trigger" onClick={() => handleSort('category')}>
                  Category <ArrowUpDown size={12} />
                </div>
              </th>
              <th>AI Generated Response</th>
              <th>Confidence Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInsights.map((insight) => (
              <tr key={insight.id}>
                <td style={{ fontWeight: '600', color: 'var(--slate-900)' }}>{insight.summary}</td>
                <td><span className="badge">{insight.category}</span></td>
                <td>{insight.response_text}</td>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                    {insight.confidence_score}
                  </span>
                </td>
              </tr>
            ))}
            {filteredAndSortedInsights.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: 'var(--slate-400)' }}>
                  No insights match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="pagination-footer">
          <div className="pagination-info">
            Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.pages}</strong>
          </div>
          <div className="pagination-actions">
            <button 
              className="btn-ghost"
              disabled={pagination.page === 1} 
              onClick={() => onPageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} style={{ verticalAlign: 'middle' }} /> Previous
            </button>
            <button 
              className="btn-ghost"
              disabled={pagination.page === pagination.pages} 
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next <ChevronRight size={16} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InsightList;
