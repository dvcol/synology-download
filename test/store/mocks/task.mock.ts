import { Task } from '../../../src/models';

export const mockWaiting: Task = JSON.parse(
  '{\n' +
    '                "id": "dbid_001",\n' +
    '                "type": "bt",\n' +
    '                "username": "admin",\n' +
    '                "title": "Synology_Download_Station_Web_API.pdf",\n' +
    '                "size": "9427312332",\n' +
    '                "status": "waiting",\n' +
    '                "status_extra": null,\n' +
    '                "additional":\n' +
    '                    {\n' +
    '                        "detail":\n' +
    '                            {\n' +
    '                                "connected_leechers": 0,\n' +
    '                                "connected_seeders": 0,\n' +
    '                                "create_time": "1341210005",\n' +
    '                                "destination": "Download",\n' +
    '                                "priority": "auto",\n' +
    '                                "total_peers": 0,\n' +
    '                                "uri": "http://mp3.com/mix.torrent"\n' +
    '                            },\n' +
    '                        "file":\n' +
    '                            [\n' +
    '                                {\n' +
    '                                    "filename": "mix001.mp3",\n' +
    '                                    "priority": "normal",\n' +
    '                                    "size": "41835",\n' +
    '                                    "size_downloaded": "0"\n' +
    '                                },\n' +
    '                                {\n' +
    '                                    "filename": "mix002.mp3",\n' +
    '                                    "priority": "normal",\n' +
    '                                    "size": "31689",\n' +
    '                                    "size_downloaded": "0"\n' +
    '                                }\n' +
    '                            ]\n' +
    '                    }\n' +
    '            }'
);

export const mockDownloading: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "ubuntu-21.04-desktop-amd64.iso.torrent",\n' +
    '        "size": "123456",\n' +
    '        "status": "downloading",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "detail":\n' +
    '                    {\n' +
    '                        "connected_leechers": 0,\n' +
    '                        "connected_seeders": 0,\n' +
    '                        "create_time": "1341210005",\n' +
    '                        "destination": "Download",\n' +
    '                        "priority": "auto",\n' +
    '                        "total_peers": 0,\n' +
    '                        "uri": "http://mp3.com/mix.torrent"\n' +
    '                    },\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "54642",\n' +
    '                        "size_uploaded": "435",\n' +
    '                        "speed_download": "2605",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockPaused: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "sublime_text_build_4113_x64_setup.exe",\n' +
    '        "size": "123345246",\n' +
    '        "status": "paused",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "543642",\n' +
    '                        "size_uploaded": "435",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockFinishing: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "ideaIU-2021.2.1.exe",\n' +
    '        "size": "88888888",\n' +
    '        "status": "finishing",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "88888888",\n' +
    '                        "size_uploaded": "435",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockFinished: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "IMG_3391.jpg",\n' +
    '        "size": "123123145",\n' +
    '        "status": "finished",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "123123145",\n' +
    '                        "size_uploaded": "435",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockHash: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "angular-testbed.zip",\n' +
    '        "size": "12312314512",\n' +
    '        "status": "hash_checking",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "12312314512",\n' +
    '                        "size_uploaded": "435",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockSeeding: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "GitKrakenSetup.exe",\n' +
    '        "size": "1234512",\n' +
    '        "status": "seeding",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "1234512",\n' +
    '                        "size_uploaded": "1231",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockHostingWaiting: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "Package%20Control.sublime-settings",\n' +
    '        "size": "1234512",\n' +
    '        "status": "filehosting_waiting",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "1234512",\n' +
    '                        "size_uploaded": "1231",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockExtracting: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "RainbowCSV.sublime-color-scheme",\n' +
    '        "size": "1234512",\n' +
    '        "status": "extracting",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "1234512",\n' +
    '                        "size_uploaded": "1231",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);
export const mockError: Task = JSON.parse(
  '{\n' +
    '        "id": "dbid_001",\n' +
    '        "type": "bt",\n' +
    '        "username": "admin",\n' +
    '        "title": "MakeExecutableIfNot.py",\n' +
    '        "size": "1234512",\n' +
    '        "status": "error",\n' +
    '        "status_extra": null,\n' +
    '        "additional":\n' +
    '            {\n' +
    '                "transfer":\n' +
    '                    {\n' +
    '                        "size_downloaded": "1234512",\n' +
    '                        "size_uploaded": "1231",\n' +
    '                        "speed_download": "0",\n' +
    '                        "speed_upload": "0"\n' +
    '                    }\n' +
    '            }\n' +
    '    }'
);

