import { useState } from 'react';
import { X, Bookmark, Heart, Trash2, Download, ExternalLink, MessageSquare, Carrot } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';

export default function BookmarksModal({
  isOpen,
  onClose,
  allMarkets = [],
  allProduce = [],
  onSelectMarket
}) {
  const {
    favoriteMarkets,
    favoriteProduce,
    bookmarkedMarkets,
    bookmarkedProduce,
    toggleFavoriteMarket,
    toggleFavoriteProduce,
    toggleBookmarkMarket,
    toggleBookmarkProduce,
    isMarketFavorited,
    isMarketBookmarked,
    isProduceFavorited,
    isProduceBookmarked,
    itemNotes,
    updateNote,
    downloadBookmarksFile
  } = useBookmarks();

  const [activeTab, setActiveTab] = useState('markets'); // 'markets' | 'produce'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'favorites' | 'bookmarks'
  const [editingId, setEditingId] = useState(null);
  const [currentText, setCurrentText] = useState('');

  if (!isOpen) return null;

  // Filter markets
  const allSavedMarketIds = Array.from(new Set([...favoriteMarkets, ...bookmarkedMarkets]));
  const savedMarkets = allMarkets.filter((m) => {
    if (!allSavedMarketIds.includes(m.id)) return false;
    if (filterType === 'favorites') return isMarketFavorited(m.id);
    if (filterType === 'bookmarks') return isMarketBookmarked(m.id);
    return true;
  });

  // Filter produce
  const allSavedProduceIds = Array.from(new Set([...favoriteProduce, ...bookmarkedProduce]));
  const savedProduce = allProduce.filter((p) => {
    if (!allSavedProduceIds.includes(p.id)) return false;
    if (filterType === 'favorites') return isProduceFavorited(p.id);
    if (filterType === 'bookmarks') return isProduceBookmarked(p.id);
    return true;
  });

  function handleSaveNote(id) {
    updateNote(id, currentText);
    setEditingId(null);
  }

  function handleDownload() {
    downloadBookmarksFile(allMarkets, allProduce);
  }

  function handleRemoveMarket(id) {
    if (isMarketFavorited(id)) toggleFavoriteMarket(id);
    if (isMarketBookmarked(id)) toggleBookmarkMarket(id);
  }

  function handleRemoveProduce(id) {
    if (isProduceFavorited(id)) toggleFavoriteProduce(id);
    if (isProduceBookmarked(id)) toggleBookmarkProduce(id);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bookmarks-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Bookmark size={20} />
            </div>
            <div>
              <h2>Bookmarks & Saved Items</h2>
              <p>Your favorited markets, bookmarked produce, and shopping notes</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-modal-close" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Section Tabs (Markets vs Produce) */}
        <div className="modal-tabs-strip">
          <button
            className={`modal-tab ${activeTab === 'markets' ? 'active' : ''}`}
            onClick={() => setActiveTab('markets')}
          >
            <span>Saved Markets</span>
            <span className="tab-badge">{savedMarkets.length}</span>
          </button>

          <button
            className={`modal-tab ${activeTab === 'produce' ? 'active' : ''}`}
            onClick={() => setActiveTab('produce')}
          >
            <span>Saved Produce</span>
            <span className="tab-badge">{savedProduce.length}</span>
          </button>
        </div>

        {/* Sub-filter pills (All / Favorites / Bookmarks) */}
        <div style={{ display: 'flex', gap: '8px', padding: '10px 20px', background: 'var(--color-bg-subtle, #f8f9fa)', borderBottom: '1px solid var(--color-border, #e9ecef)' }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              border: filterType === 'all' ? '1px solid #2b4c3f' : '1px solid #dee2e6',
              background: filterType === 'all' ? '#2b4c3f' : '#fff',
              color: filterType === 'all' ? '#fff' : '#495057',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Saved
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              borderRadius: '20px',
              border: filterType === 'favorites' ? '1px solid #e63946' : '1px solid #dee2e6',
              background: filterType === 'favorites' ? '#fff1f2' : '#fff',
              color: filterType === 'favorites' ? '#e63946' : '#495057',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Heart size={13} fill="#e63946" color="#e63946" />
            <span>Favorites</span>
          </button>
          <button
            onClick={() => setFilterType('bookmarks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 12px',
              borderRadius: '20px',
              border: filterType === 'bookmarks' ? '1px solid #2a9d8f' : '1px solid #dee2e6',
              background: filterType === 'bookmarks' ? '#e6f7f5' : '#fff',
              color: filterType === 'bookmarks' ? '#2a9d8f' : '#495057',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Bookmark size={13} fill="#2a9d8f" color="#2a9d8f" />
            <span>Bookmarks</span>
          </button>
        </div>

        <div className="modal-body-scroll">
          {activeTab === 'markets' ? (
            savedMarkets.length > 0 ? (
              <div className="saved-items-list">
                {savedMarkets.map((m) => {
                  const savedNote = itemNotes[m.id] || '';
                  const isEditing = editingId === m.id;
                  const isFav = isMarketFavorited(m.id);
                  const isBmk = isMarketBookmarked(m.id);

                  return (
                    <div key={m.id} className="saved-item-row">
                      <img src={m.thumbnail} alt={m.name} className="saved-thumb" />
                      <div className="saved-item-details">
                        <div className="saved-head-row">
                          <h4
                            onClick={() => {
                              onSelectMarket(m.id);
                              onClose();
                            }}
                            className="clickable-title"
                          >
                            {m.name} <ExternalLink size={13} />
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => toggleFavoriteMarket(m.id, m.name)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Heart
                                size={16}
                                fill={isFav ? '#e63946' : 'transparent'}
                                color={isFav ? '#e63946' : '#adb5bd'}
                              />
                            </button>
                            <button
                              onClick={() => toggleBookmarkMarket(m.id, m.name)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title={isBmk ? 'Remove from bookmarks' : 'Add to bookmarks'}
                            >
                              <Bookmark
                                size={16}
                                fill={isBmk ? '#2a9d8f' : 'transparent'}
                                color={isBmk ? '#2a9d8f' : '#adb5bd'}
                              />
                            </button>
                            <button
                              onClick={() => handleRemoveMarket(m.id)}
                              className="btn-item-remove"
                              title="Delete from saved items"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="saved-meta-strip">
                          <span style={{ fontWeight: 600, color: 'var(--color-primary, #2b4c3f)' }}>{m.category || 'Farmers Market'}</span>
                          <span>•</span>
                          <span>{m.area}</span>
                          <span>•</span>
                          <span>{m.hoursDisplay}</span>
                        </div>

                        <div className="saved-note-section">
                          {isEditing ? (
                            <div className="note-edit-box">
                              <textarea
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                rows="2"
                                placeholder="Add your shopping note..."
                              />
                              <div className="note-edit-actions">
                                <button onClick={() => handleSaveNote(m.id)} className="btn-note-save">
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="btn-note-cancel">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="note-display"
                              onClick={() => {
                                setEditingId(m.id);
                                setCurrentText(savedNote);
                              }}
                            >
                              <MessageSquare size={13} className="note-icon" />
                              <span className={savedNote ? 'note-text' : 'note-placeholder'}>
                                {savedNote || '+ Add personal visit note (e.g. visit stall #4 for fresh coriander)'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-bookmarks-box">
                <Bookmark size={36} className="empty-icon" />
                <p>No markets found in this view.</p>
                <small style={{ color: '#6c757d' }}>Click the Heart ❤️ or Bookmark 🔖 on any market card to save it here.</small>
              </div>
            )
          ) : (
            savedProduce.length > 0 ? (
              <div className="saved-items-list">
                {savedProduce.map((p) => {
                  const savedNote = itemNotes[p.id] || '';
                  const isEditing = editingId === p.id;
                  const isFav = isProduceFavorited(p.id);
                  const isBmk = isProduceBookmarked(p.id);

                  return (
                    <div key={p.id} className="saved-item-row">
                      <img src={p.image} alt={p.name} className="saved-thumb" />
                      <div className="saved-item-details">
                        <div className="saved-head-row">
                          <h4>
                            {p.icon} {p.name}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => toggleFavoriteProduce(p.id, p.name)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <Heart
                                size={16}
                                fill={isFav ? '#e63946' : 'transparent'}
                                color={isFav ? '#e63946' : '#adb5bd'}
                              />
                            </button>
                            <button
                              onClick={() => toggleBookmarkProduce(p.id, p.name)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title={isBmk ? 'Remove from bookmarks' : 'Add to bookmarks'}
                            >
                              <Bookmark
                                size={16}
                                fill={isBmk ? '#2a9d8f' : 'transparent'}
                                color={isBmk ? '#2a9d8f' : '#adb5bd'}
                              />
                            </button>
                            <button
                              onClick={() => handleRemoveProduce(p.id)}
                              className="btn-item-remove"
                              title="Delete from saved items"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="saved-meta-strip">
                          <span style={{ fontWeight: 600, color: 'var(--color-primary, #2b4c3f)' }}>{p.category}</span>
                          <span>•</span>
                          <span>{p.estimatedPrice}</span>
                          <span>•</span>
                          <span>{p.season} Season</span>
                        </div>

                        <div className="saved-note-section">
                          {isEditing ? (
                            <div className="note-edit-box">
                              <textarea
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                rows="2"
                                placeholder="Add cooking or recipe note..."
                              />
                              <div className="note-edit-actions">
                                <button onClick={() => handleSaveNote(p.id)} className="btn-note-save">
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="btn-note-cancel">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="note-display"
                              onClick={() => {
                                setEditingId(p.id);
                                setCurrentText(savedNote);
                              }}
                            >
                              <MessageSquare size={13} className="note-icon" />
                              <span className={savedNote ? 'note-text' : 'note-placeholder'}>
                                {savedNote || '+ Add cooking or price note'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-bookmarks-box">
                <Carrot size={36} className="empty-icon" />
                <p>No produce items found in this view.</p>
                <small style={{ color: '#6c757d' }}>Click the Heart ❤️ or Bookmark 🔖 on any produce card to save it here.</small>
              </div>
            )
          )}
        </div>

        <div className="modal-footer-toolbar">
          <button
            onClick={handleDownload}
            className="btn-modal-action primary"
            title="Download saved markets and produce items as a formatted text file"
          >
            <Download size={15} />
            <span>Download Bookmarked Information (.txt)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
