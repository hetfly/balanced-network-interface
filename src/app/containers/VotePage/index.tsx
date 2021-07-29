import React from 'react';

import { Helmet } from 'react-helmet-async';
import { QueryObserverResult } from 'react-query';
import { Link } from 'react-router-dom';
import { Box } from 'rebass/styled-components';
import styled from 'styled-components';

import { Button } from 'app/components/Button';
import { DefaultLayout } from 'app/components/Layout';
import ProposalInfo from 'app/components/ProposalInfo';
import { Typography } from 'app/theme';
import { useTotalProposalQuery } from 'queries/vote';
import { VoteInterface } from 'types';

const VoteContainer = styled(Box)`
  flex: 1;
  border-radius: 10px;
  padding: 35px 35px;
  background-color: ${({ theme }) => theme.colors.bg2};
  margin-bottom: 50px;
`;

const VoteHeader = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
  margin-bottom: 30px;
`;

const metadata = {
  voted: 16,
  voters: 748,
  approvePercentage: 53,
  rejectPercentage: 14,
  timestamp: 284400000,
};

/*

Sample data for reference

const mockData = [
  {
    id: 3,
    title: 'Distribute more BALN to the DAO fund by reducing the BALN for loans and liquidity pools',
    content:
      'Too much income is being given back to people who use Balanced. While incentivization is good, we need to prevent Balanced from becoming a platform that people use purely to earn rewards.\nTo make sure Balanced has enough income in its treasury to cover ongoing costs, like security audits, a higher bug bounty, marketing initiatives, projects that utilize Balanced’s functionality, and so on, we should redirect some of the BALN allocated to borrowers and liquidity providers to the DAO fund instead.',
    metadata: metadata,
    status: 'pending',
  },
  {
    id: 2,
    title: 'Proposal 2',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas id hendrerit metus. Duis eget pellentesque ex. Pellentesque massa justo, aliquet eu dui at, pulvinar vestibulum tellus. Phasellus vel mi lobortis, iaculis libero tristique, volutpat tortor. Phasellus venenatis tellus eget tempor.\nElementum. Duis quis dapibus sapien, semper euismod dolor. Fusce at porttitor risus. Etiam vehicula massa aliquam elit sagittis pulvinar. Vivamus luctus lectus arcu, ac commodo turpis varius tempor.',
    metadata: metadata,
    status: 'approved',
  },
  {
    id: 1,
    title: 'Proposal 1',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas id hendrerit metus. Duis eget pellentesque ex. Pellentesque massa justo, aliquet eu dui at, pulvinar vestibulum tellus. Phasellus vel mi lobortis, iaculis libero tristique, volutpat tortor. Phasellus venenatis tellus eget tempor.\nElementum. Duis quis dapibus sapien, semper euismod dolor. Fusce at porttitor risus. Etiam vehicula massa aliquam elit sagittis pulvinar. Vivamus luctus lectus arcu, ac commodo turpis varius tempor.',
    metadata: metadata,
    status: 'approved',
  },
];

*/

export function VotePage() {
  const totalProposal: QueryObserverResult<Array<VoteInterface>> = useTotalProposalQuery();
  const { data } = totalProposal;

  return (
    <DefaultLayout title="Vote">
      <Helmet>
        <title>Vote</title>
      </Helmet>
      <VoteContainer>
        <VoteHeader>
          <Typography variant="h2">Proposals</Typography>
          <Link to="/vote/new-proposal">
            <Box style={{ textAlign: 'right' }}>
              <Button>New Proposal</Button>
            </Box>
          </Link>
        </VoteHeader>
        {data
          ?.sort((a, b) => b?.id - a?.id)
          .map(ele => (
            <Link key={`link-${ele?.id}`} to={`/vote/proposal/${ele?.id}`} style={{ textDecoration: 'none' }}>
              <ProposalInfo
                title={ele?.name}
                content={ele?.name}
                metadata={{
                  ...metadata, // Temporary mock data
                  approvePercentage: ele?.for,
                  rejectPercentage: ele?.against,
                }}
              />
            </Link>
          ))}
      </VoteContainer>
    </DefaultLayout>
  );
}
