const BASE = "http://localhost:8080/api";

async function request(path, opts = {}) {
	const { signal } = opts;
	const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
	let headers = opts.headers || {};
	if (headers instanceof Headers) {
		headers = Object.fromEntries(headers.entries());
	}
	if (token) {
		headers = { ...headers, Authorization: `Bearer ${token}` };
	} else {
		if ((opts.method || '').toUpperCase() === 'POST' || (opts.method || '').toUpperCase() === 'PUT' || (opts.method || '').toUpperCase() === 'DELETE') {
			console.warn('No auth token present for request to', path);
		}
	}
	const res = await fetch(path, { ...opts, signal, headers });
	if (!res.ok) {
		const text = await res.text().catch(() => null);
		const err = new Error(text || `Request failed with status ${res.status}`);
		err.status = res.status;
		throw err;
	}

	const text = await res.text().catch(() => null);
	if (!text) return null;
	try {
		return JSON.parse(text);
	} catch (e) {
		return text;
	}
}

export async function createPost(payload = {}, { signal } = {}) {
	return await request(`${BASE}/posts`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		signal,
	});
}

export async function search(q = "", { signal } = {}) {
	const params = new URLSearchParams();
	params.set("q", String(q ?? ""));
	return await request(`${BASE}/search?${params.toString()}`, { method: "GET", signal });
}

export async function getAllPosts({ communityId, signal } = {}) {
	const params = new URLSearchParams();
	if (communityId != null) {
		params.set("communityId", String(communityId));
	}
	const queryString = params.toString();
	const url = queryString ? `${BASE}/posts?${queryString}` : `${BASE}/posts`;
	return await request(url, { method: "GET", signal });
}

export async function getPost(id, { signal } = {}) {
	if (id == null) throw new Error("post id is required");
	return await request(`${BASE}/posts/${encodeURIComponent(String(id))}`, { method: "GET", signal });
}

export async function getPostComments(id, { signal } = {}) {
	if (id == null) throw new Error("post id is required");
	return await request(`${BASE}/posts/${encodeURIComponent(String(id))}/comments`, { method: "GET", signal });
}

export async function getCommentChildren(id, { signal } = {}) {
    if (id == null) throw new Error("comment id is required");
    return await request(`${BASE}/comments/${encodeURIComponent(String(id))}/comments`, { method: "GET", signal });
}

export async function createComment(payload = {}, { signal } = {}) {
	return await request(`${BASE}/comments`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
		signal,
	});
}

export async function getAllCommunities({ signal } = {}) {
	return await request(`${BASE}/communities`, { method: "GET", signal });
}

export async function getCommunitiesPaginated(page = 0, size = 15, { signal } = {}) {
	const params = new URLSearchParams();
	params.set("page", String(page));
	params.set("size", String(size));
	return await request(`${BASE}/communities/paginated?${params.toString()}`, { method: "GET", signal });
}

export async function getAllFlags({ signal } = {}) {
	return await request(`${BASE}/flags`, { method: "GET", signal });
}

export default {
	createPost,
	search,
	getAllPosts,
	getPost,
	getPostComments,
	getCommentChildren,
	createComment,
	getAllCommunities,
	getCommunitiesPaginated,
	getAllFlags,
};
