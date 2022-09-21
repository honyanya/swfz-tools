import React from 'react';
import {
  PullRequestReviewCommentEventPayload,
  IssueCommentEventPayload,
  PullRequestReviewEventPayload,
  CommitCommentEventPayload,
  Commit,
  CreateEventPayload,
  GitHubEvent,
  GitHubRepo,
  IssuesEventPayload,
  PullRequestEventPayload,
  PushEventPayload,
  WatchEventPayload,
  toHtmlUrl,
} from './contributions';
import {
  InfoIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  CommitIcon,
  StarFillIcon,
  CommentIcon,
} from '@primer/octicons-react';

import Commits from './by-repo/commits';
import PullRequests from './by-repo/pullrequests';
import Issues from './by-repo/issues';
import Repositories from './by-repo/repositories';

type Props = {
  result: any;
  user: string;
};

type CommitData = Commit & { date: string };

export type Summary = {
  commits: {
    [key: string]: {
      repo: GitHubRepo;
      data: CommitData[];
    };
  };
  pullRequests: {
    [key: string]: {
      repo: GitHubRepo;
      data: PullRequestEventPayload[];
      stats: {
        merged: number;
        open: number;
        count: number;
      };
    };
  };
  issues: {
    [key: string]: {
      repo: GitHubRepo;
      data: IssuesEventPayload[];
      stats: {
        open: number;
        closed: number;
      };
    };
  };
  repositories: CreateEventPayload[];
  stared: WatchEventPayload[];
  comments: {
    [key: string]: {
      repo: GitHubRepo;
      data: (
        | PullRequestReviewCommentEventPayload
        | IssueCommentEventPayload
        | PullRequestReviewEventPayload
        | CommitCommentEventPayload
      )[];
    };
  };
};

