import { createTheme } from '@mui/material';

import type { Theme } from '@mui/material/styles/createTheme';
import type { Property } from 'csstype';

const scrollbar: Record<string, any> = {
  '&::-webkit-scrollbar': {
    width: '0.25rem',
    height: '0.25rem',
  },
  '&::-webkit-scrollbar-track': {
    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgb(150 150 150 / 50%)',
    boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '0.5rem',
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
          '@media (min-width: 600px)': {
            minHeight: 48,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
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
        ol: { flexFlow: 'nowrap', minHeight: '33px' },
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
