import {createTheme} from "@mui/material";

export const darkTheme = () => {
    const theme = {
        components: {
            MuiContainer: {
                styleOverrides: {
                    root: {
                        '&::-webkit-scrollbar': {
                            width: '0.25rem'
                        },
                        '&::-webkit-scrollbar-track': {
                            '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgb(150 150 150 / 50%)',
                            '-webkit-box-shadow': 'inset 0 0 6px rgba(0, 0, 0, 0.1)',
                            'border-radius': '0.5rem'
                        }
                    }
                }
            }
        }
    }
    if (window.matchMedia('(prefers-color-scheme: dark').matches) {
        return createTheme({
            ...theme,
            palette: {
                mode: 'dark',
                background: {
                    default: "rgb(32, 38, 45)"
                }
            }
        });
    }
    return createTheme({
        ...theme,
        palette: {
            background: {
                default: "rgb(234, 238, 243)"
            }
        }
    });
}