import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from '@suid/material';
import {
  Home as HomeIcon,
  Inbox as InboxIcon,
  Restore as RestoreIcon,
  Message as MessageIcon,
} from '@suid/icons-material';
import { JSXElement } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { SIDEBAR_WIDTH_IN_PX } from './constants';

type SidebarListItemProps = {
  title: string;
  icon: JSXElement;
  onClick: () => void;
};

const SidebarListItem = (props: SidebarListItemProps) => {
  return (
    <ListItemButton onClick={props.onClick} dense>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box sx={{ mr: '1.25rem', display: 'flex' }}>{props.icon}</Box>
        <ListItemText
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: `12.5rem`,
          }}
        >
          {props.title}
        </ListItemText>
      </Box>
    </ListItemButton>
  );
};

export const Sidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ flexShrink: '0' }}>
      <Drawer
        open
        variant="persistent"
        transitionDuration={0}
        // @ts-expect-error Drawer can actually take these sx properties
        sx={{
          '& .MuiDrawer-paper': {
            zIndex: theme.zIndex.appBar - 1,
            width: `${SIDEBAR_WIDTH_IN_PX}px`,
            borderRight: theme.palette.mode === 'dark' && 'none',
            overflowX: 'hidden',
          },
        }}
      >
        <List disablePadding>
          <SidebarListItem
            icon={<HomeIcon />}
            title="Home"
            onClick={() => navigate('/sns/topics')}
          />
          <Divider />

          <ListItem sx={{ paddingBottom: 0 }}>
            <Typography fontWeight="500">SNS</Typography>
          </ListItem>
          <SidebarListItem
            icon={<InboxIcon />}
            title="Topics"
            onClick={() => navigate('/sns/topics')}
          />
          <SidebarListItem
            icon={<RestoreIcon />}
            title="Publish History"
            onClick={() => navigate('/sns/publish-history')}
          />
          <Divider />

          <ListItem sx={{ paddingBottom: 0 }}>
            <Typography fontWeight="500">SQS</Typography>
          </ListItem>
          <SidebarListItem
            icon={<InboxIcon />}
            title="Queues"
            onClick={() => navigate('/sqs/queues')}
          />
          <SidebarListItem
            icon={<MessageIcon />}
            title="Messages"
            onClick={() => navigate('/sqs/messages')}
          />
          <SidebarListItem
            icon={<RestoreIcon />}
            title="Message History"
            onClick={() => navigate('/sqs/message-history')}
          />
          <Divider />
        </List>
      </Drawer>
    </Box>
  );
};