export const mockTasks: Task[] = [
  mockDownloading,
  mockWaiting,
  mockPaused,
  mockFinishing,
  mockFinished,
  mockHash,
  mockSeeding,
  mockHostingWaiting,
  mockExtracting,
  mockError,
  JSON.parse(
    '{\n' +
      '        "id": "dbid_001",\n' +
      '        "type": "bt",\n' +
      '        "username": "admin",\n' +
      '        "title": "TOP 100 MIX",\n' +
      '        "size": "9427312332",\n' +
      '        "status": "downloading",\n' +
      '        "status_extra": null,\n' +
      '        "additional":\n' +
      '            {\n' +
      '                "detail":\n' +
      '                    {\n' +
      '                        "connected_leechers": 0,\n' +
      '                        "connected_seeders": 0,\n' +
      '                        "create_time": "1341210005",\n' +
      '                        "destination": "Download",\n' +
      '                        "priority": "auto",\n' +
      '                        "total_peers": 0,\n' +
      '                        "uri": "http://mp3.com/mix.torrent"\n' +
      '                    },\n' +
      '                "file":\n' +
      '                    [\n' +
      '                        {\n' +
      '                            "filename": "mix001.mp3",\n' +
      '                            "priority": "normal",\n' +
      '                            "size": "41835",\n' +
      '                            "size_downloaded": "0"\n' +
      '                        },\n' +
      '                        {\n' +
      '                            "filename": "mix002.mp3",\n' +
      '                            "priority": "normal",\n' +
      '                            "size": "31689",\n' +
      '                            "size_downloaded": "0"\n' +
      '                        }\n' +
      '                    ]\n' +
      '            }\n' +
      '    }'
  ),
  JSON.parse(
    '{\n' +
      '        "id": "dbid_002",\n' +
      '        "type": "http",\n' +
      '        "username": "user1",\n' +
      '        "title": "short clip",\n' +
      '        "size": "112092412",\n' +
      '        "status": "finished",\n' +
      '        "status_extra": null,\n' +
      '        "additional":\n' +
      '            {\n' +
      '                "detail":\n' +
      '                    {\n' +
      '                        "connected_leechers": 0,\n' +
      '                        "connected_seeders": 0,\n' +
      '                        "create_time": "1356214565",\n' +
      '                        "destination": "Download",\n' +
      '                        "priority": "auto",\n' +
      '                        "total_peers": 0,\n' +
      '                        "uri": "http://mymovies.com/mv.avi"\n' +
      '                    }\n' +
      '            }\n' +
      '    }'
  ),
  JSON.parse(
    '{\n' +
      '        "id": "dbid_001",\n' +
      '        "type": "bt",\n' +
      '        "username": "admin",\n' +
      '        "title": "File 1",\n' +
      '        "size": "123456",\n' +
      '        "status": "downloading",\n' +
      '        "status_extra": null,\n' +
      '        "additional":\n' +
      '            {\n' +
      '                "transfer":\n' +
      '                    {\n' +
      '                        "size_downloaded": "12345",\n' +
      '                        "size_uploaded": "1231",\n' +
      '                        "speed_download": "256",\n' +
      '                        "speed_upload": "0"\n' +
      '                    }\n' +
      '            }\n' +
      '    }'
  ),
  JSON.parse(
    '{\n' +
      '        "id": "dbid_002",\n' +
      '        "type": "http",\n' +
      '        "username": "bbb",\n' +
      '        "title": "File 2",\n' +
      '        "size": "654321",\n' +
      '        "status": "waiting",\n' +
      '        "status_extra": null\n' +
      '    }'
  ),
  JSON.parse(
    '{\n' +
      '        "id": "dbid_003",\n' +
      '        "type": "ftp",\n' +
      '        "username": "user1",\n' +
      '        "title": "File 3",\n' +
      '        "size": "654321",\n' +
      '        "status": "finished",\n' +
      '        "status_extra": null\n' +
      '    }'
  ),
];
