import axios from 'axios';
import { useMemo } from 'react';
import dotenv from 'dotenv';
dotenv.config();

const useApi = () => {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    const axiosConfig = {
        baseURL: baseURL,
        crossdomain: true,
    };

    const axiosInstance = axios.create(axiosConfig);

    return useMemo(() => ({
        get: axiosInstance.get,
        post: axiosInstance.post,
        delete: axiosInstance.delete,
        patch: axiosInstance.patch,
        put: axiosInstance.put,
    }), [axiosInstance]);
};

export default useApi;
