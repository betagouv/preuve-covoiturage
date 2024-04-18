import { Box, Typography, Button } from '@strapi/design-system';
import getTrad from '../utils/getTrad';
import { useIntl } from "react-intl"

import { useFlowRun } from '../hooks/useFlowRun';

const FlowCard = (props: {id: string}) => {
  const { formatMessage } = useIntl();
  const [run, isLoading, isError] = useFlowRun(props.id);

  return (
    <Box padding={4} hasRadius background="neutral0" shadow="tableShadow">
      <Typography>{formatMessage({ id: getTrad(`flow-${props.id}`)})}</Typography>
      <Button onClick={run} disabled={isLoading}>{formatMessage({ id: getTrad('action')})}</Button>
    </Box>
  );
};

export default FlowCard;
