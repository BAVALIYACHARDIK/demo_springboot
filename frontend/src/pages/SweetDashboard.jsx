// ...existing code...
import React, { useEffect, useState, useCallback, useRef } from "react";
import { fetchSweets as apiFetchSweets, addSweet as apiAddSweet } from "../services/Sweetapi";

/**
 * Sweet Dashboard page
 * - Fetches sweets from /api/sweets (expects query params: page, limit, search, category, minPrice, maxPrice)
 * - Top pagination and search bar
 * - Filter button (opens modal) and a cross button next to it to reset filters
 * - Renders SweetCard components from DB response
 *
 * Usage: drop this file into your React app and adapt the API endpoint to your backend.
 */

function SweetCard({ sweet }) {
    return (
        <div className="sweet-card">
            <div className="sweet-card-name">{sweet.name}</div>
            <div className="sweet-card-category">{sweet.category}</div>
            <div className="sweet-card-price">${Number(sweet.price ?? 0).toFixed(2)}</div>
        </div>
    );
}

function Pagination({ page, totalPages, onPageChange }) {
    const pagesToShow = 5;
    let start = Math.max(1, page - Math.floor(pagesToShow / 2));
    let end = Math.min(totalPages, start + pagesToShow - 1);
    start = Math.max(1, end - pagesToShow + 1);
    const pages = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return (
        <div className="sweet-pagination">
            <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
                Prev
            </button>
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={p === page ? "sweet-active-page" : undefined}
                >
                    {p}
                </button>
            ))}
            <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                Next
            </button>
        </div>
    );
}

function FilterModal({ initial, onClose, onApply }) {
    const [category, setCategory] = useState(initial.category || "");
    const [minPrice, setMinPrice] = useState(initial.minPrice ?? "");
    const [maxPrice, setMaxPrice] = useState(initial.maxPrice ?? "");

    const apply = () => {
        const mp = minPrice === "" ? undefined : Number(minPrice);
        const xp = maxPrice === "" ? undefined : Number(maxPrice);
        onApply({ category: category || undefined, minPrice: mp, maxPrice: xp });
        onClose();
    };

    return (
        <div className="sweet-modal-backdrop">
            <div className="sweet-modal">
                <h3>Filter sweets</h3>
                <div style={{ marginBottom: 8 }}>
                    <label>
                        Category
                        <input
                            className="sweet-input"
                            value={category}
                            placeholder="e.g., Chocolates"
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>
                        Min price
                        <input
                            className="sweet-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Max price
                        <input
                            className="sweet-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </label>
                </div>
                <div className="sweet-modal-actions">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={apply}>OK</button>
                </div>
            </div>
        </div>
    );
}

function AddModal({ onClose, onAdd }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");

    const submit = () => {
        const parsed = Number(price);
        if (!name.trim()) return alert("Please enter a name.");
        if (isNaN(parsed) || parsed < 0) return alert("Please enter a valid non-negative price.");
        const cat = category == null ? null : category.trim();
        const payload = { name: name.trim(), price: parsed };
        // send null for empty category (avoids sending "undefined")
        if (cat && cat.length > 0) payload.category = cat;
        else payload.category = null;
        onAdd(payload);
    };

    return (
        <div className="sweet-modal-backdrop">
            <div className="sweet-modal">
                <h3>Add sweet</h3>
                <div style={{ marginBottom: 8 }}>
                    <label htmlFor="name">name</label>
                    <input
                        id="name"
                        name="name"
                        className="sweet-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>
                        Category
                        <input className="sweet-input" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Price
                        <input
                            className="sweet-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </label>
                </div>
                <div className="sweet-modal-actions">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={submit}>Add</button>
                </div>
            </div>
        </div>
    );
}

export default function SweetDashboard() {
    const [sweets, setSweets] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const controllerRef = useRef(null);

    // debounce search input
    useEffect(() => {
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            setPage(1);
            fetchSweets(1, search, filter);
        }, 400);
        return () => clearTimeout(searchRef.current);
    }, [search]);

    useEffect(() => {
        fetchSweets(page, search, filter);
    }, [page]);

    const fetchSweets = useCallback(
        async (pageToLoad = 1, searchTerm = "", filterObj = {}) => {
            if (controllerRef.current) controllerRef.current.abort();
            controllerRef.current = new AbortController();
            setLoading(true);
            try {
                const data = await apiFetchSweets({
                    page: pageToLoad,
                    limit,
                    search: searchTerm,
                    category: filterObj.category,
                    minPrice: filterObj.minPrice,
                    maxPrice: filterObj.maxPrice,
                    signal: controllerRef.current.signal,
                });
                setSweets(data.items || []);
                const tot = data.total || 0;
                setTotalPages(Math.max(1, Math.ceil(tot / limit)));
            } catch (err) {
                if (err && err.name !== "AbortError") {
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        },
        [limit]
    );

    const handleApplyFilter = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
        fetchSweets(1, search, newFilter);
    };

    const resetFilter = () => {
        setFilter({});
        setPage(1);
        fetchSweets(1, search, {});
    };

    return (
        <div className="sweet-dashboard-layout">
            <div className="sweet-dashboard-inner">
                <div className="sweet-dashboard-header-row">
                <h1 className="sweet-dashboard-title">Sweet Shop</h1>
                <div className="sweet-dashboard-searchbar-row">
                    <input
                        placeholder="Search sweets by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sweet-search-input"
                    />
                    <div className="search-actions">
                        <button onClick={() => setIsFilterOpen(true)} title="Open filters">
                            Filter
                        </button>
                        <button onClick={() => setIsAddOpen(true)} title="Add sweet">
                            Add
                        </button>
                        <button onClick={resetFilter} title="Reset filters (clear)">
                            ✕
                        </button>
                    </div>
                </div>
            </div>

                <main className="sweet-main">
                {loading ? (
                    <p>Loading...</p>
                ) : sweets.length === 0 ? (
                    <p>No sweets found.</p>
                ) : (
                    <div className="sweet-grid">
                        {sweets.map((s) => (
                            <SweetCard key={s.id} sweet={s} />
                        ))}
                    </div>
                )}
                </main>

                <div className="sweet-pagination-wrapper-bottom">
                    <Pagination page={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
                </div>
            </div>

            {isFilterOpen && (
                <FilterModal initial={filter} onClose={() => setIsFilterOpen(false)} onApply={handleApplyFilter} />
            )}
            {isAddOpen && (
                <AddModal
                    onClose={() => setIsAddOpen(false)}
                    onAdd={async (payload) => {
                        try {
                            setLoading(true);
                            await apiAddSweet(payload);
                            // refresh list to show newly added item
                            await fetchSweets(1, search, filter);
                            setIsAddOpen(false);
                        } catch (err) {
                            console.error(err);
                            alert(err.message || "Failed to add sweet");
                        } finally {
                            setLoading(false);
                        }
                    }}
                />
            )}
        </div>
    );
}

/* Styles moved to `src/index.css` as .sweet-* utility classes */