import type { InterceptPayload, InterceptResponse, TaskCreateResponse, TaskForm } from '@src/models';
import type { DownloadFilenameSuggestion, DownloadItem } from '@src/utils';
import type { Observable } from 'rxjs';

import { ChromeMessageType } from '@src/models';
import { sendActiveTabMessage } from '@src/utils';
import { switchMap, tap } from 'rxjs';

import { LoggerService } from '../logger/logger.service';
import { QueryService } from '../query/query.service';
import { DownloadService } from './download.service';

interface InterceptOptions { erase?: boolean; resume?: boolean }
export class InterceptService {
  static transfer<T extends DownloadItem>(
    download: T,
    { erase, resume }: InterceptOptions,
    callback?: () => void,
  ): Observable<TaskCreateResponse | void> {
    return DownloadService.pause(download.id).pipe(
      switchMap(() => QueryService.createTask({ url: [download.finalUrl] }, { source: download.referrer })),
      tap({
        error: (err: Error) => {
          callback?.();
          LoggerService.error(`Failed to create task for download '${download.id}'`, { err, download });
          if (resume) {
            DownloadService.resume(download.id).subscribe();
          } else if (erase) {
            DownloadService.erase({ id: download.id }).subscribe();
          }
        },
        complete: () => {
          callback?.();
          LoggerService.debug(`Download ${download.id} intercepted and transferred successfully.`, { download });
          if (erase) DownloadService.erase({ id: download.id }).subscribe();
        },
      }),
    );
  }

  static openMenu<T extends DownloadItem>(
    download: T,
    { erase, resume }: InterceptOptions = {},
    callback?: (suggestion?: DownloadFilenameSuggestion) => void,
  ): Observable<InterceptResponse> {
    const form: TaskForm = { uri: download.finalUrl, source: download.referrer };
    return DownloadService.pause(download.id).pipe(
      switchMap(() =>
        sendActiveTabMessage<InterceptPayload, InterceptResponse>({
          type: ChromeMessageType.intercept,
          payload: form,
        }),
      ),
      tap({
        next: ({ folder, message, aborted, resume: _resume }) => {
          const response = folder ? { filename: `.${folder}/${download?.filename?.split('/')?.pop()}` } : undefined;

          callback?.(response);

          if (message) LoggerService.debug(`Intercept for download ${download.id} exited with message`, message);

          if (_resume || (aborted && resume)) {
            DownloadService.resume(download.id).subscribe();
          } else if (erase) {
            DownloadService.erase({ id: download.id }).subscribe();
          }
        },
        error: (err: Error) => {
          callback?.();
          LoggerService.error(`Failed to send download '${download.id}' to active tab`, { err, download });
          if (resume) {
            DownloadService.resume(download.id).subscribe();
          } else if (erase) {
            DownloadService.erase({ id: download.id }).subscribe();
          }
        },
      }),
    );
  }
}
