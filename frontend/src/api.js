import axios from 'axios';

// 创建一个 axios 实例
const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers:{
        'Content-Type': 'application/json',
    }
});

// 请求拦截器， 添加Token到请求头
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
})

// 响应拦截器， 可以处理token过期等问题
apiClient.interceptors.response.use((response)=>{
    return response;
}, (error)=>{
    if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location = '/login';
    }
    return Promise.reject(error);
});

export const setToken = (token, expiresIn) => {
    localStorage.setItem('token', token);

    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem('toeknExpiration', expirationTime);

    setTimeout(()=> {
        removeToken();
    }, expiresIn * 1000);
};

export const removeToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
}

export const isTokenExpired = () => {
    const expirationTime = localStorage.getItem('tokenExpiration');
    return Date.now() > expirationTime;
}

export default apiClient;