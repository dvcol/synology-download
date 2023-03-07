import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import { DownloadItem, TaskItem } from '@src/components';

import type { Content, Download, Task } from '@src/models';
import { ContentSource } from '@src/models';
import type { StoreState } from '@src/store';
import { getContentsForActiveTab, getTabOrFirst } from '@src/store/selectors';

import { ContentEmpty } from './content-empty';

export const ContentPanel = () => {
  const tab = useSelector(getTabOrFirst);
  const contents = useSelector<StoreState, Content[]>(getContentsForActiveTab);

  return (
    <Fragment>
      {contents?.length ? (
        contents.map(item =>
          item.source === ContentSource.Download ? (
            <DownloadItem key={item.id} download={item as Download} hideStatus={(tab?.status?.length ?? 0) <= 1} />
          ) : (
            <TaskItem key={item.id} task={item as Task} hideStatus={(tab?.status?.length ?? 0) <= 1} />
          ),
        )
      ) : (
        <ContentEmpty />
      )}
    </Fragment>
  );
};
