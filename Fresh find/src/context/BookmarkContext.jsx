import { createContext, useContext, useState, useEffect } from 'react';
import { Heart, Bookmark, Check } from 'lucide-react';

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  // Favorite state (Heart ❤️)
  const [favoriteMarkets, setFavoriteMarkets] = useState(() => {
    try {
      const saved = localStorage.getItem('freshfind_favorite_markets');
      return saved ? JSON.parse(saved) : ['empress-market-saddar'];
    } catch {
      return ['empress-market-saddar'];
    }
  });

  const [favoriteProduce, setFavoriteProduce] = useState(() => {
    try {
      const saved = localStorage.getItem('freshfind_favorite_produce');
      return saved ? JSON.parse(saved) : ['sindhri-mangoes'];
    } catch {
      return ['sindhri-mangoes'];
    }
  });

  // Bookmark state (Bookmark 🔖)
  const [bookmarkedMarkets, setBookmarkedMarkets] = useState(() => {
    try {
      const saved = localStorage.getItem('freshfind_bookmarked_markets');
      return saved ? JSON.parse(saved) : ['sunday-bachat-bazaar-clifton'];
    } catch {
      return ['sunday-bachat-bazaar-clifton'];
    }
  });

  const [bookmarkedProduce, setBookmarkedProduce] = useState(() => {
    try {
      const saved = localStorage.getItem('freshfind_bookmarked_produce');
      return saved ? JSON.parse(saved) : ['farm-tomatoes'];
    } catch {
      return ['farm-tomatoes'];
    }
  });

  // Personal notes
  const [userNotes, setUserNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('freshfind_user_notes');
      return saved ? JSON.parse(saved) : {
        'empress-market-saddar': 'Go early morning for fresh organic herbs and Malir vegetables!'
      };
    } catch {
      return {};
    }
  });

  // Toast feedback state
  const [toastNotification, setToastNotification] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('freshfind_favorite_markets', JSON.stringify(favoriteMarkets));
  }, [favoriteMarkets]);

  useEffect(() => {
    localStorage.setItem('freshfind_favorite_produce', JSON.stringify(favoriteProduce));
  }, [favoriteProduce]);

  useEffect(() => {
    localStorage.setItem('freshfind_bookmarked_markets', JSON.stringify(bookmarkedMarkets));
  }, [bookmarkedMarkets]);

  useEffect(() => {
    localStorage.setItem('freshfind_bookmarked_produce', JSON.stringify(bookmarkedProduce));
  }, [bookmarkedProduce]);

  useEffect(() => {
    localStorage.setItem('freshfind_user_notes', JSON.stringify(userNotes));
  }, [userNotes]);

  function triggerToast(type, title, isAdded, customMessage) {
    setToastNotification({
      id: Date.now(),
      type, // 'favorite' | 'bookmark' | 'share' | 'info'
      title,
      isAdded,
      customMessage
    });

    setTimeout(() => {
      setToastNotification((curr) => (curr && Date.now() - curr.id >= 2400 ? null : curr));
    }, 2500);
  }

  // --- Favorite Actions ---
  function toggleFavoriteMarket(id, marketName) {
    if (favoriteMarkets.includes(id)) {
      setFavoriteMarkets(favoriteMarkets.filter(item => item !== id));
      triggerToast('favorite', marketName || 'Market', false);
    } else {
      setFavoriteMarkets([...favoriteMarkets, id]);
      triggerToast('favorite', marketName || 'Market', true);
    }
  }

  function toggleFavoriteProduce(id, produceName) {
    if (favoriteProduce.includes(id)) {
      setFavoriteProduce(favoriteProduce.filter(item => item !== id));
      triggerToast('favorite', produceName || 'Produce', false);
    } else {
      setFavoriteProduce([...favoriteProduce, id]);
      triggerToast('favorite', produceName || 'Produce', true);
    }
  }

  // --- Bookmark Actions ---
  function toggleBookmarkMarket(id, marketName) {
    if (bookmarkedMarkets.includes(id)) {
      setBookmarkedMarkets(bookmarkedMarkets.filter(item => item !== id));
      triggerToast('bookmark', marketName || 'Market', false);
    } else {
      setBookmarkedMarkets([...bookmarkedMarkets, id]);
      triggerToast('bookmark', marketName || 'Market', true);
    }
  }

  function toggleBookmarkProduce(id, produceName) {
    if (bookmarkedProduce.includes(id)) {
      setBookmarkedProduce(bookmarkedProduce.filter(item => item !== id));
      triggerToast('bookmark', produceName || 'Produce', false);
    } else {
      setBookmarkedProduce([...bookmarkedProduce, id]);
      triggerToast('bookmark', produceName || 'Produce', true);
    }
  }

  function saveNote(id, text) {
    setUserNotes(prev => ({
      ...prev,
      [id]: text
    }));
  }

  // Working download of bookmarked & favorited information
  function downloadBookmarksFile(allMarkets = [], allProduce = []) {
    const savedMarketIds = Array.from(new Set([...favoriteMarkets, ...bookmarkedMarkets]));
    const savedProduceIds = Array.from(new Set([...favoriteProduce, ...bookmarkedProduce]));

    const savedM = allMarkets.filter(m => savedMarketIds.includes(m.id));
    const savedP = allProduce.filter(p => savedProduceIds.includes(p.id));

    let content = "========================================================\n";
    content += "        FRESHFIND PAKISTAN - SAVED ITEMS SUMMARY\n";
    content += "========================================================\n";
    content += `Export Date: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    content += `Total Markets Saved: ${savedM.length}\n`;
    content += `Total Produce Saved: ${savedP.length}\n\n`;

    content += "--------------------------------------------------------\n";
    content += "1. SAVED FARMERS MARKETS & MANDIS\n";
    content += "--------------------------------------------------------\n";
    if (savedM.length === 0) {
      content += "No markets saved yet.\n\n";
    } else {
      savedM.forEach((m, idx) => {
        const isFav = favoriteMarkets.includes(m.id) ? "Yes" : "No";
        const isBmk = bookmarkedMarkets.includes(m.id) ? "Yes" : "No";
        content += `${idx + 1}. ${m.name}\n`;
        content += `   Category: ${m.category || 'Farmers Market'}\n`;
        content += `   Area: ${m.area}\n`;
        content += `   Address: ${m.address}\n`;
        content += `   Operating Hours: ${m.hoursDisplay}\n`;
        content += `   Operating Days: ${(m.operatingDays || []).join(', ')}\n`;
        content += `   Rating: ${m.rating} / 5.0 (${m.reviewCount} reviews) | Stalls: ${m.vendorCount}\n`;
        content += `   Favorited: ${isFav} | Bookmarked: ${isBmk}\n`;
        if (userNotes[m.id]) {
          content += `   Your Note: "${userNotes[m.id]}"\n`;
        }
        content += "\n";
      });
    }

    content += "--------------------------------------------------------\n";
    content += "2. SAVED FRESH PRODUCE & CROPS\n";
    content += "--------------------------------------------------------\n";
    if (savedP.length === 0) {
      content += "No produce items saved yet.\n\n";
    } else {
      savedP.forEach((p, idx) => {
        const isFav = favoriteProduce.includes(p.id) ? "Yes" : "No";
        const isBmk = bookmarkedProduce.includes(p.id) ? "Yes" : "No";
        const carrying = allMarkets.filter(m => (p.markets || []).includes(m.id));
        const carryingNames = carrying.map(m => `${m.name} (${m.area})`).join('; ');

        content += `${idx + 1}. ${p.name} (${p.category})\n`;
        content += `   Estimated Price: ${p.estimatedPrice}\n`;
        content += `   Typical Season: ${p.season}\n`;
        content += `   Peak Months: ${(p.peakMonths || []).join(', ')}\n`;
        content += `   Available At Markets: ${carryingNames || 'Check local mandis'}\n`;
        content += `   Health Benefits: ${p.healthBenefits || 'Rich in natural nutrients'}\n`;
        content += `   Storage Tip: ${p.storageTip || 'Keep in cool dry place'}\n`;
        content += `   Favorited: ${isFav} | Bookmarked: ${isBmk}\n`;
        if (userNotes[p.id]) {
          content += `   Your Note: "${userNotes[p.id]}"\n`;
        }
        content += "\n";
      });
    }

    content += "========================================================\n";
    content += "Generated by FreshFind Pakistan (eGreen Basket Initiative)\n";
    content += "Website: https://freshfind.pk\n";
    content += "========================================================\n";

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FreshFind_Saved_Items_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast('info', 'Download started', true, 'Saved list downloaded as text file!');
  }

  // Calculate unique total saved items
  const totalUniqueSavedCount = new Set([
    ...favoriteMarkets,
    ...bookmarkedMarkets,
    ...favoriteProduce,
    ...bookmarkedProduce
  ]).size;

  return (
    <BookmarkContext.Provider
      value={{
        // Favorites
        favoriteMarkets,
        favoriteProduce,
        toggleFavoriteMarket,
        toggleFavoriteProduce,
        isMarketFavorited: (id) => favoriteMarkets.includes(id),
        isProduceFavorited: (id) => favoriteProduce.includes(id),

        // Bookmarks
        bookmarkedMarkets,
        bookmarkedProduce,
        toggleBookmarkMarket,
        toggleBookmarkProduce,
        isMarketBookmarked: (id) => bookmarkedMarkets.includes(id),
        isProduceBookmarked: (id) => bookmarkedProduce.includes(id),

        // Notes & Download
        itemNotes: userNotes,
        updateNote: saveNote,
        downloadBookmarksFile,
        totalBookmarksCount: totalUniqueSavedCount,
        triggerToast
      }}
    >
      {children}

      {/* Floating Interactive Toast Feedback */}
      {toastNotification && (
        <div key={toastNotification.id} className="screen-heart-popup-container" aria-live="polite">
          <div
            className={`heart-toast-bubble ${
              toastNotification.isAdded ? 'is-added' : 'is-removed'
            }`}
          >
            <div className="heart-toast-icon-wrap">
              {toastNotification.type === 'favorite' ? (
                <Heart
                  size={18}
                  fill={toastNotification.isAdded ? '#e63946' : 'transparent'}
                  color={toastNotification.isAdded ? '#e63946' : '#6c757d'}
                />
              ) : toastNotification.type === 'bookmark' ? (
                <Bookmark
                  size={18}
                  fill={toastNotification.isAdded ? '#2a9d8f' : 'transparent'}
                  color={toastNotification.isAdded ? '#2a9d8f' : '#6c757d'}
                />
              ) : (
                <Check size={18} color="#2a9d8f" />
              )}
            </div>
            <div className="heart-toast-text">
              <strong>
                {toastNotification.customMessage ||
                  (toastNotification.type === 'favorite'
                    ? toastNotification.isAdded
                      ? 'Added to Favorites ❤️'
                      : 'Removed from Favorites'
                    : toastNotification.type === 'bookmark'
                    ? toastNotification.isAdded
                      ? 'Saved to Bookmarks 🔖'
                      : 'Removed from Bookmarks'
                    : 'Notification')}
              </strong>
              <span>{toastNotification.title}</span>
            </div>
          </div>
        </div>
      )}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  return useContext(BookmarkContext);
}
