import React, { createContext, useContext } from 'react';
import { useApp } from '../context/AppContext';

const FREE_CHARTS = new Set(['natal', 'd1', 'd9', 'latest']);
const PREMIUM_CHARTS = new Set(['d2', 'd10', 'd11', 'transit', 'synastry', 'varshaphala']);

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { profile } = useApp();
  
  const isPremium = Boolean(
    profile?.subscription?.status === 'active' &&
    profile?.subscription?.endDate &&
    new Date(profile.subscription.endDate) > new Date()
  );

  const isChartLocked = (chartType) => {
    if (!chartType) return false;
    const cleanType = String(chartType).toLowerCase();
    if (FREE_CHARTS.has(cleanType)) return false;
    if (PREMIUM_CHARTS.has(cleanType)) return !isPremium;
    return !isPremium;
  };

  const getRecommendedAgent = (chartType) => {
    const cleanType = String(chartType || 'natal').toLowerCase();
    switch (cleanType) {
      case 'd9':
        return 'union';       // Relationship / Marriage Agent
      case 'd10':
        return 'career';      // Career Agent
      case 'd2':
        return 'wealth';      // Wealth Agent
      case 'd11':
        return 'abundance';   // Growth / Abundance Agent
      case 'transit':
        return 'forecast';    // Timing / Forecast Agent
      case 'natal':
      case 'd1':
      default:
        return 'general';     // Natal Guide
    }
  };

  return (
    <SubscriptionContext.Provider value={{ isPremium, isChartLocked, getRecommendedAgent }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    return {
      isPremium: false,
      isChartLocked: (type) => PREMIUM_CHARTS.has(String(type).toLowerCase()),
      getRecommendedAgent: (type) => {
        const t = String(type || 'd1').toLowerCase();
        if (t === 'd9') return 'union';
        if (t === 'd10') return 'career';
        if (t === 'd2') return 'wealth';
        if (t === 'd11') return 'abundance';
        if (t === 'transit') return 'forecast';
        return 'general';
      },
    };
  }
  return ctx;
}

export default function SubscriptionGuard({ children }) {
  return children;
}
