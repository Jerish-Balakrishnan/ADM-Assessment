import React, { useState } from 'react';
import { useSubmitPromptMutation, useGetInsightsQuery } from './store/apiSlice';
import PromptForm from './components/PromptForm';
import InsightList from './components/InsightList';
import { Cpu, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './styles/App.css';

function App() {
  const [page, setPage] = useState(1);
  const [contextId, setContextId] = useState(null);

  const [submitPrompt, { isLoading: isSubmitting }] = useSubmitPromptMutation();
  const { data: insightsData, isLoading: isLoadingInsights, isError, error, refetch } = useGetInsightsQuery({ page, contextId });

  const handleFormSubmit = async (formData) => {
    const loadingToast = toast.loading('Processing your query...');
    try {
      const payload = { ...formData, contextId };
      const response = await submitPrompt(payload).unwrap();
      
      if (response.status === 'SUCCESS') {
        toast.success((t) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {response.message || 'Analysis complete!'}
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold', fontSize: '14px', padding: '0 4px' }}
            >
              ✕
            </button>
          </span>
        ), { id: loadingToast });
      } else if (response.status === 'NEEDS_CLARIFICATION') {
        toast((t) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {response.message || 'Please provide more details.'}
            <button 
              onClick={() => toast.dismiss(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontWeight: 'bold', fontSize: '14px', padding: '0 4px' }}
            >
              ✕
            </button>
          </span>
        ), {
          id: loadingToast,
          icon: '💡',
          style: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }
        });
      }

      if (response.contextId) {
        setContextId(response.contextId);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMessage = err.data?.message || err.data?.detail?.message || 'Something went wrong';
      toast.error((t) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {errorMessage}
          <button 
            onClick={() => toast.dismiss(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold', fontSize: '14px', padding: '0 4px' }}
          >
            ✕
          </button>
        </span>
      ), { id: loadingToast });
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Table data updated!', { duration: 2000 });
  };

  return (
    <div className="app-wrapper">
      <Toaster position="top-right" reverseOrder={false} />
      <nav className="top-nav">
        <div className="logo">
          <Cpu size={24} /> AI Middleware
        </div>
      </nav>

      <main className="main-layout">
        <aside className="sidebar">
          <div className="ui-card">
            <div className="card-header">
              <h2 className="card-title">Analysis Engine</h2>
            </div>
            <div className="card-body">
              <PromptForm onSubmit={handleFormSubmit} isLoading={isSubmitting} />
            </div>
          </div>
        </aside>

        <section className="content-area">
          <div className="ui-card">
            {isLoadingInsights ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
                Fetching insights...
              </div>
            ) : isError ? (
              <div className="notification error" style={{ margin: '1.5rem' }}>
                Failed to load insights. {error.message}
              </div>
            ) : insightsData && (insightsData.insights.length > 0 || contextId) ? (
              <InsightList 
                insights={insightsData.insights} 
                pagination={insightsData.pagination}
                onPageChange={handlePageChange}
                onRefresh={handleRefresh}
                isLoading={isLoadingInsights}
              />
            ) : (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                No analysis data available.<br/>
                <span style={{ fontSize: '0.85rem' }}>Run the analysis engine on the left or hit refresh.</span>
                <div style={{ marginTop: '1.5rem' }}>
                  <button className="btn-ghost" onClick={handleRefresh}>
                    <RefreshCw size={16} /> Initial Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
