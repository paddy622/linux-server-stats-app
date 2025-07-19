import { useState, useEffect } from 'react';

const useStaticData = (baseUrl) => {
    const [staticData, setStaticData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStaticData = async () => {
        try {
            setLoading(true);
            setError(null);

            const staticEndpoint = `${baseUrl}/api/static`;
            console.log('Fetching static data from:', staticEndpoint);

            const response = await fetch(staticEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Static data received:', result);

            if (result.type === 'static' && result.data) {
                setStaticData(result.data);
                return result.data;
            } else {
                throw new Error('Invalid static data format received');
            }
        } catch (error) {
            console.error('Failed to fetch static data:', error);
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (baseUrl) {
            fetchStaticData();
        }
    }, [baseUrl]);

    return {
        staticData,
        loading,
        error,
        refetch: fetchStaticData
    };
};

export default useStaticData;
