import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import ListIssues from '@components/list-issues';
import GithubMicroService from '@services/github-microservice';
import Oracle from '@components/oracle';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';

export default function ReadyToMergeIssues() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssuesState('ready')
                      .then(setIssues)
                      .catch((error) => {
                        console.log('Error', error)
                      })
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      });
  }

  useEffect(getIssues, []);

  return (
    <Oracle buttonPrimaryActive={false}>
      <ListIssues listIssues={issues} />
    </Oracle>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
