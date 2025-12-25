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
    updateUserSession(data.name,data.role);
    return data;
}

const updateUserSession = (token, role) => {
    // .setItem automatically updates the value if 'jwt_token' already exists
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_role', role);
    console.log("Session updated successfully.");
};
