import { RouteSectionProps } from '@solidjs/router';
import { Box } from '@suid/material';
import { Sidebar } from './sidebar';
import { SIDEBAR_WIDTH_IN_PX } from './constants';

export const Layout = (props: RouteSectionProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          ml: `${SIDEBAR_WIDTH_IN_PX + 48}px`,
          mr: '48px',
          pt: '3.5rem',
          overflowX: 'hidden',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
