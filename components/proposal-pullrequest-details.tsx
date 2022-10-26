import { useTranslation } from "next-i18next";

import { pullRequest } from "interfaces/issue-data";
import { DistribuitonPerUser } from "interfaces/proposal";

import Avatar from "./avatar";
import DateLabel from "./date-label";
import GithubInfo from "./github-info";
import ProposalProgress from "./proposal-progress";
import PullRequestLabels from "./pull-request-labels";
import Translation from "./translation";
import {useContext} from "react";
import {AppStateContext} from "../contexts/app-state";

interface IProposalPRDetailsProps {
  currentPullRequest: pullRequest;
  usersDistribution: DistribuitonPerUser[];
}
export default function ProposalPullRequestDetail({
  currentPullRequest,
  usersDistribution
}: IProposalPRDetailsProps) {
  const { t } = useTranslation("pull-request");
  const { state } = useContext(AppStateContext);

  return (
    <div className="bg-shadow rounded-5 p-3 d-flex flex-column">
      <div className="pt-1 mb-2 d-inline-flex align-items-center justify-content-md-start gap-2">
        <span className="caption-large text-uppercase text-white">
          {t("pull-request:label")}
        </span>
        <span className="caption-large text-uppercase text-white-40">
          #{currentPullRequest?.githubId}
        </span>
        <PullRequestLabels
          merged={currentPullRequest?.merged}
          isMergeable={currentPullRequest?.isMergeable}
        />
      </div>
      <div className="pt-1 mb-3 d-inline-flex align-items-center justify-content-md-start gap-3">
        <div className="d-flex align-items-center">
          <Avatar
            className="me-2"
            userLogin={currentPullRequest?.githubLogin}
          />{" "}
          <GithubInfo
            parent="hero"
            variant="user"
            label={["@", currentPullRequest?.githubLogin].join("")}
          />
        </div>

        <span className="caption-small">
          {(state.currentBounty?.data?.repository && (
            <GithubInfo
              parent="list"
              variant="repository"
              label={state.currentBounty?.data?.repository?.githubPath}
            />
          )) ||
            ""}
        </span>

        <span className="caption-small text-light-gray text-uppercase">
          <Translation label={"branch"} />
          <span className="text-primary">:{currentPullRequest?.branch}</span>
        </span>

        {currentPullRequest?.createdAt && (
          <DateLabel
            date={currentPullRequest?.createdAt}
            className="text-white"
          />
        )}
      </div>
      <ProposalProgress usersDistribution={usersDistribution} />
    </div>
  );
}
