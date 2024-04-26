'use client';
import axios from 'axios';
import { useMemo } from 'react';
const baseURL = 'http://127.0.0.1:8070/';

function useApi() {
    //axios.defaults.withCredentials = true;

    const axiosConfig = {
        baseURL: baseURL,
        //withCredentials: true,
    };

    const axiosInstance = axios.create(axiosConfig);
    return useMemo(() => {
        return {
            get: axiosInstance.get,
            post: axiosInstance.post,
            delete: axiosInstance.delete,
            patch: axiosInstance.patch,
            put: axiosInstance.put,
        };
    }, []);
}

export default useApi;
