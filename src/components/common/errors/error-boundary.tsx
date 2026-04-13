import type { ErrorInfo, ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';
import { Component } from 'react';

import { LoggerService } from '../../../services/logger/logger.service';

interface ErrorBoundaryProps {
  children: ReactNode;
  name?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorData = {
      error,
      componentStack: errorInfo.componentStack,
    };
    LoggerService.error(`Error caught${this.props.name ? ` in ${this.props.name}` : ''}`, errorData);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, height: '100%', overflow: 'auto', bgcolor: '#fff3cd' }}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#856404' }}>
              {this.props.name ? `Error in ${this.props.name}` : 'Error'}
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                bgcolor: '#fff',
                border: '1px solid #ffc107',
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: '100%',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#d32f2f',
              }}
            >
              {this.state.error?.message}
              {this.state.error?.stack}
            </Box>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundaryComponent as ErrorBoundary };
