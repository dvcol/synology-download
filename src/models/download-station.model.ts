export interface DownloadStationConfig {
  /** Max BT download speed in KB/s (“0” means unlimited) */
  bt_max_download: number;
  /** Max BT upload speed in KB/s (“0” means unlimited) */
  bt_max_upload: number;
  /** Max eMule download speed in KB/s (“0” means unlimited) */
  emule_max_download: number;
  /** Max eMule upload speed in KB/s (“0” means unlimited) */
  emule_max_upload: number;
  /** Max NZB download speed in KB/s (“0” means unlimited) */
  nzb_max_download: number;
  /** Max HTTP download speed in KB/s (“0” means unlimited).
   *
   * Currently http_max_download and ftp_max_download share the same config value. When
   * both parameters are requested to be set at the same time, the requested ftp_max_download rate
   * will overwrite the requested http_max_download rate.
   *
   * Considering identical rates may be simultaneously used by the other packages other than
   * Download Station, the HTTP and FTP max download rates will not affect tasks whose current status
   * is “downloading”. New rates will only be applied to those newly added/resumed HTTP/FTP tasks.
   */
  http_max_download: number;
  /** Max FTP download speed in KB/s (“0” means unlimited). For more info, please see Limitations.
   *
   * Currently http_max_download and ftp_max_download share the same config value. When
   * both parameters are requested to be set at the same time, the requested ftp_max_download rate
   * will overwrite the requested http_max_download rate.
   *
   * Considering identical rates may be simultaneously used by the other packages other than
   * Download Station, the HTTP and FTP max download rates will not affect tasks whose current status
   * is “downloading”. New rates will only be applied to those newly added/resumed HTTP/FTP tasks.
   */
  ftp_max_download: number;
  /** If eMule service is enabled */
  emule_enabled: boolean;
  /** If Auto unzip service is enabled for users except admin or administrators group */
  unzip_service_enabled: boolean;
  /** Default destination */
  default_destination: string;
  /** Emule default destination */
  emule_default_destination: string;
}

export const defaultConfig: DownloadStationConfig = {
  bt_max_download: 0,
  bt_max_upload: 0,
  emule_max_download: 0,
  emule_max_upload: 0,
  nzb_max_download: 0,
  http_max_download: 0,
  ftp_max_download: 0,
  emule_enabled: false,
  unzip_service_enabled: false,
  default_destination: '',
  emule_default_destination: '',
};

export interface DownloadStationInfo {
  /** Build number of Download Station 1 and later */
  version: number;
  /** Full version string of Download Station 1 and later */
  version_string: string;
  /** If the logged in user is manager */
  is_manager: boolean;
}

export interface DownloadStationStatistic {
  /** Total download speed except for eMule: byte/s 1 and later */
  speed_download: number;
  /**  Total upload speed except for eMule: byte/s 1 and later */
  speed_upload: number;
  /**  Total eMule download speed: byte/s 1 and later */
  emule_speed_download: number;
  /** Total eMule upload speed: byte/s */
  emule_speed_upload: number;
}
