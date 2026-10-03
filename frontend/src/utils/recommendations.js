export function hasRecommendations(recommendations) {
  return Array.isArray(recommendations) && recommendations.length > 0;
}

export function getRiskSummary(recommendations = []) {
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];

  return safeRecommendations.reduce(
    (summary, item) => {
      const urgency = (item?.urgency || 'LOW').toUpperCase();

      if (urgency === 'HIGH') summary.high += 1;
      else if (urgency === 'MEDIUM') summary.moderate += 1;
      else summary.low += 1;

      return summary;
    },
    { high: 0, moderate: 0, low: 0 }
  );
}
