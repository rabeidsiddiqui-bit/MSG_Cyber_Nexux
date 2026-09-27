import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import LiveStatusBar from './components/LiveStatusBar';
import Breadcrumbs from './components/Breadcrumbs';
import Hero from './components/Hero';
import HomeExtraSections from './components/HomeExtraSections';
import MarketHighlights from './components/MarketHighlights';
import MarketDirectory from './components/MarketDirectory';
import MarketDirectoryPage from './components/MarketDirectoryPage';
import MarketDetail from './components/MarketDetail';
import ProduceGuide from './components/ProduceGuide';
import SeasonalRecommendations from './components/SeasonalRecommendations';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Chatbot from './components/Chatbot';
import BookmarksModal from './components/BookmarksModal';
import AuthModal from './components/AuthModal';
import SearchResults from './components/SearchResults';
import Footer from './components/Footer';

import defaultMarkets from './data/markets.json';
import defaultProduce from './data/produce.json';
import { BookmarkProvider } from './context/BookmarkContext';
import './App.css';

function getInitialRoute() {
  const path = window.location.pathname.toLowerCase();
  if (path === '/about' || path === '/about/') return { page: 'about', marketId: null };
  if (path === '/markets' || path === '/markets/') return { page: 'markets', marketId: null };
  if (path === '/directory' || path === '/directory/') return { page: 'directory', marketId: null };
  if (path.startsWith('/markets/') || path.startsWith('/market/')) {
    const parts = path.split('/').filter(Boolean);
    const id = parts[1];
    return { page: 'market-detail', marketId: id || null };
  }
  if (path === '/produce' || path === '/produce/') return { page: 'produce', marketId: null };
  if (path === '/seasonal' || path === '/seasonal/') return { page: 'seasonal', marketId: null };
  if (path === '/contact' || path === '/contact/') return { page: 'contact', marketId: null };
  if (path === '/search' || path === '/search/') {
    const params = new URLSearchParams(window.location.search);
    return { page: 'search', marketId: null, query: params.get('q') || '' };
  }
  return { page: 'home', marketId: null };
}

