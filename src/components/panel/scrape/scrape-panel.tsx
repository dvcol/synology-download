import AddLinkIcon from '@mui/icons-material/AddLink';
import DownloadIcon from '@mui/icons-material/Download';

import { Button, ButtonGroup, Card, CardContent, CardHeader } from '@mui/material';

import { DataGrid, GridFooter, GridFooterContainer, useGridApiContext } from '@mui/x-data-grid';

import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { forkJoin } from 'rxjs';

import { TaskDialog } from '@src/components';
import type { RootSlice, ScrapedContent, ScrapedSlice, TaskForm } from '@src/models';
import { ChromeMessageType, ColorLevel } from '@src/models';
import { ContainerService, DownloadService, LoggerService } from '@src/services';
import { clearScrapedContents } from '@src/store/actions';
import { getScrapedPage, getScrappedRows } from '@src/store/selectors';

import { sendActiveTabMessage, useI18n } from '@src/utils';

import type { CardProps } from '@mui/material';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import type { FC } from 'react';

type ScrapePanelProps = { cardProps?: CardProps };
export const ScrapePanel: FC<ScrapePanelProps> = ({ cardProps }) => {
  const i18n = useI18n('panel', 'scrape');
  const dispatch = useDispatch();

  const page = useSelector<RootSlice, ScrapedSlice['page']>(getScrapedPage);
  const rows = useSelector<RootSlice, GridRowsProp<ScrapedContent>>(getScrappedRows);

  const onScrape = () => {
    dispatch(clearScrapedContents());
    sendActiveTabMessage({ type: ChromeMessageType.scrap }).subscribe({
      error: error => LoggerService.error('Failed to send scrap trigger', error),
    });
  };

  useEffect(() => {
    onScrape();
  }, []);

  const columns: GridColDef<ScrapedContent>[] = [
    { field: 'type', headerName: i18n('column__type__label'), description: i18n('column__type__description'), flex: 1 },
    { field: 'title', headerName: i18n('column__title__label'), description: i18n('column__title__description'), flex: 2 },
    { field: 'name', headerName: i18n('column__name__label'), description: i18n('column__name__description'), flex: 4 },
    { field: 'src', headerName: i18n('column__url__label'), description: i18n('column__url__description'), flex: 4 },
  ];

  const [form, setForm] = React.useState<TaskForm>();
  const [open, setOpen] = React.useState<boolean>(false);

  const onFormClose = () => {
    setOpen(false);
    setForm(undefined);
  };

  const ScrapeFooter: FC = () => {
    const apiRef = useGridApiContext();
    const onCreateTask = () => {
      const _selected = Array.from(apiRef.current.getSelectedRows()?.values());
      const _form = { uri: _selected?.map(row => row?.src).join('\n') };
      LoggerService.debug('Opening form task of selected rows', _form);
      setForm(_form);
      setOpen(true);
    };
    const onDownload = () => {
      const selected = Array.from(apiRef.current.getSelectedRows()?.values());
      LoggerService.debug('Starting batch download of selected rows', selected);
      forkJoin(selected?.map(row => DownloadService.download({ url: row.src }))).subscribe({
        error: err => LoggerService.error('Failed to batch download', { err, selected }),
      });
    };
    return (
      <GridFooterContainer>
        <ButtonGroup
          variant="outlined"
          size="small"
          aria-label="download button group"
          sx={{
            ml: '1.5em',
            flex: '0 1 auto',
          }}
        >
          <Button color={ColorLevel.primary} startIcon={<AddLinkIcon />} onClick={onCreateTask}>
            {i18n('create__task')}
          </Button>
          <Button color={ColorLevel.secondary} startIcon={<DownloadIcon />} onClick={onDownload}>
            {i18n('download')}
          </Button>
        </ButtonGroup>

        <GridFooter sx={{ border: 'none', flex: '1 0 auto' }} />
      </GridFooterContainer>
    );
  };

  return (
    <Card
      raised={true}
      {...cardProps}
      sx={{
        ...cardProps?.sx,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 'calc(100% - 1rem)',
      }}
    >
      <CardHeader
        title={page?.title}
        subheader={page?.url}
        titleTypographyProps={{
          variant: 'h6',
          color: 'text.primary',
          fontSize: '1em',
          sx: {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: '1',
            WebkitBoxOrient: 'vertical',
          },
        }}
        subheaderTypographyProps={{
          variant: 'caption',
          fontSize: '0.875em',
          sx: {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: '-webkit-box',
            wordBreak: 'break-all',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
          },
        }}
        sx={{ p: '1em 1em 0', textTransform: 'capitalize' }}
      />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          p: '0.75em !important',
          pb: '0.75em',
          fontSize: '1em',
        }}
      >
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={columns}
          density={rows?.length > 10 ? 'compact' : 'standard'}
          slots={{ footer: ScrapeFooter }}
        />
      </CardContent>
      <TaskDialog
        open={open}
        taskForm={form}
        dialogProps={{ PaperProps: { sx: { maxHeight: 'calc(100% - 1em)' } } }}
        onClose={onFormClose}
        onCancel={onFormClose}
        onSubmit={onFormClose}
        container={ContainerService.getContainer.bind(ContainerService)}
      />
    </Card>
  );
};
