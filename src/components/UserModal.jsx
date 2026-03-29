import React, { useState, useEffect, useCallback } from 'react';
import { getUserScannedImages } from '../api/adminApi';
import './UserModal.css';

const UserModal = ({ user, onClose, onWarn, onBan, onSuspend, onRestore, loading }) => {
  const [banReason, setBanReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [scannedImages, setScannedImages] = useState([]);
  const [scannedImagesLoading, setScannedImagesLoading] = useState(false);

  const isBanned = user?.status === 'banned';
  const isSuspended = user?.status === 'suspended';
  const isActive = user?.status === 'active';
  
  // Warning thresholds
  const WARNING_THRESHOLD_SUSPEND = 3;
  const WARNING_THRESHOLD_BAN = 5;
  const violationCount = user?.violationCount || 0;
  
  // Check if user has uploaded photos
  const hasUploadedPhotos = user?.reportedImages?.length > 0 || user?.recipes?.length > 0 || user?.avatar || scannedImages?.length > 0;
  
  // Determine if suspend/ban actions are available based on warning count
  const canSuspend = violationCount >= WARNING_THRESHOLD_SUSPEND;
  const canBan = violationCount >= WARNING_THRESHOLD_BAN;
  
  // Define fetchScannedImages with useCallback to stabilize it
  const fetchScannedImages = useCallback(async () => {
    if (!user?.id) return;
    setScannedImagesLoading(true);
    try {
      const result = await getUserScannedImages(user.id);
      setScannedImages(result.scannedImages || []);
      console.log('📸 Scanned images loaded:', result.scannedImages?.length);
    } catch (error) {
      console.error('Failed to fetch scanned images:', error);
    } finally {
      setScannedImagesLoading(false);
    }
  }, [user?.id]); // ✅ Added dependency

  // Fetch scanned images when user is selected and photos tab is active
  useEffect(() => {
    if (user?.id && activeTab === 'photos') {
      fetchScannedImages();
    }
  }, [user?.id, activeTab, fetchScannedImages]); // ✅ Added fetchScannedImages to dependencies

  // Get warning level message
  const getWarningMessage = () => {
    if (violationCount === 0) return 'No violations yet';
    if (violationCount < WARNING_THRESHOLD_SUSPEND) {
      return `${violationCount} warning(s). ${WARNING_THRESHOLD_SUSPEND - violationCount} more warning(s) until suspension is available.`;
    }
    if (violationCount < WARNING_THRESHOLD_BAN) {
      return `${violationCount} warning(s). ${WARNING_THRESHOLD_BAN - violationCount} more warning(s) until permanent ban is available.`;
    }
    return `${violationCount} warnings - Permanent ban is now available.`;
  };

  const handleWarn = () => {
    console.log('⚠️ Warn button clicked for user:', user?.username);
    if (!warningReason.trim()) {
      console.log('❌ No warning reason provided');
      alert('Please enter a reason for warning');
      return;
    }
    console.log('📝 Warning reason:', warningReason);
    
    const nextViolationCount = violationCount + 1;
    let message = `Send warning to ${user?.username}?`;
    
    if (nextViolationCount === WARNING_THRESHOLD_SUSPEND) {
      message = `⚠️ WARNING: This will be the ${WARNING_THRESHOLD_SUSPEND}rd warning. After this warning, suspension will be available. Continue?`;
    } else if (nextViolationCount === WARNING_THRESHOLD_BAN) {
      message = `⚠️⚠️ CRITICAL: This will be the ${WARNING_THRESHOLD_BAN}th warning. After this warning, permanent ban will be available. Continue?`;
    }
    
    if (window.confirm(message)) {
      console.log('✅ Warning confirmed');
      onWarn(warningReason);
    }
  };

  const handleBan = () => {
    console.log('🚫 Ban button clicked for user:', user?.username);
    
    if (!canBan) {
      alert(`Cannot ban yet. User needs ${WARNING_THRESHOLD_BAN - violationCount} more warning(s) before ban is available. Current warnings: ${violationCount}/${WARNING_THRESHOLD_BAN}`);
      return;
    }
    
    if (!banReason.trim()) {
      console.log('❌ No ban reason provided');
      alert('Please enter a reason for banning');
      return;
    }
    console.log('📝 Ban reason:', banReason);
    
    const message = `⚠️⚠️⚠️ PERMANENT BAN WARNING: This user has ${violationCount} warnings. Are you sure you want to permanently ban ${user?.username}? This action cannot be undone.`;
    
    if (window.confirm(message)) {
      console.log('✅ Ban confirmed');
      onBan(banReason);
    }
  };

  const handleSuspend = () => {
    console.log('⏰ Suspend button clicked for user:', user?.username);
    
    if (!canSuspend) {
      alert(`Cannot suspend yet. User needs ${WARNING_THRESHOLD_SUSPEND - violationCount} more warning(s) before suspension is available. Current warnings: ${violationCount}/${WARNING_THRESHOLD_SUSPEND}`);
      return;
    }
    
    if (!suspendReason.trim()) {
      console.log('❌ No suspension reason provided');
      alert('Please enter a reason for suspension');
      return;
    }
    console.log('📝 Suspension reason:', suspendReason);
    console.log('📆 Suspension days:', suspendDays);
    
    const message = `⚠️ Suspension Warning: This user has ${violationCount} warnings. Suspend ${user?.username} for ${suspendDays} days?`;
    
    if (window.confirm(message)) {
      console.log('✅ Suspension confirmed');
      onSuspend(suspendReason, suspendDays);
    }
  };

  const handleRestore = () => {
    if (window.confirm(`Restore ${user?.username}'s account?`)) {
      onRestore();
    }
  };

  if (!user) return null;

 // ✅ Correct for Vite
 const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
            📸 Photos ({ (user.reportedImages?.length || 0) + (user.avatar ? 1 : 0) + (user.recipes?.length || 0) + (scannedImages?.length || 0) })
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
                <p><strong>Violations:</strong> 
                  <span className={`violation-count ${violationCount >= WARNING_THRESHOLD_BAN ? 'critical' : violationCount >= WARNING_THRESHOLD_SUSPEND ? 'warning' : 'normal'}`}>
                    {violationCount}
                  </span>
                  <span className="violation-message"> - {getWarningMessage()}</span>
                </p>
                {violationCount >= WARNING_THRESHOLD_SUSPEND && (
                  <p className="warning-threshold-message">
                    {violationCount >= WARNING_THRESHOLD_BAN 
                      ? '⚠️ User has reached permanent ban threshold' 
                      : '⚠️ User has reached suspension threshold'}
                  </p>
                )}
                {user.suspensionReason && (
                  <p><strong>Suspension Reason:</strong> {user.suspensionReason}</p>
                )}
                {user.banReason && (
                  <p><strong>Ban Reason:</strong> {user.banReason}</p>
                )}
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Active:</strong> {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Saved Recipes:</strong> {user.savedRecipesCount || 0}</p>
                <p><strong>AI Scans:</strong> {scannedImages?.length || 0}</p>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="photos-tab">
              {(loading || scannedImagesLoading) ? (
                <div className="loading">Loading photos...</div>
              ) : (
                <div className="photos-grid">
                  {/* Avatar */}
                  {user.avatar && (
                    <div className="photo-card">
                      <img src={user.avatar} alt="Profile" />
                      <div className="photo-info">
                        <span className="photo-type">Profile Picture</span>
                      </div>
                    </div>
                  )}

                  {/* Recipes */}
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

                  {/* Scanned Images */}
                  {scannedImages.length > 0 && (
                    <>
                      <h4 className="section-subtitle">🤖 AI Scans ({scannedImages.length})</h4>
                      {scannedImages.map((scan, idx) => (
                        <div key={idx} className="photo-card scan">
                          <img 
                            src={`${API_URL}${scan.url}`} 
                            alt={`Scan ${idx + 1}`}
                            onError={(e) => { e.target.src = '/placeholder-image.png'; }}
                          />
                          <div className="photo-info">
                            <span className="photo-type scan-badge">
                              🤖 AI Detected
                            </span>
                            <div className="ingredients-list">
                              {scan.ingredients?.slice(0, 5).map((ing, i) => (
                                <span key={i} className="ingredient-tag">
                                  {ing.name} ({ing.confidence}%)
                                </span>
                              ))}
                              {scan.ingredients?.length > 5 && (
                                <span className="ingredient-tag">+{scan.ingredients.length - 5} more</span>
                              )}
                            </div>
                            <span className="photo-date">
                              {new Date(scan.scannedAt).toLocaleDateString()}
                            </span>
                            <span className="photo-filename">
                              {scan.originalFilename || `scan_${idx + 1}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

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

                  {/* Empty state */}
                  {!user.avatar && (!user.recipes || user.recipes.length === 0) && scannedImages.length === 0 && (!user.reportedImages || user.reportedImages.length === 0) && (
                    <div className="no-photos">
                      <span>📷</span>
                      <p>No uploaded photos found</p>
                      <small>User must upload photos before actions are available</small>
                    </div>
                  )}
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
                    <div className="warning-info">
                      <span className={`warning-level ${violationCount >= WARNING_THRESHOLD_BAN ? 'critical' : violationCount >= WARNING_THRESHOLD_SUSPEND ? 'warning' : 'normal'}`}>
                        Current warnings: {violationCount}
                      </span>
                      <span className="warning-threshold">
                        {violationCount < WARNING_THRESHOLD_SUSPEND && ` (${WARNING_THRESHOLD_SUSPEND - violationCount} more for suspension)`}
                        {violationCount >= WARNING_THRESHOLD_SUSPEND && violationCount < WARNING_THRESHOLD_BAN && ` (${WARNING_THRESHOLD_BAN - violationCount} more for ban)`}
                        {violationCount >= WARNING_THRESHOLD_BAN && ` (Ban threshold reached)`}
                      </span>
                    </div>
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
                    <div className="action-status">
                      {!canSuspend ? (
                        <div className="disabled-warning">
                          🔒 Suspension requires {WARNING_THRESHOLD_SUSPEND} warnings. Current: {violationCount}
                        </div>
                      ) : (
                        <div className="available-warning">
                          ✅ Suspension available ({violationCount}/{WARNING_THRESHOLD_SUSPEND} warnings)
                        </div>
                      )}
                    </div>
                    <div className="action-form">
                      <textarea
                        placeholder="Reason for suspension..."
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        rows="2"
                        disabled={!hasUploadedPhotos || !canSuspend}
                      />
                      <div className="suspend-days">
                        <label>Duration (days):</label>
                        <select 
                          value={suspendDays} 
                          onChange={(e) => setSuspendDays(parseInt(e.target.value))}
                          disabled={!hasUploadedPhotos || !canSuspend}
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
                        disabled={!hasUploadedPhotos || !canSuspend || loading}
                      >
                        Suspend Account
                      </button>
                    </div>
                  </div>

                  <div className="action-section">
                    <h3>🚫 Permanently Ban</h3>
                    <div className="action-status">
                      {!canBan ? (
                        <div className="disabled-warning">
                          🔒 Permanent ban requires {WARNING_THRESHOLD_BAN} warnings. Current: {violationCount}
                        </div>
                      ) : (
                        <div className="critical-warning">
                          ⚠️ CRITICAL: Permanent ban available ({violationCount}/{WARNING_THRESHOLD_BAN} warnings)
                        </div>
                      )}
                    </div>
                    <div className="action-form">
                      <textarea
                        placeholder="Reason for permanent ban..."
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        rows="2"
                        disabled={!hasUploadedPhotos || !canBan}
                      />
                      <button 
                        className="ban-btn" 
                        onClick={handleBan} 
                        disabled={!hasUploadedPhotos || !canBan || loading}
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