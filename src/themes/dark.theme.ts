import { createTheme } from '@mui/material';
import { Property } from 'csstype';

export const isDarkTheme = () => window.matchMedia('(prefers-color-scheme: dark').matches;

export const darkTheme = () => {
  const scrollbar = {
    '&::-webkit-scrollbar': {
      width: '0.25rem',
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

  const theme = {
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
      MuiInputBase: {
        styleOverrides: {
          input: scrollbar,
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
          ol: { flexFlow: 'nowrap' },
        },
      },
    },
  };
  if (isDarkTheme()) {
    return createTheme({
      ...theme,

      palette: {
        mode: 'dark',
        background: {
          default: 'rgb(32, 38, 45)',
        },
      },
    });
  }
  return createTheme({
    ...theme,
    palette: {
      background: {
        default: 'rgb(234, 238, 243)',
      },
    },
  });
};
