export const registeruser = async ({name,email,password})=>{
    const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    const { role , token } = data;
    updateUserSession(token,role);
    return data;
}

export const loginuser = async ({email,password}) => {
    const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    // store the JWT token and role (use token returned by backend)
    updateUserSession(data.token, data.role);
    return data;
}

const updateUserSession = (token, role) => {
    // .setItem automatically updates the value if 'jwt_token' already exists
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_role', role);
    // Try to decode token to extract subject (user id) and store it for client use
    try {
        if (token) {
            // JWT payload is the second part
            const parts = token.split('.');
            if (parts.length > 1) {
                const payload = parts[1];
                // base64url -> base64
                const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
                const json = decodeURIComponent(atob(b64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const obj = JSON.parse(json);
                if (obj && obj.sub) {
                    localStorage.setItem('user_id', obj.sub);
                }
            }
        }
    } catch (e) {
        console.warn('Failed to decode token for user id', e);
    }
    console.log("Session updated successfully.");
};
