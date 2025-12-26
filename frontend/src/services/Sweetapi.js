// Centralized API helpers for sweets
// Exports a `fetchSweets` function used by the UI to request paginated/filterable sweets data.

/**
 * Fetch sweets from backend.
 * Accepts an options object: { page, limit, search, category, minPrice, maxPrice, signal }
 * Returns parsed JSON expected to be { items: [], total: number }
 */
export async function fetchSweets({
	page = 1,
	limit = 12,
	search = "",
	category,
	minPrice,
	maxPrice,
	signal,
} = {}) {
	const params = new URLSearchParams();
	params.set('page', String(page));
	params.set('limit', String(limit));
	if (search != null && search !== "") params.set('search', String(search));
	if (category != null) params.set('category', String(category));
	if (minPrice != null) params.set('minPrice', String(minPrice));
	if (maxPrice != null) params.set('maxPrice', String(maxPrice));

	const url = `http://localhost:8080/api/sweets/get?${params.toString()}`;
	const response = await fetch(url, { method: 'GET', signal });

	if (!response.ok) {
		const errorText = await response.text().catch(() => null);
		throw new Error(errorText || `Request failed with status ${response.status}`);
	}

	return await response.json();
}



/**
 * Add a new sweet to backend.
 * payload: { name: string, category?: string, price: number }
 * Returns the created sweet object (parsed JSON) on success.
 */
export async function addSweet(payload = {}) {
	const response = await fetch(`http://localhost:8080/api/sweets/post`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => null);
		throw new Error(text || `Request failed with status ${response.status}`);
	}

	return await response.json();
}

// update default export for convenience
// export default {
// 	fetchSweets,
// 	addSweet,
// };
