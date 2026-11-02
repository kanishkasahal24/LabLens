import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Filter,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Check,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';
import api from '../api/axios';
import useAuth from '../hooks/useAuth';
import { biomarkerFallbackData } from '../data/biomarkerFallback';

const BiomarkerGuidePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state initialization
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [biomarkers, setBiomarkers] = useState([]);
  const [patientSex, setPatientSex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  // Debounce search input (approx 300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync debounced search and category to URL using replace: true
  useEffect(() => {
    const params = {};
    if (debouncedQuery.trim()) {
      params.q = debouncedQuery.trim();
    }
    if (selectedCategory && selectedCategory !== 'All') {
      params.category = selectedCategory;
    }
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, selectedCategory, setSearchParams]);

  // Merge backend data with fallback educational descriptions
  const mergeReferenceData = useCallback((apiData) => {
    const fallbackMap = new Map();
    biomarkerFallbackData.forEach((fb) => {
      fallbackMap.set(fb.canonicalName.toLowerCase(), fb);
      fb.aliases?.forEach((alias) => {
        fallbackMap.set(alias.toLowerCase(), fb);
      });
    });

    return apiData.map((item) => {
      // Find matching educational metadata by canonicalName or aliases
      let match = fallbackMap.get(item.canonicalName?.toLowerCase());
      if (!match && item.aliases) {
        for (const alias of item.aliases) {
          match = fallbackMap.get(alias.toLowerCase());
          if (match) break;
        }
      }

      return {
        id: item.id || item._id || `ref-${item.canonicalName}`,
        canonicalName: item.canonicalName,
        aliases: item.aliases || [],
        unit: item.unit || match?.unit || '',
        panel: item.panel || match?.panel || 'General',
        bodySystem: item.bodySystem || match?.bodySystem || 'general',
        resultType: item.resultType || match?.resultType || 'numeric',
        range: item.range || match?.range || { low: null, high: null },
        genderRanges: item.genderRanges || match?.genderRanges || null,
        whatItMeasures: match?.whatItMeasures || item.impact || 'Key clinical diagnostic marker evaluating physiological equilibrium.',
        whatHighMayIndicate: match?.whatHighMayIndicate || 'Levels above standard clinical reference range; review with your healthcare provider.',
        whatLowMayIndicate: match?.whatLowMayIndicate || 'Levels below standard clinical reference range; review with your healthcare provider.',
        impact: item.impact || match?.impact || 'Essential physiological benchmark.',
        howToImprove: item.howToImprove || match?.howToImprove || 'Adopt a balanced nutrient-dense diet, stay hydrated, and follow your physician recommendations.'
      };
    });
  }, []);

  // Fetch data from backend or fallback gracefully
  const fetchBiomarkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      // 1. Fetch patient profile to determine sex for range highlighting
      if (user?.role === 'patient') {
        try {
          const profileRes = await api.get('/profile');
          if (profileRes.data?.profile?.sex) {
            setPatientSex(profileRes.data.profile.sex.toLowerCase());
          }
        } catch {
          // Non-critical; fallback to no personalized sex highlight
        }
      }

      // 2. Fetch references endpoint
      const response = await api.get('/reports/references/all');
      if (Array.isArray(response.data) && response.data.length > 0) {
        const enriched = mergeReferenceData(response.data);
        setBiomarkers(enriched);
      } else {
        // Fallback to local dataset if empty response
        setBiomarkers(biomarkerFallbackData);
        setUsingFallback(true);
      }
    } catch (err) {
      console.warn('API references call failed, falling back to local biomarker dataset:', err.message);
      // Fallback gracefully to high-quality local dataset
      setBiomarkers(biomarkerFallbackData);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [user, mergeReferenceData]);

  useEffect(() => {
    fetchBiomarkers();
  }, [fetchBiomarkers]);

  // Extract dynamic categories from loaded biomarker panels
  const categories = useMemo(() => {
    const uniquePanels = Array.from(new Set(biomarkers.map((b) => b.panel).filter(Boolean)));
    return ['All', ...uniquePanels.sort()];
  }, [biomarkers]);

  // Filter biomarkers by search query and selected panel category
  const filteredBiomarkers = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    return biomarkers.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.panel !== selectedCategory) {
        return false;
      }

      // Search query filter (matches canonical name and aliases)
      if (q) {
        const matchName = item.canonicalName.toLowerCase().includes(q);
        const matchAlias = item.aliases?.some((a) => a.toLowerCase().includes(q));
        const matchPanel = item.panel.toLowerCase().includes(q);
        return matchName || matchAlias || matchPanel;
      }

      return true;
    });
  }, [biomarkers, debouncedQuery, selectedCategory]);

  // Toggle card expansion
  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setSelectedCategory('All');
  };

  const isFiltering = searchInput.trim().length > 0 || selectedCategory !== 'All';

  return (
    <div className="biomarker-guide-container">
      {/* Header Banner */}
      <header className="guide-header">
        <div className="guide-header-badge">
          <BookOpen size={16} />
          <span>Clinical Reference Directory</span>
        </div>
        <h1 className="guide-title">Interactive Biomarker Guide</h1>
        <p className="guide-subtitle">
          Explore standard clinical reference intervals, understand what each lab test measures, and discover how lifestyle factors influence your blood chemistry.
        </p>

        {usingFallback && (
          <div className="guide-offline-pill" role="status">
            <Info size={14} />
            <span>Operating in educational offline fallback mode. All reference content is locally validated.</span>
          </div>
        )}
      </header>

      {/* Educational & Medical Advisory Disclaimer */}
      <section className="guide-disclaimer-box" aria-label="Medical Disclaimer">
        <div className="disclaimer-icon-wrapper">
          <ShieldCheck size={20} />
        </div>
        <div className="disclaimer-text">
          <strong>Important Clinical Note:</strong> Reference intervals vary across clinical laboratories, testing platforms, and individual demographics (age, sex, and health status). The guidelines provided here are for general educational purposes only and do not constitute medical diagnosis or therapeutic advice. Always consult your personal physician to interpret your specific laboratory reports.
        </div>
      </section>

      {/* Search and Category Filtering Section */}
      <section className="guide-controls-card">
        {/* Search Bar */}
        <div className="guide-search-row">
          <div className="guide-search-input-wrapper">
            <Search size={18} className="search-icon" aria-hidden="true" />
            <input
              type="text"
              className="guide-search-input"
              placeholder="Search by biomarker name or alias (e.g. Hemoglobin, HbA1c, ALT, Triglycerides, WBC)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search biomarkers by canonical name or alias"
            />
            {searchInput && (
              <button
                type="button"
                className="guide-search-clear-btn"
                onClick={() => setSearchInput('')}
                aria-label="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isFiltering && (
            <button
              type="button"
              className="btn btn-secondary btn-sm guide-clear-all-btn"
              onClick={handleClearFilters}
              aria-label="Clear all search and category filters"
            >
              <RefreshCw size={14} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Dynamic Category Chips */}
        <div className="guide-category-section">
          <div className="guide-category-label">
            <Filter size={14} />
            <span>Filter by Panel:</span>
          </div>
          <div className="guide-chips-scroll" role="tablist" aria-label="Filter biomarkers by panel">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  className={`guide-category-chip ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCategory(cat);
                    }
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="guide-results-meta">
          <span className="results-count">
            Showing <strong>{filteredBiomarkers.length}</strong> {filteredBiomarkers.length === 1 ? 'biomarker' : 'biomarkers'}
            {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
            {debouncedQuery.trim() && <span> matching "<strong>{debouncedQuery.trim()}</strong>"</span>}
          </span>
          {patientSex && (
            <span className="user-profile-badge">
              <HeartPulse size={13} />
              <span>Personalized profile: <strong>{patientSex.toUpperCase()}</strong> range highlighted</span>
            </span>
          )}
        </div>
      </section>

      {/* Loading Skeleton State */}
      {loading && (
        <div className="guide-loading-grid" aria-live="polite" aria-busy="true">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="guide-card-skeleton">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-badge" />
              <div className="skeleton-line skeleton-body" />
              <div className="skeleton-line skeleton-body short" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="guide-error-card" role="alert">
          <AlertTriangle size={36} color="var(--status-high-text)" />
          <h3>Unable to Load Biomarker Directory</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchBiomarkers}>
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredBiomarkers.length === 0 && (
        <div className="guide-empty-state" role="status">
          <div className="empty-icon-circle">
            <Search size={32} />
          </div>
          <h3>No matching biomarkers found</h3>
          <p>
            No parameters matched your search for "<strong>{debouncedQuery}</strong>"
            {selectedCategory !== 'All' ? ` within panel "${selectedCategory}"` : ''}.
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleClearFilters}>
            <span>Reset Search & Filters</span>
          </button>
        </div>
      )}

      {/* Biomarker Cards Grid */}
      {!loading && !error && filteredBiomarkers.length > 0 && (
        <div className="guide-cards-grid" role="region" aria-label="Biomarker Cards">
          {filteredBiomarkers.map((item) => {
            const isExpanded = !!expandedCards[item.id];
            const hasGenderVariants = item.genderRanges && (item.genderRanges.male || item.genderRanges.female);

            return (
              <article key={item.id} className="biomarker-card" aria-labelledby={`title-${item.id}`}>
                {/* Card Top: Canonical Name & Panel Badge */}
                <div className="card-top-header">
                  <div>
                    <h2 id={`title-${item.id}`} className="biomarker-name">
                      {item.canonicalName}
                    </h2>
                    {item.aliases && item.aliases.length > 0 && (
                      <div className="biomarker-aliases" title="Also known as">
                        <span className="aliases-label">Aliases:</span>
                        {item.aliases.map((alias) => (
                          <span key={alias} className="alias-tag">
                            {alias}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="biomarker-panel-badge">{item.panel}</span>
                </div>

                {/* Reference Ranges Section */}
                <div className="biomarker-range-box">
                  <div className="range-box-title">
                    <span>Clinical Reference Range</span>
                    {item.unit && <span className="unit-pill">{item.unit}</span>}
                  </div>

                  {item.resultType === 'text' ? (
                    <div className="range-text-display">
                      <span className="range-label">Expected Baseline:</span>
                      <strong className="range-value">{item.range?.referenceText || 'Negative / Nil'}</strong>
                    </div>
                  ) : hasGenderVariants ? (
                    <div className="gender-ranges-grid">
                      {/* Male Range */}
                      <div className={`gender-range-item ${patientSex === 'male' ? 'highlight-user-variant' : ''}`}>
                        <div className="variant-header">
                          <span className="variant-label">Male</span>
                          {patientSex === 'male' && (
                            <span className="variant-active-tag">
                              <Check size={11} /> Applies to you
                            </span>
                          )}
                        </div>
                        <div className="variant-range-val">
                          {item.genderRanges.male?.low ?? '—'} – {item.genderRanges.male?.high ?? '—'} {item.unit}
                        </div>
                      </div>

                      {/* Female Range */}
                      <div className={`gender-range-item ${patientSex === 'female' ? 'highlight-user-variant' : ''}`}>
                        <div className="variant-header">
                          <span className="variant-label">Female</span>
                          {patientSex === 'female' && (
                            <span className="variant-active-tag">
                              <Check size={11} /> Applies to you
                            </span>
                          )}
                        </div>
                        <div className="variant-range-val">
                          {item.genderRanges.female?.low ?? '—'} – {item.genderRanges.female?.high ?? '—'} {item.unit}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="standard-range-item">
                      <span className="standard-range-label">Standard Range:</span>
                      <span className="standard-range-val">
                        {item.range?.low != null ? item.range.low : '—'} – {item.range?.high != null ? item.range.high : '—'}{' '}
                        {item.unit}
                      </span>
                    </div>
                  )}
                </div>

                {/* What it Measures Section */}
                <div className="biomarker-section">
                  <h3 className="section-heading">What it measures</h3>
                  <p className="section-body">{item.whatItMeasures}</p>
                </div>

                {/* High and Low Indicators */}
                <div className="biomarker-indicators-grid">
                  <div className="indicator-box indicator-high">
                    <div className="indicator-header">
                      <ArrowUpRight size={15} className="indicator-icon-high" />
                      <span>Elevated (High)</span>
                    </div>
                    <p className="indicator-text">{item.whatHighMayIndicate}</p>
                  </div>

                  <div className="indicator-box indicator-low">
                    <div className="indicator-header">
                      <ArrowDownRight size={15} className="indicator-icon-low" />
                      <span>Deficient (Low)</span>
                    </div>
                    <p className="indicator-text">{item.whatLowMayIndicate}</p>
                  </div>
                </div>

                {/* Expandable Explanation Drawer */}
                <div className="card-expand-section">
                  <button
                    type="button"
                    className="guide-expand-btn"
                    onClick={() => toggleExpand(item.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`guide-details-${item.id}`}
                  >
                    <span>{isExpanded ? 'Hide detailed guidance' : 'View clinical impact & habit guidance'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {isExpanded && (
                    <div id={`guide-details-${item.id}`} className="guide-expanded-content" role="region">
                      <div className="expanded-row">
                        <div className="expanded-label">
                          <Sparkles size={14} color="var(--primary-teal)" />
                          <strong>Clinical & Body Significance</strong>
                        </div>
                        <p>{item.impact}</p>
                      </div>

                      {item.howToImprove && (
                        <div className="expanded-row">
                          <div className="expanded-label">
                            <HeartPulse size={14} color="var(--deep-navy)" />
                            <strong>Habit & Lifestyle Guidance</strong>
                          </div>
                          <p>{item.howToImprove}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BiomarkerGuidePage;
