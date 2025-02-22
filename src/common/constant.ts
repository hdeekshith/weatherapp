export const CACHE_KEYS = {
  WEATHER: (city: string) => `weather_${city}`,
  FORECAST: (city: string) => `forecast_${city}`,
};
