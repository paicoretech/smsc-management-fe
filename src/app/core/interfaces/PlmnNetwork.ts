export interface PlmnNetwork {
  id: number;
  mcc: string;
  mnc: string;
  network_name: string;
  plmn_country_id: number;
  country: string;
  country_code: string;
  country_iso: string;
  prefix_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlmnNetworkPayload {
  mnc: string;
  network_name: string;
  plmn_country_id: number;
}

export interface PlmnCountry {
  id: number;
  continent: string;
  country: string;
  country_code: string;
  phone_code: string;
  mcc: string;
  iso: string;
  timezone: string;
  timezone_utc?: string;
}

export interface PlmnPrefix {
  id: number;
  prefix: string;
  sn_range_start?: string | null;
  sn_range_stop?: string | null;
  plmn_id: number;
  mcc: string;
  mnc: string;
  network_name: string;
  country: string;
  country_code: string;
  country_iso: string;
}

export interface PlmnPrefixPayload {
  id?: number;
  prefix: string;
  sn_range_start: string | null;
  sn_range_stop: string | null;
  plmn_id: number;
}

export interface PlmnPage<T> {
  page: number;
  page_size: number;
  total_elements: number;
  total_pages: number;
  first_page: boolean;
  last_page: boolean;
  has_next: boolean;
  has_previous: boolean;
  data: T[];
}
