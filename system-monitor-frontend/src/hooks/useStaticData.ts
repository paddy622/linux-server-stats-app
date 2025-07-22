import { useState, useEffect } from 'react';
import { StaticSystemInfo } from '@linux-server-stats/shared-types';

interface UseStaticDataReturn {
    staticData: StaticSystemInfo | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<StaticSystemInfo>;
}

const useStaticData = (baseUrl: string): UseStaticDataReturn => {
    const [staticData, setStaticData] = useState<StaticSystemInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStaticData = async (): Promise<StaticSystemInfo> => {
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setError(errorMessage);
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
