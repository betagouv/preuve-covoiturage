import React from 'react';
import { Box, Flex, GridLayout, Typography, Button } from '@strapi/design-system';
import getTrad from '../../utils/getTrad';
import { useIntl } from "react-intl"
import { useFlowList } from '../../hooks/useFlowList';
import FlowCard from '../../components/FlowCard';

const HomePage = () => {
  const { formatMessage } = useIntl();
  const [flows, isLoading] = useFlowList();

  return (
		<Box
			as="aside"
			aria-labelledby="betagouv"
			background="neutral0"
			borderColor="neutral150"
			hasRadius
			paddingBottom={4}
			paddingLeft={4}
			paddingRight={4}
			paddingTop={6}
			shadow="tableShadow"
		>
      <Flex direction='column' wrap='nowrap'>
			  <Typography variant="sigma" textColor="neutral600" id="betagouv">
          {formatMessage({ id: getTrad('name') })}
			  </Typography>
        <GridLayout style={{width: '100%'}}>
          { !isLoading && flows.map(f => <FlowCard id={f} key={f}></FlowCard>)}
        </GridLayout>
      </Flex>
		</Box>
  );
};

export default HomePage;
