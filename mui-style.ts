import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        tableHeader: Palette['primary'];
    }

    interface PaletteOptions {
        tableHeader?: PaletteOptions['primary'];
    }
}

const muiTheme = createTheme({
    palette: {
        tableHeader: {
            main: '#1976d2',
            contrastText: '#ffffff',
        },
    },
    components: {
        MuiTableHead: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.tableHeader.main,
                    '& .MuiTableCell-root': {
                        color: theme.palette.tableHeader.contrastText,
                        fontWeight: 600,
                    },
                }),
            },
        },
    },
});

export default muiTheme;