export default function App() {
  const initialRoute = getInitialRoute();
  const [activePage, setActivePage] = useState(initialRoute.page);
  const [selectedMarketId, setSelectedMarketId] = useState(initialRoute.marketId);
  const [searchQuery, setSearchQuery] = useState(initialRoute.query || '');
  const [directoryFilters, setDirectoryFilters] = useState({});
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // User location: null initially until permission is requested
  const [userLocation, setUserLocation] = useState(null);

  // Frontend Dummy Authentication User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('freshfind_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [markets, setMarkets] = useState(defaultMarkets);
  const [produceList, setProduceList] = useState(defaultProduce);

  useEffect(() => {
    function handlePopState() {
      const route = getInitialRoute();
      setActivePage(route.page);
      setSelectedMarketId(route.marketId);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, pRes] = await Promise.all([
          fetch('/data/markets.json'),
          fetch('/data/produce.json')
        ]);
        if (mRes.ok && pRes.ok) {
          const mData = await mRes.json();
          const pData = await pRes.json();
          setMarkets(mData);
          setProduceList(pData);
        }
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
    loadData();
  }, []);

  function handleRequestLocation(customGps) {
    if (customGps && customGps.lat) {
      setUserLocation(customGps);
      return;
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            name: 'Current GPS Location'
          });
        },
        () => {
          // Fallback if denied - clearly labelled
          setUserLocation({
            lat: 24.8607,
            lng: 67.0011,
            name: 'Karachi Central (Default)'
          });
        }
      );
    }
  }

  function handleLogin(user) {
    setCurrentUser(user);
    try {
      localStorage.setItem('freshfind_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }

  function handleLogout() {
    setCurrentUser(null);
    try {
      localStorage.removeItem('freshfind_current_user');
    } catch (e) {
      console.error(e);
    }
  }

  const handleNavigate = useCallback((page, payload) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let targetPath = '/';
    if (page === 'home') targetPath = '/';
    else if (page === 'about') targetPath = '/about';
    else if (page === 'markets') targetPath = '/markets';
    else if (page === 'directory') targetPath = '/directory';
    else if (page === 'produce') targetPath = '/produce';
    else if (page === 'seasonal') targetPath = '/seasonal';
    else if (page === 'contact') targetPath = '/contact';
    else if (page === 'search') {
      const q = typeof payload === 'string' ? payload : (payload?.query !== undefined ? payload.query : searchQuery);
      setSearchQuery(q);
      setSelectedMarketId(null);
      setActivePage('search');
      targetPath = q ? `/search?q=${encodeURIComponent(q)}` : '/search';
      window.history.pushState({ page: 'search', query: q }, '', targetPath);
      return;
    }
    else if (page === 'market-detail') {
      const marketId = typeof payload === 'string' ? payload : selectedMarketId;
      targetPath = marketId ? `/markets/${marketId}` : '/markets';
      setSelectedMarketId(marketId);
      setActivePage('market-detail');
      window.history.pushState({ page: 'market-detail', marketId }, '', targetPath);
      return;
    }

    if ((page === 'markets' || page === 'directory') && payload) {
      if (typeof payload === 'object') {
        const filters = payload.filters || payload;
        setDirectoryFilters({
          search: filters.search || '',
          area: filters.area || '',
          day: filters.day || '',
          category: filters.category || '',
          produce: filters.produce || ''
        });
      }
    }

    setSelectedMarketId(null);
    setActivePage(page);
    window.history.pushState({ page }, '', targetPath);
  }, [selectedMarketId, searchQuery]);

  function handleSelectMarket(marketId) {
    handleNavigate('market-detail', marketId);
  }

  const [produceSearch, setProduceSearch] = useState('');
  const [targetProduceCardId, setTargetProduceCardId] = useState(null);

  function handleSelectProduce(produceIdOrName, targetCardId = null) {
    setProduceSearch(produceIdOrName || '');
    let cardId = targetCardId;
    if (!cardId && typeof produceIdOrName === 'string') {
      const found = produceList.find(p => p.id === produceIdOrName || p.name.toLowerCase() === produceIdOrName.toLowerCase());
      if (found) cardId = found.id;
    }
    setTargetProduceCardId(cardId || null);
    handleNavigate('produce');
  }

  function handleQuickSearch(filters) {
    if (filters.search) {
      handleNavigate('search', { query: filters.search });
      return;
    }
    setDirectoryFilters({
      area: filters.area,
      day: filters.day,
      produce: filters.produceCategory,
      category: filters.category
    });
    handleNavigate('markets');
  }

  function getBreadcrumbs() {
    if (activePage === 'home') return [];
    if (activePage === 'search') return [{ label: searchQuery ? `Search Results for "${searchQuery}"` : 'Search Results', page: 'search' }];
    if (activePage === 'markets') return [{ label: 'Find Markets', page: 'markets' }];
    if (activePage === 'directory') return [{ label: 'Market Directory', page: 'directory' }];
    if (activePage === 'market-detail') {
      const current = markets.find(m => m.id === selectedMarketId);
      return [
        { label: 'Find Markets', page: 'markets' },
        { label: current ? current.name : 'Market Details', page: 'market-detail' }
      ];
    }
    if (activePage === 'produce') return [{ label: 'Product Guide', page: 'produce' }];
    if (activePage === 'seasonal') return [{ label: 'Seasonal Recommendations', page: 'seasonal' }];
    if (activePage === 'about') return [{ label: 'About Us', page: 'about' }];
    if (activePage === 'contact') return [{ label: 'Contact Us', page: 'contact' }];
    return [];
  }

  const selectedMarket = markets.find(m => m.id === selectedMarketId) || markets[0];

  return (
    <BookmarkProvider>
      <div className="app-root">
        <LiveStatusBar
          userLocation={userLocation}
          onRequestLocation={handleRequestLocation}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />

        <Navbar
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          currentUser={currentUser}
          markets={markets}
          produceList={produceList}
          onSelectMarket={handleSelectMarket}
          onSelectProduce={handleSelectProduce}
        />

        {activePage !== 'home' && (
          <Breadcrumbs items={getBreadcrumbs()} onNavigate={handleNavigate} />
        )}

        <main className="app-main-content">
          {activePage === 'home' && (
            <>
              <Hero
                markets={markets}
                produceList={produceList}
                onSelectMarket={handleSelectMarket}
                onSelectProduce={handleSelectProduce}
                onSearch={(q) => handleNavigate('search', { query: q })}
                onQuickSearch={handleQuickSearch}
                onExploreProduce={() => handleNavigate('produce')}
                onExploreSeasonal={() => handleNavigate('seasonal')}
                onNavigateDirectory={() => handleNavigate('markets')}
              />

              <HomeExtraSections
                markets={markets}
                produceList={produceList}
                onSelectMarket={handleSelectMarket}
                onNavigateDirectory={() => handleNavigate('markets')}
                onExploreProduce={() => handleNavigate('produce')}
              />

              <MarketHighlights
                markets={markets}
                onSelectMarket={handleSelectMarket}
                onNavigateDirectory={() => handleNavigate('markets')}
                onExploreSeasonal={() => handleNavigate('seasonal')}
              />
            </>
          )}

          {activePage === 'search' && (
            <SearchResults
              query={searchQuery}
              markets={markets}
              produceList={produceList}
              onSelectMarket={handleSelectMarket}
              onSelectProduce={handleSelectProduce}
              onClearSearch={() => setSearchQuery('')}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'markets' && (
            <MarketDirectory
              markets={markets}
              produceList={produceList}
              initialFilters={directoryFilters}
              onSelectMarket={handleSelectMarket}
              onSelectProduce={handleSelectProduce}
              onNavigate={handleNavigate}
              userLocation={userLocation}
            />
          )}

          {activePage === 'directory' && (
            <MarketDirectoryPage
              markets={markets}
              produceList={produceList}
              initialFilters={directoryFilters}
              onSelectMarket={handleSelectMarket}
              onSelectProduce={handleSelectProduce}
              onNavigate={handleNavigate}
              userLocation={userLocation}
            />
          )}

          {activePage === 'market-detail' && (
            <MarketDetail
              market={selectedMarket}
              allMarkets={markets}
              allProduce={produceList}
              onSelectProduce={() => handleNavigate('produce')}
              onBackToDirectory={() => handleNavigate('markets')}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'produce' && (
            <ProduceGuide
              produceList={produceList}
              allMarkets={markets}
              onSelectMarket={handleSelectMarket}
              initialSearch={produceSearch}
              targetProduceCardId={targetProduceCardId}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'seasonal' && (
            <SeasonalRecommendations
              produceList={produceList}
              markets={markets}
              onSelectMarket={handleSelectMarket}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'about' && (
            <AboutUs
              markets={markets}
              onNavigate={handleNavigate}
            />
          )}

          {activePage === 'contact' && (
            <ContactUs
              onRequestLocation={handleRequestLocation}
              userLocation={userLocation}
              markets={markets}
              onNavigate={handleNavigate}
            />
          )}
        </main>

        <Footer onNavigate={handleNavigate} />

        <Chatbot
          onNavigate={handleNavigate}
          onSelectMarket={handleSelectMarket}
          onSelectProduce={() => handleNavigate('produce')}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          markets={markets}
          produceList={produceList}
        />

        <BookmarksModal
          isOpen={isBookmarksOpen}
          onClose={() => setIsBookmarksOpen(false)}
          allMarkets={markets}
          allProduce={produceList}
          onSelectMarket={handleSelectMarket}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </div>
    </BookmarkProvider>
  );
}
