import { Box, BaseHeaderLayout, GridLayout, Typography, Button } from '@strapi/design-system';
import getTrad from '../../utils/getTrad';
import { useIntl } from "react-intl"
import { useFlowList } from '../../hooks/useFlowList';
import FlowCard from '../../components/FlowCard';

const HomePage = () => {
  const { formatMessage } = useIntl();
  const [flows, isLoading] = useFlowList();

  return (
    <>
      <Box background="neutral100">
        <BaseHeaderLayout 
          title={formatMessage({ id: getTrad(`name`)})} 
          as="h2" 
        />
      </Box>
      <GridLayout>
      <FlowCard id={'flush_cache'} />
      <FlowCard id={'deploy'} />
      { !isLoading && flows.map((f,i) => <FlowCard id={f} key={i} />)}
      </GridLayout>
    </>
  );
};

export default HomePage;
