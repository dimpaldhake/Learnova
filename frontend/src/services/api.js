import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});


// Add access token to protected requests
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (
            token &&
            !config.url.includes("login/") &&
            !config.url.includes("register/") &&
            !config.url.includes("token/refresh/")
        ) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
);


// Automatically refresh expired access token
API.interceptors.response.use(
    (response) => {
        return response;
    },

    async (error) => {
        const originalRequest = error.config;

        const status = error.response?.status;
        const errorCode = error.response?.data?.code;

        /*
         * Refresh token only when Django/SimpleJWT
         * tells us that the JWT is invalid or expired.
         */
        const tokenIsInvalid =
            status === 401 ||
            (
                status === 403 &&
                errorCode === "token_not_valid"
            );

        if (
            tokenIsInvalid &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url.includes("token/refresh/")
        ) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refresh_token");

            if (refreshToken) {
                try {
                    const response = await axios.post(
                        "http://127.0.0.1:8000/api/token/refresh/",
                        {
                            refresh: refreshToken,
                        }
                    );

                    const newAccessToken =
                        response.data.access;

                    localStorage.setItem(
                        "access_token",
                        newAccessToken
                    );

                    originalRequest.headers.Authorization =
                        `Bearer ${newAccessToken}`;

                    return API(originalRequest);

                } catch (refreshError) {
                    localStorage.removeItem(
                        "access_token"
                    );

                    localStorage.removeItem(
                        "refresh_token"
                    );

                    console.log(
                        "Session expired. Please login again."
                    );
                }
            }
        }

        /*
         * Important:
         * A normal 403 should NOT automatically refresh
         * the token. It means permission was denied.
         */
        return Promise.reject(error);
    }
);

export default API;
