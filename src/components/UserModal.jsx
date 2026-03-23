import React, { useState } from 'react';
import './UserModal.css';

const UserModal = ({ user, onClose, onWarn, onBan, onSuspend, onRestore, onDelete, loading }) => {
  const [banReason, setBanReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  const isBanned = user?.status === 'banned';
  const isSuspended = user?.status === 'suspended';
  const isActive = user?.status === 'active';
  
  // Check if user has uploaded photos
  const hasUploadedPhotos = user?.reportedImages?.length > 0 || user?.recipes?.length > 0 || user?.avatar;

  const handleWarn = () => {
    if (!warningReason.trim()) {
      alert('Please enter a reason for warning');
      return;
    }
    if (window.confirm(`Send warning to ${user?.username}?`)) {
      onWarn(warningReason);
    }
  };

  const handleBan = () => {
    if (!banReason.trim()) {
      alert('Please enter a reason for banning');
      return;
    }
    if (window.confirm(`Permanently ban ${user?.username}?`)) {
      onBan(banReason);
    }
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) {
      alert('Please enter a reason for suspension');
      return;
    }
    if (window.confirm(`Suspend ${user?.username} for ${suspendDays} days?`)) {
      onSuspend(suspendReason, suspendDays);
    }
  };

  const handleRestore = () => {
    if (window.confirm(`Restore ${user?.username}'s account?`)) {
      onRestore();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently delete ${user?.username}'s account? This cannot be undone.`)) {
      onDelete();
    }
  };

  if (!user) return null;

  return (
    <div className="user-modal-overlay" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            📋 Info
          </button>
          <button className={`tab ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
            📸 Photos ({user.reportedImages?.length || 0})
          </button>
          <button className={`tab ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>
            ⚙️ Actions
          </button>
        </div>

        <div className="modal-body">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="info-tab">
              <div className="user-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">{user.username?.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="user-details">
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? '✅ Active' : user.status === 'suspended' ? '⏰ Suspended' : '🚫 Banned'}
                  </span>
                </p>
                {user.suspensionReason && (
                  <p><strong>Suspension Reason:</strong> {user.suspensionReason}</p>
                )}
                {user.banReason && (
                  <p><strong>Ban Reason:</strong> {user.banReason}</p>
                )}
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Active:</strong> {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Saved Recipes:</strong> {user.savedRecipesCount || 0}</p>
                <p><strong>Violations:</strong> {user.violationCount || 0}</p>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="photos-tab">
              {loading ? (
                <div className="loading">Loading photos...</div>
              ) : user.reportedImages?.length === 0 && !user.avatar && user.recipes?.length === 0 ? (
                <div className="no-photos">
                  <span>📷</span>
                  <p>No uploaded photos found</p>
                  <small>User must upload photos before actions are available</small>
                </div>
              ) : (
                <div className="photos-grid">
                  {/* Profile Avatar */}
                  {user.avatar && (
                    <div className="photo-card">
                      <img src={user.avatar} alt="Profile" />
                      <div className="photo-info">
                        <span className="photo-type">Profile Picture</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Recipe Images */}
                  {user.recipes?.map((recipe, idx) => (
                    recipe.image && (
                      <div key={idx} className="photo-card">
                        <img src={recipe.image} alt={recipe.title} />
                        <div className="photo-info">
                          <span className="photo-type">Recipe: {recipe.title}</span>
                          <span className="photo-date">{new Date(recipe.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )
                  ))}
                  
                  {/* Reported Images */}
                  {user.reportedImages?.map((img, idx) => (
                    <div key={idx} className="photo-card reported">
                      <img src={img.url} alt={`Reported ${idx + 1}`} />
                      <div className="photo-info">
                        <span className="photo-type reported-badge">⚠️ Reported</span>
                        <span className="photo-date">{new Date(img.reportedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div className="actions-tab">
              {!hasUploadedPhotos && (
                <div className="warning-box">
                  <span>⚠️</span>
                  <p>No uploaded photos to review. Actions are disabled until user uploads content.</p>
                </div>
              )}
              
              {isActive && (
                <>
                  <div className="action-section">
                    <h3>⚠️ Warn User</h3>
                    <div className="action-form">
                      <textarea
                        placeholder="Reason for warning..."
                        value={warningReason}
                        onChange={(e) => setWarningReason(e.target.value)}
                        rows="2"
                        disabled={!hasUploadedPhotos}
                      />
                      <button 
                        className="warn-btn" 
                        onClick={handleWarn} 
                        disabled={!hasUploadedPhotos || loading}
                      >
                        Send Warning
                      </button>
                    </div>
                  </div>

                  <div className="action-section">
                    <h3>⏰ Suspend Account</h3>
                    <div className="action-form">
                      <textarea
                        placeholder="Reason for suspension..."
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        rows="2"
                        disabled={!hasUploadedPhotos}
                      />
                      <div className="suspend-days">
                        <label>Duration (days):</label>
                        <select 
                          value={suspendDays} 
                          onChange={(e) => setSuspendDays(parseInt(e.target.value))}
                          disabled={!hasUploadedPhotos}
                        >
                          <option value={1}>1 day</option>
                          <option value={3}>3 days</option>
                          <option value={7}>7 days</option>
                          <option value={14}>14 days</option>
                          <option value={30}>30 days</option>
                        </select>
                      </div>
                      <button 
                        className="suspend-btn" 
                        onClick={handleSuspend} 
                        disabled={!hasUploadedPhotos || loading}
                      >
                        Suspend Account
                      </button>
                    </div>
                  </div>

                  <div className="action-section">
                    <h3>🚫 Permanently Ban</h3>
                    <div className="action-form">
                      <textarea
                        placeholder="Reason for permanent ban..."
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        rows="2"
                        disabled={!hasUploadedPhotos}
                      />
                      <button 
                        className="ban-btn" 
                        onClick={handleBan} 
                        disabled={!hasUploadedPhotos || loading}
                      >
                        Ban Permanently
                      </button>
                    </div>
                  </div>
                </>
              )}

              {(isSuspended || isBanned) && (
                <div className="action-section">
                  <h3>🔄 Restore Account</h3>
                  <p>Restoring will set the account back to active status.</p>
                  <button className="restore-btn" onClick={handleRestore} disabled={loading}>
                    Restore Account
                  </button>
                </div>
              )}

              <div className="action-section danger">
                <h3>🗑️ Delete Account</h3>
                <p>Permanently delete this user's account and all associated data.</p>
                <button className="delete-btn" onClick={handleDelete} disabled={loading}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;