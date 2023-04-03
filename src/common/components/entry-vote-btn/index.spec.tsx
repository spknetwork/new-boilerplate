import React from "react";

import EntryVoteBtn, { VoteDialog } from "./index";

import renderer from "react-test-renderer";

import { withStore } from "../../tests/with-store";

import { createBrowserHistory } from "history";

import {
  globalInstance,
  dynamicPropsIntance1,
  entryInstance1,
  UiInstance,
  activeUserMaker,
  fullAccountInstance
} from "../../helper/test-helper";

import { Account } from "../../store/accounts/types";

jest.mock("../../api/hive", () => ({
  votingPower: () => 5,
  getActiveVotes: () =>
    new Promise((resolve) => {
      resolve([{ voter: "user1", percent: 10 }]);
    })
}));

const account: Account = {
  name: "user1"
};

const accountFull: Account = {
  ...fullAccountInstance,
  name: "user1",
  reputation: "33082349040",
  created: "2016-07-07T08:15:00",
  vesting_shares: "0.000000 VESTS",
  delegated_vesting_shares: "0.000000 VESTS",
  received_vesting_shares: "77883823.534631 VESTS",
  vesting_withdraw_rate: "0.000000 VESTS",
  voting_manabar: { current_mana: "73562964033158", last_update_time: 1591275594 },
  profile: {
    name: "Foo Bar",
    about: "Lorem ipsum dolor sit amet",
    website: "https://esteem.app",
    location: "Hive"
  }
};

describe("(1) Dialog", () => {
  const data: Account = {
    ...fullAccountInstance,
    name: "user1",
    vesting_shares: "0.000000 VESTS",
    delegated_vesting_shares: "0.000000 VESTS",
    received_vesting_shares: "77883823.534631 VESTS"
  };

  const props = {
    activeUser: { ...activeUserMaker("user1"), ...{ data } },
    dynamicProps: dynamicPropsIntance1,
    global: globalInstance,
    entry: entryInstance1,
    downVoted: false,
    upVoted: false,
    account: accountFull,
    accounts: [account],
    isPostSlider: false,
    match: {
      path: "...",
      url: "/trending/hive-125125",
      isExact: true,
      params: { username: "hive-125125" }
    },
    history: createBrowserHistory(),
    previousVotedValue: null,
    onClick: () => {},
    setTipDialogMounted: () => {},
    addAccount: () => {},
    toggleUIProp: () => {},
    afterVote: () => {}
  };

  const component = renderer.create(<VoteDialog {...props} />);
  const instance: any = component.getInstance();

  it("(1) Up vote", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Down vote", () => {
    instance.changeMode("down");
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("(2) Btn - No active user", () => {
  const props = {
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    entry: entryInstance1,
    users: [],
    account: accountFull,
    accounts: [account],
    activeUser: null,
    isPostSlider: false,
    history: createBrowserHistory(),
    match: {
      path: "...",
      url: "/trending/hive-125125",
      isExact: true,
      params: { username: "hive-125125" }
    },
    previousVotedValue: null,
    ui: UiInstance,
    setActiveUser: () => {},
    updateActiveUser: () => {},
    deleteUser: () => {},
    afterVote: () => {},
    toggleUIProp: () => {}
  };

  it("(1) Render", () => {
    const renderer = withStore(<EntryVoteBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});

describe("(3) Btn - Up voted", () => {
  const props = {
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    entry: entryInstance1,
    history: createBrowserHistory(),
    match: {
      path: "...",
      url: "/trending/hive-125125",
      isExact: true,
      params: { username: "hive-125125" }
    },
    users: [
      { username: "user1", accessToken: "s", refreshToken: "b", expiresIn: 1, postingKey: null }
    ],
    activeUser: activeUserMaker("user1"),
    isPostSlider: false,
    previousVotedValue: null,
    ui: UiInstance,
    setActiveUser: () => {},
    updateActiveUser: () => {},
    deleteUser: () => {},
    afterVote: () => {},
    toggleUIProp: () => {}
  };

  it("(1) Render", () => {
    const renderer = withStore(<EntryVoteBtn {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
