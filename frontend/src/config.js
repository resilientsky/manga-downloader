const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
        const url = new URL(envUrl);
        // Replace hostname with window.location.hostname to allow network access
        return `${url.protocol}//${window.location.hostname}:${url.port}`;
    } catch (e) {
        return envUrl;
    }
};

const API_BASE_URL = getApiUrl();

export default API_BASE_URL;
