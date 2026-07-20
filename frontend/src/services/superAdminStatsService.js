import api from "./api";

let statsCache = null;
let statsCacheTime = 0;
let statsPendingRequest = null;

const CACHE_DURATION = 30000; // 30 secondes

export const getSuperAdminStats = async () => {
  const now = Date.now();

  if (statsCache && now - statsCacheTime < CACHE_DURATION) {
    return statsCache;
  }

  if (statsPendingRequest) {
    return statsPendingRequest;
  }

  statsPendingRequest = api
    .get("/super-admin/stats")
    .then((response) => {
      const stats =
        response.data.stats || response.data.data || response.data || {};

      statsCache = stats;
      statsCacheTime = Date.now();

      return stats;
    })
    .finally(() => {
      statsPendingRequest = null;
    });

  return statsPendingRequest;
};

export const clearSuperAdminStatsCache = () => {
  statsCache = null;
  statsCacheTime = 0;
  statsPendingRequest = null;
};