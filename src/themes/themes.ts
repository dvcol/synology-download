import { createTheme } from '@mui/material';

import type { Theme } from '@mui/material/styles/createTheme';
import type { Property } from 'csstype';

const scrollbar: Record<string, any> = {
  '&::-webkit-scrollbar': {
    width: '0.25em',
    height: '0.25em',
  },
  '&::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 0.375em rgba(0,0,0,0.00)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgb(150 150 150 / 50%)',
    boxShadow: 'inset 0 0 0.375em rgba(0, 0, 0, 0.1)',
    borderRadius: '0.5em',
  },
};

const common = {
  typography: {
    fontSize: 12,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: scrollbar,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: scrollbar,
      },
    },
    MuiTreeView: {
      styleOverrides: {
        root: scrollbar,
      },
    },
    MuiTreeItem: {
      styleOverrides: {
        label: { fontSize: 'inherit' },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: scrollbar,
        root: { fontSize: 'inherit' },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: 'inherit' },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          '@media (min-width: 0rem)': {
            minHeight: '3rem',
          },
          '@media (min-width: 37.5rem)': {
            minHeight: '3rem',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { minHeight: '1rem' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          padding: '0.75rem 1rem',
          minHeight: '1rem',
          minWidth: '5rem',
          textTransform: 'capitalize' as Property.TextTransform,
        },
      },
    },
    MuiTabScrollButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            opacity: '0.1',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          height: '100%',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        secondary: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        content: {
          width: '100%',
          margin: 0,
          overflow: 'hidden',
          alignItems: 'center',
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        action: {
          alignSelf: 'center',
          display: 'contents',
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: scrollbar,
        ol: { flexFlow: 'nowrap', minHeight: '2.0625em' },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          whiteSpace: 'pre-line' as Property.WhiteSpace,
        },
      },
    },
  },
};

export const lightTheme: Theme = createTheme({
  ...common,
  palette: {
    mode: 'light',
    background: {
      default: 'rgb(234, 238, 243)',
    },
  },
});

export const darkTheme: Theme = createTheme({
  ...common,
  palette: {
    mode: 'dark',
    background: {
      default: 'rgb(32, 38, 45)',
    },
  },
});