const StaredRepositories = ({ repositories }: { repositories: GitHubEvent[] }) => {
  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">Stared {Object.keys(repositories).length} repositories</span>
        </span>
      </div>
      <ul>
        {repositories.map((repoEvent) => {
          return (
            <li key={repoEvent.repo.name}>
              <span className="text-yellow-500">
                <StarFillIcon size={20} />
              </span>
              <a
                target="_blank"
                rel="noreferrer"
                href={toHtmlUrl(repoEvent.repo.url)}
                className="text-blue-600 hover:underline"
              >
                {repoEvent.repo.name}
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
};

const withIssue = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is IssueCommentEventPayload => {
  return 'issue' in value;
};
const withPr = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is PullRequestReviewCommentEventPayload | PullRequestReviewEventPayload => {
  return 'pull_request' in value;
};

const withPrReview = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is PullRequestReviewEventPayload => {
  return 'review' in value;
};

const withCommit = (
  value:
    | PullRequestReviewCommentEventPayload
    | IssueCommentEventPayload
    | PullRequestReviewEventPayload
    | CommitCommentEventPayload,
): value is CommitCommentEventPayload => {
  return !('issue' in value) && !('pull_request' in value);
};

const Comments = ({ comments }: { comments: Summary['comments'] }) => {
  const count = Object.values(comments).reduce((acc, c) => acc + c.data.length, 0);
  return (
    <>
      <div>
        <span className="flex">
          <InfoIcon size={24} />
          <span className="text-lg font-bold">
            {count} Comments in {Object.keys(comments).length} repositories
          </span>
        </span>
      </div>
      {Object.keys(comments).map((repoName) => {
        return (
          <div key={repoName}>
            <details>
              <summary className="grid grid-cols-12">
                <span className="col-start-1 col-end-11">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                    href={toHtmlUrl(comments[repoName].repo?.url)}
                  >
                    {repoName}
                  </a>{' '}
                  {comments[repoName].data.length} Comments
                </span>
              </summary>
              <ul className="list-none">
                {comments[repoName].data.map((c) => {
                  const htmlUrl = withPrReview(c) ? c.review.html_url : c.comment.html_url;
                  const numberOrId = withCommit(c)
                    ? c.comment.commit_id
                    : withIssue(c)
                    ? c.issue.number
                    : withPr(c)
                    ? c.pull_request.number
                    : '';
                  const title = withIssue(c) ? c.issue.title : withPr(c) ? c.pull_request.title : '';

                  return (
                    <li key={htmlUrl} className="grid grid-cols-12 gap-4">
                      <span className="col-start-1 col-end-10 ml-3 flex">
                        <CommentIcon size={20} />
                        <a target="_blank" rel="noreferrer" href={htmlUrl} className="text-blue-600 hover:underline">
                          {withIssue(c) && c.issue && c.issue.state === 'open' ? (
                            <span className="text-green-800">
                              <IssueOpenedIcon size={20} />
                            </span>
                          ) : withIssue(c) && c.issue && c.issue.state === 'closed' ? (
                            <span className="text-red-800">
                              <IssueClosedIcon size={20} />
                            </span>
                          ) : withPr(c) && c.pull_request && c.pull_request.state === 'closed' ? (
                            <span className="text-purple-800">
                              <GitMergeIcon size={20} />
                            </span>
                          ) : withPr(c) && c.pull_request && c.pull_request.state !== 'closed' ? (
                            <span className="text-green-800">
                              <GitPullRequestIcon size={20} />
                            </span>
                          ) : (
                            <span className="text-gray-800">
                              <CommitIcon size={20} />
                            </span>
                          )}
                          {numberOrId}
                        </a>{' '}
                        {title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      })}
    </>
  );
};

const uniqueAndSortCommits = (commits: Summary['commits']): Summary['commits'] => {
  const uniqByShaAndLatest = (cs: CommitData[]): CommitData[] => {
    const commitMap = cs
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .reduce((acc, commit) => {
        acc.set(commit.sha, commit);

        return acc;
      }, new Map<string, CommitData>());

    return Array.from(commitMap.values());
  };

  return Object.entries(commits).reduce((acc, [repoName, commitsByRepo]) => {
    const uniqueCommits = uniqByShaAndLatest(commitsByRepo.data);

    return { ...acc, [repoName]: { ...commitsByRepo, data: uniqueCommits.reverse() } };
  }, {} as Summary['commits']);
};

const ignoreDuplicatePullRequest = (pullRequests: Summary['pullRequests']): Summary['pullRequests'] => {
  const uniqByNumberAndLatest = (pullRequests: PullRequestEventPayload[]): PullRequestEventPayload[] => {
    const prMap = pullRequests
      .sort((a, b) => (a.pull_request.updated_at > b.pull_request.updated_at ? 1 : -1))
      .reduce((acc, pr) => {
        if (!(pr.pull_request.state === 'closed' && !pr.pull_request.merged)) {
          acc.set(pr.pull_request.number, pr);
        }

        return acc;
      }, new Map<number, PullRequestEventPayload>());

    return Array.from(prMap.values());
  };

  return Object.entries(pullRequests).reduce((acc, [repoName, prsByRepo]) => {
    const filteredPrs = uniqByNumberAndLatest(prsByRepo.data);
    const count = filteredPrs.length;
    const merged = filteredPrs.reduce((acc, pr) => acc + (pr.pull_request.merged ? 1 : 0), 0);
    const open = count - merged;

    return { ...acc, [repoName]: { ...prsByRepo, data: filteredPrs.reverse(), stats: { count, merged, open } } };
  }, {} as Summary['pullRequests']);
};

const aggregateIssues = (issues: Summary['issues']): Summary['issues'] => {
  const uniqByNumberAndLatest = (issues: IssuesEventPayload[]): IssuesEventPayload[] => {
    const issueMap = issues
      .sort((a, b) => (a.issue.updated_at > b.issue.updated_at ? 1 : -1))
      .reduce((acc, issue) => {
        acc.set(issue.issue.number, issue);

        return acc;
      }, new Map<number, IssuesEventPayload>());

    return Array.from(issueMap.values());
  };

  return Object.entries(issues).reduce((acc, [repoName, issuesByRepo]) => {
    const filteredIssues = uniqByNumberAndLatest(issuesByRepo.data);

    const closed = filteredIssues.filter((i) => i.issue.state === 'closed').length;
    const open = filteredIssues.filter((i) => i.issue.state === 'open').length;

    return { ...acc, [repoName]: { ...issuesByRepo, data: filteredIssues, stats: { closed, open } } };
  }, {} as Summary['issues']);
};

const ContributionsByRepo = (props: Props) => {
  const grouped = props.result.reduce(
    (acc: Summary, row: GitHubEvent) => {
      if (row.type === 'PushEvent') {
        // TODO: GitHubEventの型定義を解決すればこちらも解決する
        // BotUserのコミットはノイズになるので除外する
        const targetCommits = (row.payload as PushEventPayload).commits
          .filter((c) => !c.author.email.match('@users.noreply.github.com'))
          .map((c) => ({ ...c, date: row.created_at }));
        const commitData = [...(acc.commits[row.repo.name]?.data || []), ...targetCommits];
        const commits = { ...acc.commits, [row.repo.name]: { repo: row.repo, data: commitData } };

        return { ...acc, commits };
      }
      if (row.type === 'PullRequestEvent') {
        const prPayloads = [...(acc.pullRequests[row.repo.name]?.data || []), row.payload];
        const pullRequests = { ...acc.pullRequests, [row.repo.name]: { repo: row.repo, data: prPayloads } };

        return { ...acc, pullRequests };
      }
      if (row.type === 'IssuesEvent') {
        const issuesPayloads = [...(acc.issues[row.repo.name]?.data || []), row.payload];
        const issues = { ...acc.issues, [row.repo.name]: { repo: row.repo, data: issuesPayloads } };

        return { ...acc, issues };
      }
      if (row.type === 'CreateEvent' && row.payload.ref_type === 'repository') {
        const repositories = [...acc.repositories, row];

        return { ...acc, repositories };
      }
      if (row.type === 'WatchEvent' && row.payload.action === 'started') {
        const stared = [...acc.stared, row];

        return { ...acc, stared };
      }
      if (
        ['IssueCommentEvent', 'PullRequestReviewCommentEvent', 'PullRequestReviewEvent', 'CommitCommentEvent'].includes(
          row.type,
        )
      ) {
        const commentsPayloads = [...(acc.comments[row.repo.name]?.data || []), row.payload];
        const comments = {
          ...acc.comments,
          [row.repo.name]: { repo: row.repo, data: commentsPayloads },
        };

        return { ...acc, comments };
      }
      return acc;
    },
    {
      issues: {},
      pullRequests: {},
      commits: {},
      repositories: [],
      stared: [],
      comments: {},
    },
  );

  const summary = {
    issues: aggregateIssues(grouped.issues),
    pullRequests: ignoreDuplicatePullRequest(grouped.pullRequests),
    commits: uniqueAndSortCommits(grouped.commits),
    repositories: grouped.repositories,
    stared: grouped.stared,
    comments: grouped.comments,
  };

  return (
    <>
      <Commits commits={summary.commits}></Commits>
      <PullRequests pullRequests={summary.pullRequests}></PullRequests>
      <Issues issues={summary.issues}></Issues>
      <Repositories repositories={summary.repositories}></Repositories>
      <StaredRepositories repositories={summary.stared}></StaredRepositories>
      <Comments comments={summary.comments}></Comments>
    </>
  );
};

export default ContributionsByRepo;
