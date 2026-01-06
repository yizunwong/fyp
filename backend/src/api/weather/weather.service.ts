import { Injectable, Logger } from '@nestjs/common';
import { WeatherAlertResponseDto } from './dto/responses/weather-alert-response.dto';
import { formatError } from 'src/common/helpers/error';

interface WeatherWarningResponse {
  warning_issue: {
    issued: string;
    title_bm: string;
    title_en: string;
  };
  valid_from: string | null;
  valid_to: string | null;
  heading_en: string;
  text_en: string;
  instruction_en: string | null;
  heading_bm: string;
  text_bm: string;
  instruction_bm: string | null;
}

interface CachedData {
  data: WeatherWarningResponse[];
  timestamp: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly WEATHER_API_URL = 'https://api.data.gov.my/weather/warning';
  // Cache for 15 minutes (900000 ms) - weather warnings don't change frequently
  private readonly CACHE_TTL = 15 * 60 * 1000;
  private cache: CachedData | null = null;

  /**
   * Extract location names from warning text
   */
  private extractLocation(warning: WeatherWarningResponse): string {
    const text = warning.text_en || warning.text_bm || '';

    // Try to extract location from common patterns
    // Look for "over the states of" or "over the waters of"
    const statesMatch = text.match(/states of\s+([^.]+)/i);
    if (statesMatch) {
      const locations = statesMatch[1]
        .split(/,|and/)
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0)
        .slice(0, 3); // Get first few locations
      return locations.join(', ') || 'Multiple Areas';
    }

    const watersMatch = text.match(/waters of\s+([^.]+)/i);
    if (watersMatch) {
      return watersMatch[1].trim().split(',')[0].trim() || 'Coastal Areas';
    }

    // Fallback to heading
    return warning.heading_en || warning.heading_bm || 'Unknown Location';
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    if (!this.cache) {
      return false;
    }
    const now = Date.now();
    return now - this.cache.timestamp < this.CACHE_TTL;
  }

  /**
   * Fetch weather warnings from Malaysian government API with caching
   */
  private async fetchWeatherWarnings(
    limit?: number,
  ): Promise<WeatherWarningResponse[]> {
    // Check cache first
    if (this.isCacheValid() && this.cache) {
      this.logger.debug('Returning weather warnings from cache');
      const cachedData = this.cache.data;

      // Apply limit to cached data if needed
      if (limit && cachedData.length > limit) {
        return cachedData.slice(0, limit);
      }

      return cachedData;
    }

    try {
      this.logger.log('Fetching weather warnings from API');
      const url = new URL(this.WEATHER_API_URL);

      // Don't apply limit when fetching for cache - we want all data
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Weather API returned status ${response.status}`);
      }

      const data = (await response.json()) as
        | WeatherWarningResponse
        | WeatherWarningResponse[];

      // Handle both array and single object responses
      let warnings: WeatherWarningResponse[];
      if (Array.isArray(data)) {
        warnings = data;
      } else {
        warnings = [data];
      }

      // Update cache
      this.cache = {
        data: warnings,
        timestamp: Date.now(),
      };

      this.logger.log(
        `Cached ${warnings.length} weather warnings for ${this.CACHE_TTL / 1000 / 60} minutes`,
      );

      // Apply limit if needed
      if (limit && warnings.length > limit) {
        return warnings.slice(0, limit);
      }

      return warnings;
    } catch (error) {
      this.logger.error(
        `Failed to fetch weather warnings: ${formatError(error)}`,
      );

      // If cache exists but is expired, return stale cache as fallback
      if (this.cache) {
        this.logger.warn('API fetch failed, returning stale cache data');
        const cachedData = this.cache.data;
        if (limit && cachedData.length > limit) {
          return cachedData.slice(0, limit);
        }
        return cachedData;
      }

      throw error;
    }
  }

  /**
   * Transform weather warning data into weather alerts
   */
  private transformToAlerts(
    warnings: WeatherWarningResponse[],
  ): WeatherAlertResponseDto[] {
    return warnings
      .filter((warning) => {
        // Filter out "No Advisory" warnings
        return (
          warning.heading_en !== 'No Advisory' &&
          warning.heading_bm !== 'Tiada Nasihat'
        );
      })
      .map((warning) => {
        const location = this.extractLocation(warning);
        const message =
          warning.text_en ||
          warning.text_bm ||
          warning.heading_en ||
          warning.heading_bm;
        const updatedAt = warning.warning_issue.issued
          ? new Date(warning.warning_issue.issued)
          : new Date();

        return {
          location,
          message,
          updatedAt,
        };
      });
  }

  /**
   * Get weather alerts for all locations with pagination
   */
  async getWeatherAlerts(
    limit: number = 5,
    page: number = 1,
    locationName?: string,
  ): Promise<{ alerts: WeatherAlertResponseDto[]; total: number }> {
    try {
      // Fetch more warnings than needed to allow filtering and pagination
      const warnings = await this.fetchWeatherWarnings(100);
      let alerts = this.transformToAlerts(warnings);

      // Filter by location name if provided
      if (locationName) {
        const searchTerm = locationName.toLowerCase();
        alerts = alerts.filter((alert) =>
          alert.location.toLowerCase().includes(searchTerm),
        );
      }

      const total = alerts.length;

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedAlerts = alerts.slice(skip, skip + limit);

      return {
        alerts: paginatedAlerts,
        total,
      };
    } catch (error) {
      this.logger.error(`Failed to get weather alerts: ${formatError(error)}`);
      // Return empty array on error to prevent breaking the frontend
      return { alerts: [], total: 0 };
    }
  }
}
