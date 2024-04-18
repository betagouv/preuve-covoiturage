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
        { !isLoading && flows.map((f) => <FlowCard id={f} key={f} />)}
      </GridLayout>
    </>
  );
};

export default HomePage;
