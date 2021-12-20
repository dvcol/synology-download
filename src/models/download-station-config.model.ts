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
  /** Max HTTP download speed in KB/s (“0” means unlimited). For more info, please see Limitations */
  http_max_download: number;
  /** Max FTP download speed in KB/s (“0” means unlimited). For more info, please see Limitations. */
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
