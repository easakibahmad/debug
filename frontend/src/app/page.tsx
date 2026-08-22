"use client";

import { useState } from "react";
import "./globals.css";

interface UserProfile {
  bio: string;
  avatar: string;
}

interface DashboardUser {
  id: number;
  name: string;
  email: string;
  profile: UserProfile | null;
}

interface DashboardResponse {
  users: DashboardUser[];
  meta: { queryCount: number; elapsedSeconds: string };
}

export default function DashboardPage() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [meta, setMeta] = useState<DashboardResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/get-dashboard");

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: DashboardResponse = await response.json();
      setUsers(data.users);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="debugger-header">
        <h1>DB_PROFILER_v1.0</h1>
        <p className="subtitle">MODE: N+1 ANALYSIS</p>
      </div>

      <div className="debugger-body">
        <div className="control-panel">
          <button 
            className="btn-execute" 
            onClick={loadDashboard} 
            disabled={isLoading}
          >
            {isLoading ? "EXECUTING..." : "EXECUTE DASHBOARD QUERY"}
          </button>
          
          {meta && !isLoading && (
            <div className="meta-stats">
              <div className="stat-badge">
                <span className="label">TIME:</span>
                <span className={`val ${parseFloat(meta.elapsedSeconds) > 1 ? 'slow' : 'ok'}`}>
                  {meta.elapsedSeconds}s
                </span>
              </div>
              <div className="stat-badge">
                <span className="label">QUERIES:</span>
                <span className={`val ${meta.queryCount > 10 ? 'slow' : 'ok'}`}>
                  {meta.queryCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && <div className="error">[ERROR] {error}</div>}

        {isLoading && (
          <div className="loading-indicator">
            <span className="spinner">⣾</span>
            <span>WARNING: HIGH LATENCY DETECTED. AWAITING DB RESPONSE...</span>
          </div>
        )}

        {users.length > 0 && !isLoading && (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-card">
                {user.profile ? (
                  <img
                    className="avatar"
                    src={user.profile.avatar}
                    alt={user.name}
                  />
                ) : (
                  <div className="avatar fallback" />
                )}
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  {user.profile && <p className="bio">{user.profile.bio}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
