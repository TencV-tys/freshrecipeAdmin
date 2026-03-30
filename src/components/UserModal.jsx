import React, { useState } from 'react';
import './UserModal.css';

// =========================
// PHOTO LIGHTBOX COMPONENT
// =========================
const PhotoLightbox = ({ items, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const item = items[index];

  const prev = () => setIndex((i) => Math.max(0, i - 1));
  const next = () => setIndex((i) => Math.min(items.length - 1, i + 1));

  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(items.length - 1, i + 1));
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [items.length, onClose]);

  if (!item) return null;

  const typeBadgeClass =
    item.kind === 'profile' ? 'profile'
    : item.kind === 'recipe' ? 'recipe'
    : item.kind === 'scan' ? 'scan'
    : 'reported';

  const typeBadgeLabel =
    item.kind === 'profile' ? '🧑 Profile Picture'
    : item.kind === 'recipe' ? '🍽️ Recipe Image'
    : item.kind === 'scan' ? '📸 Scanned Image'
    : '⚠️ Reported Image';

  return (
    <div className="photo-lightbox-overlay" onClick={onClose}>
      <div className="photo-lightbox" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="lightbox-header">
          <h3>
            <span className={`lightbox-type-badge ${typeBadgeClass}`}>{typeBadgeLabel}</span>
          </h3>
          <button className="lightbox-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Image */}
        <div className="lightbox-image-wrap">
          {item.src ? (
            <img src={item.src} alt={item.title || 'Photo'} />
          ) : (
            <div className="image-fallback">
              <span>🖼️</span>
              <p>Image not available</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lightbox-body">

          {item.title && (
            <div className="lightbox-row">
              <span className="lightbox-label">Title</span>
              <span className="lightbox-value">{item.title}</span>
            </div>
          )}

          {item.date && (
            <div className="lightbox-row">
              <span className="lightbox-label">Date</span>
              <span className="lightbox-value">{item.date}</span>
            </div>
          )}

          {item.filename && (
            <div className="lightbox-row">
              <span className="lightbox-label">Filename</span>
              <span className="lightbox-value">{item.filename}</span>
            </div>
          )}

          {item.src && (
            <div className="lightbox-row">
              <span className="lightbox-label">URL</span>
              <span className="lightbox-value" style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--text-muted)' }}>
                {item.src}
              </span>
            </div>
          )}

          {/* Scan-specific */}
          {item.kind === 'scan' && Array.isArray(item.ingredients) && item.ingredients.length > 0 && (
            <>
              <hr className="lightbox-divider" />
              <div>
                <div className="lightbox-label" style={{ marginBottom: 10 }}>
                  Detected Ingredients ({item.ingredients.length})
                </div>
                <div className="lightbox-ingredients-list">
                  {item.ingredients.map((ing, i) => (
                    <span key={i} className="lightbox-ingredient-tag">
                      {ing.name}
                      <span className="lightbox-ingredient-confidence">{ing.confidence}%</span>
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reported-specific */}
          {item.kind === 'reported' && item.reportedAt && (
            <div className="lightbox-row">
              <span className="lightbox-label">Reported At</span>
              <span className="lightbox-value" style={{ color: '#ef4444' }}>{item.reportedAt}</span>
            </div>
          )}

          {/* Recipe-specific */}
          {item.kind === 'recipe' && item.description && (
            <div className="lightbox-row">
              <span className="lightbox-label">Description</span>
              <span className="lightbox-value">{item.description}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        {items.length > 1 && (
          <div className="lightbox-nav">
            <button className="lightbox-nav-btn" onClick={prev} disabled={index === 0}>← Prev</button>
            <span className="lightbox-nav-counter">{index + 1} / {items.length}</span>
            <button className="lightbox-nav-btn" onClick={next} disabled={index === items.length - 1}>Next →</button>
          </div>
        )}

      </div>
    </div>
  );
};

// =========================
// MAIN USER MODAL
// =========================
const UserModal = ({ user, onClose, onWarn, onBan, onSuspend, onRestore, loading }) => {
  const [banReason, setBanReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  // Lightbox state
  const [lightboxItems, setLightboxItems] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isBanned = user?.status === 'banned';
  const isSuspended = user?.status === 'suspended';
  const isActive = user?.status === 'active';

  const WARNING_THRESHOLD_SUSPEND = 3;
  const WARNING_THRESHOLD_BAN = 5;
  const violationCount = user?.violationCount || 0;

  const scannedImages = Array.isArray(user?.scannedImages) ? user.scannedImages : [];
  const scannedImagesCount = scannedImages.length;

  const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  const PLACEHOLDER_IMAGE = `${API_URL}/uploads/placeholder-image.png`;

  // =========================
  // HELPERS
  // =========================
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Invalid date'; }
  };

  const getJoinDate = () => { try { return formatDate(user?.created_at || user?.createdAt); } catch { return 'N/A'; } };
  const getLastActive = () => { try { return formatDate(user?.lastActive || user?.last_active); } catch { return 'N/A'; } };

  const getImageUrl = (imagePath) => {
    try {
      if (!imagePath || typeof imagePath !== 'string') return PLACEHOLDER_IMAGE;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
      if (imagePath.startsWith('/')) return `${API_URL}${imagePath}`;
      return `${API_URL}/${imagePath}`;
    } catch { return PLACEHOLDER_IMAGE; }
  };

  const hasUploadedPhotos =
    (Array.isArray(user?.reportedImages) && user.reportedImages.length > 0) ||
    (Array.isArray(user?.recipes) && user.recipes.length > 0) ||
    !!user?.avatar ||
    scannedImages.length > 0;

  const canSuspend = violationCount >= WARNING_THRESHOLD_SUSPEND;
  const canBan = violationCount >= WARNING_THRESHOLD_BAN;

  const getWarningMessage = () => {
    try {
      if (violationCount === 0) return 'No violations yet';
      if (violationCount < WARNING_THRESHOLD_SUSPEND) return `${violationCount} warning(s). ${WARNING_THRESHOLD_SUSPEND - violationCount} more until suspension is available.`;
      if (violationCount < WARNING_THRESHOLD_BAN) return `${violationCount} warning(s). ${WARNING_THRESHOLD_BAN - violationCount} more until permanent ban is available.`;
      return `${violationCount} warnings - Permanent ban is now available.`;
    } catch { return 'Unable to calculate warnings'; }
  };

  // =========================
  // BUILD LIGHTBOX ITEMS LIST
  // =========================
  const buildAllLightboxItems = () => {
    const items = [];

    if (user?.avatar) {
      items.push({ kind: 'profile', src: getImageUrl(user.avatar), title: `${user.username}'s Profile Picture`, date: getJoinDate() });
    }

    if (Array.isArray(user?.recipes)) {
      user.recipes.forEach((recipe) => {
        if (recipe.image) {
          items.push({
            kind: 'recipe',
            src: getImageUrl(recipe.image),
            title: recipe.title || 'Untitled Recipe',
            date: formatDate(recipe.created_at || recipe.createdAt),
            description: recipe.description || '',
            filename: recipe.image,
          });
        }
      });
    }

    scannedImages.forEach((scan, idx) => {
      items.push({
        kind: 'scan',
        src: getImageUrl(scan.url),
        title: scan.originalFilename || `Scan ${idx + 1}`,
        date: formatDate(scan.scannedAt),
        filename: scan.originalFilename || `scan_${idx + 1}`,
        ingredients: scan.ingredients || [],
      });
    });

    if (Array.isArray(user?.reportedImages)) {
      user.reportedImages.forEach((img, idx) => {
        items.push({
          kind: 'reported',
          src: getImageUrl(img.url),
          title: `Reported Image ${idx + 1}`,
          date: formatDate(img.reportedAt),
          reportedAt: formatDate(img.reportedAt),
          filename: img.url,
        });
      });
    }

    return items;
  };

  const openLightbox = (clickedIndex) => {
    const items = buildAllLightboxItems();
    setLightboxItems(items);
    setLightboxIndex(clickedIndex);
  };

  // Track flat index as cards render
  let cardIndex = -1;

  // =========================
  // SAFE IMAGE COMPONENT
  // =========================
  const SafeImage = ({ src, alt, className = '' }) => {
    const [hasError, setHasError] = useState(false);
    if (!src || hasError) return <div className={`image-fallback ${className}`}><span>🖼️</span><p>Image not available</p></div>;
    return <img src={getImageUrl(src)} alt={alt} className={className} onError={() => setHasError(true)} loading="lazy" />;
  };

  // =========================
  // ACTION HANDLERS
  // =========================
  const handleWarn = () => {
    try {
      if (!warningReason.trim()) { alert('Please enter a reason for warning'); return; }
      const nextViolationCount = violationCount + 1;
      let message = `Send warning to ${user?.username}?`;
      if (nextViolationCount === WARNING_THRESHOLD_SUSPEND) message = `⚠️ This will be the ${WARNING_THRESHOLD_SUSPEND}rd warning. Suspension will become available. Continue?`;
      else if (nextViolationCount === WARNING_THRESHOLD_BAN) message = `⚠️⚠️ CRITICAL: This will be the ${WARNING_THRESHOLD_BAN}th warning. Permanent ban will become available. Continue?`;
      if (window.confirm(message)) onWarn(warningReason);
    } catch { alert('Failed to send warning'); }
  };

  const handleBan = () => {
    try {
      if (!canBan) { alert(`Cannot ban yet. User needs ${WARNING_THRESHOLD_BAN - violationCount} more warning(s).`); return; }
      if (!banReason.trim()) { alert('Please enter a reason for banning'); return; }
      if (window.confirm(`⚠️⚠️⚠️ PERMANENT BAN: Are you sure you want to permanently ban ${user?.username}? This cannot be undone.`)) onBan(banReason);
    } catch { alert('Failed to ban user'); }
  };

  const handleSuspend = () => {
    try {
      if (!canSuspend) { alert(`Cannot suspend yet. User needs ${WARNING_THRESHOLD_SUSPEND - violationCount} more warning(s).`); return; }
      if (!suspendReason.trim()) { alert('Please enter a reason for suspension'); return; }
      if (window.confirm(`⚠️ Suspend ${user?.username} for ${suspendDays} days?`)) onSuspend(suspendReason, suspendDays);
    } catch { alert('Failed to suspend user'); }
  };

  const handleRestore = () => {
    try {
      if (window.confirm(`Restore ${user?.username}'s account?`)) onRestore();
    } catch { alert('Failed to restore account'); }
  };

  if (!user) return null;

  const totalPhotos =
    (Array.isArray(user?.reportedImages) ? user.reportedImages.length : 0) +
    (user.avatar ? 1 : 0) +
    (Array.isArray(user?.recipes) ? user.recipes.length : 0) +
    scannedImagesCount;

  return (
    <>
      <div className="user-modal-overlay" onClick={onClose}>
        <div className="user-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>User Details</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          {/* Tabs */}
          <div className="modal-tabs">
            <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>📋 Info</button>
            <button className={`tab ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
              📸 Photos ({totalPhotos})
            </button>
            <button className={`tab ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>⚙️ Actions</button>
          </div>

          <div className="modal-body">
            {/* INFO TAB */}
            {activeTab === 'info' && (
              <div className="info-tab">
                <div className="user-avatar-large">
                  {user.avatar ? (
                    <SafeImage src={user.avatar} alt={user.username} />
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
                      {violationCount >= WARNING_THRESHOLD_BAN ? '⚠️ User has reached permanent ban threshold' : '⚠️ User has reached suspension threshold'}
                    </p>
                  )}
                  {user.suspensionReason && <p><strong>Suspension Reason:</strong> {user.suspensionReason}</p>}
                  {user.banReason && <p><strong>Ban Reason:</strong> {user.banReason}</p>}
                  <p><strong>Joined:</strong> {getJoinDate()}</p>
                  <p><strong>Last Active:</strong> {getLastActive()}</p>
                  <p><strong>Saved Recipes:</strong> {user.savedRecipesCount || 0}</p>
                  <p><strong>Scans:</strong> {scannedImagesCount}</p>
                </div>
              </div>
            )}

            {/* PHOTOS TAB */}
            {activeTab === 'photos' && (
              <div className="photos-tab">
                {loading ? (
                  <div className="loading">Loading photos...</div>
                ) : (
                  <div className="photos-grid">

                    {/* Avatar */}
                    {user.avatar && (() => { cardIndex++; const ci = cardIndex; return (
                      <div key="avatar" className="photo-card" onClick={() => openLightbox(ci)}>
                        <SafeImage src={user.avatar} alt="Profile" />
                        <div className="photo-info">
                          <span className="photo-type">🧑 Profile Picture</span>
                        </div>
                      </div>
                    ); })()}

                    {/* Recipes */}
                    {Array.isArray(user?.recipes) && user.recipes.map((recipe, idx) =>
                      recipe.image ? (() => { cardIndex++; const ci = cardIndex; return (
                        <div key={`recipe-${idx}`} className="photo-card" onClick={() => openLightbox(ci)}>
                          <SafeImage src={recipe.image} alt={recipe.title} />
                          <div className="photo-info">
                            <span className="photo-type">🍽️ {recipe.title}</span>
                            <span className="photo-date">{formatDate(recipe.created_at || recipe.createdAt)}</span>
                          </div>
                        </div>
                      ); })() : null
                    )}

                    {/* Scanned Images */}
                    {scannedImages.length > 0 && (
                      <>
                        <h4 className="section-subtitle">📸 Scans ({scannedImages.length})</h4>
                        {scannedImages.map((scan, idx) => {
                          cardIndex++;
                          const ci = cardIndex;
                          return (
                            <div key={`scan-${idx}`} className="photo-card scan" onClick={() => openLightbox(ci)}>
                              <SafeImage src={scan.url} alt={`Scan ${idx + 1}`} />
                              <div className="photo-info">
                                <span className="photo-type scan-badge">📸 Scan</span>
                                <div className="ingredients-list">
                                  {Array.isArray(scan.ingredients) && scan.ingredients.slice(0, 4).map((ing, i) => (
                                    <span key={i} className="ingredient-tag">{ing.name} ({ing.confidence}%)</span>
                                  ))}
                                  {Array.isArray(scan.ingredients) && scan.ingredients.length > 4 && (
                                    <span className="ingredient-tag">+{scan.ingredients.length - 4} more</span>
                                  )}
                                </div>
                                <span className="photo-date">{formatDate(scan.scannedAt)}</span>
                                <span className="photo-filename">{scan.originalFilename || `scan_${idx + 1}`}</span>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Reported Images */}
                    {Array.isArray(user?.reportedImages) && user.reportedImages.map((img, idx) => {
                      cardIndex++;
                      const ci = cardIndex;
                      return (
                        <div key={`reported-${idx}`} className="photo-card reported" onClick={() => openLightbox(ci)}>
                          <SafeImage src={img.url} alt={`Reported ${idx + 1}`} />
                          <div className="photo-info">
                            <span className="photo-type reported-badge">⚠️ Reported</span>
                            <span className="photo-date">{formatDate(img.reportedAt)}</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Empty state */}
                    {!user.avatar &&
                      (!user.recipes || user.recipes.length === 0) &&
                      scannedImages.length === 0 &&
                      (!user.reportedImages || user.reportedImages.length === 0) && (
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

            {/* ACTIONS TAB */}
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
                        <textarea placeholder="Reason for warning..." value={warningReason} onChange={(e) => setWarningReason(e.target.value)} rows="2" disabled={!hasUploadedPhotos} />
                        <button className="warn-btn" onClick={handleWarn} disabled={!hasUploadedPhotos || loading}>Send Warning</button>
                      </div>
                    </div>

                    <div className="action-section">
                      <h3>⏰ Suspend Account</h3>
                      <div className="action-status">
                        {!canSuspend ? (
                          <div className="disabled-warning">🔒 Suspension requires {WARNING_THRESHOLD_SUSPEND} warnings. Current: {violationCount}</div>
                        ) : (
                          <div className="available-warning">✅ Suspension available ({violationCount}/{WARNING_THRESHOLD_SUSPEND} warnings)</div>
                        )}
                      </div>
                      <div className="action-form">
                        <textarea placeholder="Reason for suspension..." value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} rows="2" disabled={!hasUploadedPhotos || !canSuspend} />
                        <div className="suspend-days">
                          <label>Duration (days):</label>
                          <select value={suspendDays} onChange={(e) => setSuspendDays(parseInt(e.target.value))} disabled={!hasUploadedPhotos || !canSuspend}>
                            <option value={1}>1 day</option>
                            <option value={3}>3 days</option>
                            <option value={7}>7 days</option>
                            <option value={14}>14 days</option>
                            <option value={30}>30 days</option>
                          </select>
                        </div>
                        <button className="suspend-btn" onClick={handleSuspend} disabled={!hasUploadedPhotos || !canSuspend || loading}>Suspend Account</button>
                      </div>
                    </div>

                    <div className="action-section danger">
                      <h3>🚫 Permanently Ban</h3>
                      <div className="action-status">
                        {!canBan ? (
                          <div className="disabled-warning">🔒 Permanent ban requires {WARNING_THRESHOLD_BAN} warnings. Current: {violationCount}</div>
                        ) : (
                          <div className="critical-warning">⚠️ CRITICAL: Permanent ban available ({violationCount}/{WARNING_THRESHOLD_BAN} warnings)</div>
                        )}
                      </div>
                      <div className="action-form">
                        <textarea placeholder="Reason for permanent ban..." value={banReason} onChange={(e) => setBanReason(e.target.value)} rows="2" disabled={!hasUploadedPhotos || !canBan} />
                        <button className="ban-btn" onClick={handleBan} disabled={!hasUploadedPhotos || !canBan || loading}>Ban Permanently</button>
                      </div>
                    </div>
                  </>
                )}

                {(isSuspended || isBanned) && (
                  <div className="action-section">
                    <h3>🔄 Restore Account</h3>
                    <p>Restoring will set the account back to active status.</p>
                    <button className="restore-btn" onClick={handleRestore} disabled={loading}>Restore Account</button>
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

      {/* Lightbox rendered outside modal stacking context */}
      {lightboxItems && (
        <PhotoLightbox
          items={lightboxItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxItems(null)}
        />
      )}
    </>
  );
};

export default UserModal;