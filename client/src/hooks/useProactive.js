import { useState, useEffect } from 'react';
import { useApi } from '../services/api';

export function useProactive() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const api = useApi();

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/recommendations');
            setRecommendations(response.data);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const dismissRecommendation = async (id) => {
        try {
            await api.post(`/recommendations/${id}/dismiss`);
            setRecommendations(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error('Failed to dismiss recommendation:', error);
        }
    };

    const executeRecommendation = async (id) => {
        try {
            const response = await api.post(`/recommendations/${id}/execute`);
            setRecommendations(prev => prev.filter(r => r._id !== id));
            return response.data.command;
        } catch (error) {
            console.error('Failed to execute recommendation:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchRecommendations();
        // Refresh every 5 minutes
        const interval = setInterval(fetchRecommendations, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return {
        recommendations,
        loading,
        refresh: fetchRecommendations,
        dismiss: dismissRecommendation,
        execute: executeRecommendation
    };
}
