import 'reflect-metadata';
import { CssBaseline, ThemeProvider, createTheme } from '@suid/material';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { Toaster } from 'solid-toast';
import { MainRouter } from './router/main-router';
import { ConfirmDialogProvider } from './common/components/ConfirmDialog';
import { SseHandler } from './common/components/SseHandler';

const theme = createTheme();
const queryClient = new QueryClient();

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ConfirmDialogProvider>
          <CssBaseline />
          <Toaster position="bottom-right" />
          <MainRouter />
          <SseHandler />
        </ConfirmDialogProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
