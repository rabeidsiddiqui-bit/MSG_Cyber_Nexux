import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [], onNavigate }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="breadcrumbs-nav" aria-label="Breadcrumb navigation">
      <div className="breadcrumbs-container">
        <button
          onClick={() => onNavigate('home')}
          className="breadcrumb-item breadcrumb-home"
          title="Return to Home"
        >
          <Home size={15} />
          <span>Home</span>
        </button>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={index} className="breadcrumb-segment">
              <ChevronRight size={14} className="breadcrumb-separator" />
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(item.page, item.payload)}
                  className="breadcrumb-link"
                >
                  {item.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
