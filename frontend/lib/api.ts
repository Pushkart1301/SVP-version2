import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ FIX: added trailing slash
const api = axios.create({
    baseURL: `${API_URL}/api/v1/`,
});

// Attach token automatically
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }
    return config;
});

// ---------------- AUTH ----------------

// ✅ add trailing slash in endpoints
export const registerUser = async (data: any) => {
    const res = await api.post("auth/register/", data);
    return res.data;
};

export const loginUser = async (data: any) => {
    const res = await api.post("auth/login/", data);
    return res.data;
};

// ---------------- PLANNER ----------------

export const getVacationPlan = async (data: any) => {
    const res = await api.post("planner/recommend/", data);
    return res.data;
};

export default api;