import React from 'react';
import { useState } from 'react';
import ContributionsByRepo from './contributions-by-repo';
import ContributionsByEvent from './contributions-by-event';
import ContributionsSimple from './contributions-simple';

export type PullRequest = {
  title: string;
  url: string;
  html_url: string;
  number: number;
  state: string;
  updated_at: string;
  additions: number;
  deletions: number;
};
export type PullRequestEventPayload = {
  action: string;
  number: number;
  pull_request: PullRequest;
};

export type IssuesEventPayload = {
  action: string;
  number: number;
  issue: {
    title: string;
    url: string;
    html_url: string;
    number: number;
    state: 'open' | 'closed';
    updated_at: string;
  };
};

export type Commit = {
  author: {
    name: string;
    email: string;
  };
  message: string;
  sha: string;
  url: string;
};

export type PushEventPayload = {
  before: string;
  head: string;
  ref: string;
  commits: Commit[];
};

export type DeleteEventPayload = {
  ref: string;
  ref_type: string;
};

export type CreateEventPayload = {
  ref: string;
  ref_type: string;
};

export type WatchEventPayload = {
  action: string;
};

export type IssueCommentEventPayload = {
  action: string;
  comment: {
    url: string;
    html_url: string;
  };
  issue: {
    title: string;
    number: number;
    url: string;
    html_url: string;
    state: 'open' | 'closed';
  };
};

export type ForkEventPayload = {
  forkee: {
    url: string;
    html_url: string;
    name: string;
    full_name: string;
  };
};

export type Comment = {
  body: string;
  created_at: string;
  html_url: string;
  pull_request_url: string;
  updated_at: string;
  _links: {
    html: {
      href: string;
    };
    self: {
      href: string;
    };
  };
};

export type PullRequestReviewCommentEventPayload = {
  action: 'created';
  comment: Comment;
  pull_request: PullRequest;
};

export type PullRequestReviewEventPayload = {
  action: 'created';
  pull_request: PullRequest;
  review: {
    body: string;
    commit_id: string;
    html_url: string;
    pull_request_url: string;
    state: 'commented';
    submitted_at: string;
  };
};

export type GitHubRepo = {
  url: string;
  name: string;
};

export type GitHubEventType =
  | 'PullRequestEvent'
  | 'IssuesEvent'
  | 'PushEvent'
  | 'CreateEvent'
  | 'DeleteEvent'
  | 'WatchEvent'
  | 'IssueCommentEvent'
  | 'ForkEvent'
  | 'PullRequestReviewCommentEvent'
  | 'PullRequestReviewEvent';

export type GitHubEvent = {
  id: number;
  repo: GitHubRepo;
  created_at: string;
  type: GitHubEventType;
  // FIXME: うまく解決できなかったので余裕ある時に取り組む
  payload: any;
};

export const toHtmlUrl = (url: string) => {
  return url.replace('api.github.com/repos', 'github.com');
};

type Props = {
  result: any;
  user: string;
};

const Contributions = (props: Props) => {
  const [selectedView, setSelectedView] = useState<string>('simple');
  const views = [
    { id: 'simple', name: 'Simple List' },
    { id: 'repo', name: 'Group By Repo' },
    // { id: 'event', name: 'Group By Event' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold col-start-1 col-end-4">Recent {props.user} Events</h2>
      <nav className="flex flex-col sm:flex-row">
        {views.map((view) => {
          return (
            <div key={view.id}>
              {selectedView == view.id ? (
                <button className="py-4 px-6 block hover:text-blue-500 focus:outline-none text-blue-500 border-b-2 font-medium border-blue-500">
                  {view.name}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedView(view.id)}
                  className="text-gray-600 py-4 px-6 block hover:text-blue-500 focus:outline-none"
                >
                  {view.name}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {selectedView == 'simple' && <ContributionsSimple result={props.result}></ContributionsSimple>}
      {selectedView == 'repo' && <ContributionsByRepo result={props.result} user={props.user}></ContributionsByRepo>}
      {/* {selectedView == 'event' && <ContributionsByEvent result={props.result}></ContributionsByEvent>} */}
    </div>
  );
};

export default Contributions;