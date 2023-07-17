import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { match } from "react-router";
import React, { Fragment, useEffect, useState } from "react";
import { search as searchApi, SearchResult } from "../api/search-api";
import { getSubscriptions } from "../api/bridge";
import { EntryFilter, ListStyle } from "../store/global/types";
import { usePrevious } from "../util/use-previous";
import { makeGroupKey } from "../store/entries";
import _ from "lodash";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import defaults from "../constants/defaults.json";
import CommunitySubscribers from "../components/community-subscribers";
import CommunityActivities from "../components/community-activities";
import LinearProgress from "../components/linear-progress";
import SearchBox from "../components/search-box";
import { _t } from "../i18n";
import SearchListItem from "../components/search-list-item";
import _c from "../util/fix-class-names";
import EntryListLoadingItem from "../components/entry-list-loading-item";
import DetectBottom from "../components/detect-bottom";
import capitalize from "../util/capitalize";
import { Account } from "../store/accounts/types";
import { CommunityMenu } from "../components/community-menu";
import { CommunityCover } from "../components/community-cover";
import { NotFound } from "../components/404";
import NavBarElectron from "../../desktop/app/components/navbar";
import NavBar from "../components/navbar/breakaway";
import { CommunityCard } from "../components/community-card";
import { CommunityRoles } from "../components/community-roles";
import { EntryListContent } from "../components/entry-list/breakaway";
import { connect } from "react-redux";
import { withPersistentScroll } from "../components/with-persistent-scroll";
import "./community.scss";
import { QueryIdentifiers, useCommunityCache } from "../core";
import { useQueryClient } from "@tanstack/react-query";
import { Entry } from "../store/entries/types";
import { useTrendingFeed } from "../util/graphql/hooks";

interface MatchParams {
  filter: string;
  name: string;
}

interface Props extends PageProps {
  match: match<MatchParams>;
}

export const CommunityPage = (props: Props) => {
  const getSearchParam = () => {
    return props.location.search.replace("?", "").replace("q", "").replace("=", "");
  };

  const queryClient = useQueryClient();
  const { data: community } = useCommunityCache(props.global.hive_id);

  const [account, setAccount] = useState<Account | undefined>(
    props.accounts.find(() => [props.global.hive_id])
  );
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState(getSearchParam());
  const [searchDataLoading, setSearchDataLoading] = useState(getSearchParam().length > 0);
  const [searchData, setSearchData] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { indexerLoading, indexerData } = useTrendingFeed(props.global.tags, props.global.hive_id);
  const prevMatch = usePrevious(props.match);
  const prevActiveUser = usePrevious(props.activeUser);

  useEffect(() => {
    setIsLoading(true);

    if (search.length) handleInputChange(search);

    const {
      match,
      fetchEntries,
      global: { tags }
    } = props;
    const { filter } = match.params;
    // fetch blog posts.
    if (EntryFilter[filter]) {
      fetchEntries(filter, tags, false);
    }

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    if (community?.name === props.global.hive_id) {
      setIsLoading(false);
      props.addAccount(community);
      setAccount({ ...account, ...community });
    }
  }, [community]);

  useEffect(() => {
    const { match, fetchEntries, global } = props;
    const { filter } = match.params;
    const { hive_id: name, tags } = global;

    if (!prevMatch) {
      return;
    }

    const { params: prevParams } = prevMatch;

    // community changed. fetch community and account data.
    if (name !== prevParams.name) queryClient.invalidateQueries([QueryIdentifiers.COMMUNITY, name]);

    //  community or filter changed
    if ((filter !== prevParams.filter || name !== prevParams.name) && EntryFilter[filter]) {
      fetchEntries(filter, tags, false);
    }

    // re-fetch subscriptions once active user changed.
    const { activeUser } = props;
    if (prevActiveUser?.username !== activeUser?.username) fetchSubscriptions();
  }, [props.match, props.activeUser]);

  const handleInputChange = async (value: string): Promise<void> => {
    setTyping(false);
    if (value.trim() !== "") {
      setSearchDataLoading(true);

      let query = `${value} category:${props.global.tag}`;

      const data = await searchApi(query, "newest", "0");
      if (data?.results) {
        setSearchData(
          data.results.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
        );
        setSearchDataLoading(false);
      }
    }
  };

  const fetchSubscriptions = async () => {
    const { activeUser, subscriptions, updateSubscriptions } = props;
    if (activeUser && subscriptions.length === 0) {
      const subs = await getSubscriptions(activeUser.username);
      if (subs) updateSubscriptions(subs);
    }
  };

  const bottomReached = () => {
    const {
      match,
      entries,
      fetchEntries,
      global: { tags }
    } = props;
    const { filter, name } = match.params;
    const groupKey = makeGroupKey(filter, name);

    const data = entries[groupKey];
    const { loading, hasMore } = data;

    if (!loading && hasMore && search.length === 0) fetchEntries(filter, tags, true);
  };

  const reload = async () => {
    queryClient.invalidateQueries([QueryIdentifiers.COMMUNITY, props.match.params.name]);

    const {
      match,
      fetchEntries,
      invalidateEntries,
      global: { tags }
    } = props;
    const { filter, name } = match.params;

    if (EntryFilter[filter]) {
      invalidateEntries(makeGroupKey(filter, name));
      fetchEntries(filter, tags, false);
    }
  };

  const delayedSearch = _.debounce(handleInputChange, 2000);

  const handleChangeSearch = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const { value } = event.target;
    setSearch(value);
    setTyping(value.length !== 0);
    delayedSearch(value);
  };

  const getMetaProps = () => {
    const {
      global: { hive_id },
      match: {
        params: { filter }
      }
    } = props;
    const ncount = props.notifications.unread > 0 ? `(${props.notifications.unread}) ` : "";
    const fC = capitalize(filter);
    const title = `${ncount}${community!!.title.trim()} community ${filter} list`;
    const description = _t("community.page-description", {
      f: `${fC} ${community!!.title.trim()}`
    });
    const url = `/${filter}/${hive_id}`;
    const rss = `${defaults.base}/${filter}/${hive_id}/rss.xml`;
    const image = `${defaults.imageServer}/u/${hive_id}/avatar/medium`;
    const canonical = `${defaults.base}/created/${hive_id}`;

    return { title, description, url, rss, image, canonical };
  };

  const navBar = props.global.isElectron ? (
    <NavBarElectron {...props} reloading={isLoading} reloadFn={reload} />
  ) : (
    <NavBar {...props} />
  );

  return community && account ? (
    <>
      <Meta {...getMetaProps()} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      {navBar}
      <div
        className={
          props.global.isElectron
            ? "app-content community-page mt-0 pt-6"
            : "app-content community-page"
        }
      >
        <div className="profile-side">
          <CommunityCard {...props} account={account} community={community} />
        </div>
        <span itemScope={true} itemType="http://schema.org/Organization">
          <meta itemProp="name" content={community.title.trim() || community.name} />
          <span itemProp="logo" itemScope={true} itemType="http://schema.org/ImageObject">
            <meta itemProp="url" content={getMetaProps().image} />
          </span>
          <meta itemProp="url" content={`${defaults.base}${getMetaProps().url}`} />
        </span>
        <div className="content-side">
          <CommunityMenu {...props} community={community} />
          <CommunityCover {...props} account={account!!} community={community} />

          {(() => {
            const {
              match: {
                params: { filter }
              },
              entries,
              global: { tags, hive_id }
            } = props;

            if (filter === "subscribers") {
              return <CommunitySubscribers {...props} community={community} />;
            }

            if (filter === "activities") {
              return <CommunityActivities {...props} community={community} />;
            }

            if (filter === "roles") {
              return <CommunityRoles {...props} community={community} />;
            }

            const groupKey = makeGroupKey(filter, tags[0]);
            const data = entries[groupKey];

            if (!indexerLoading && data !== undefined) {
              const entryList = [...indexerData, ...data?.entries].sort(() =>
                Math.random() > 0.5 ? 1 : -1
              );
              const loading = data?.loading;

              return (
                <>
                  {loading && entryList.length === 0 ? <LinearProgress /> : ""}

                  {["hot", "created", "trending"].includes(filter) &&
                    !loading &&
                    entryList.length > 0 && (
                      <div className="searchProfile">
                        <SearchBox
                          placeholder={_t("search-comment.search-placeholder")}
                          value={search}
                          onChange={handleChangeSearch}
                          autoComplete="off"
                          showcopybutton={true}
                          filter={`${community!!.name}`}
                          username={filter}
                        />
                      </div>
                    )}
                  {typing ? (
                    <LinearProgress />
                  ) : search.length > 0 && searchDataLoading ? (
                    <LinearProgress />
                  ) : searchData.length > 0 && search.length > 0 ? (
                    <div className="search-list">
                      {searchData.map((res) => (
                        <Fragment key={`${res.author}-${res.permlink}-${res.id}`}>
                          {SearchListItem({ ...props, res: res })}
                        </Fragment>
                      ))}
                    </div>
                  ) : search.length === 0 ? null : (
                    _t("g.no-matches")
                  )}
                  {search.length === 0 && !searchDataLoading && (
                    <div className={_c(`entry-list ${loading ? "loading" : ""}`)}>
                      <div
                        className={_c(
                          `entry-list-body ${
                            props.global.listStyle === ListStyle.grid ? "grid-view" : ""
                          }`
                        )}
                      >
                        {loading && entryList.length === 0 && <EntryListLoadingItem />}
                        <EntryListContent
                          {...props}
                          entries={entryList}
                          promotedEntries={props.entries["__promoted__"].entries}
                          community={community}
                          loading={loading}
                        />
                      </div>
                    </div>
                  )}
                  {search.length === 0 && loading && entryList.length > 0 ? <LinearProgress /> : ""}
                  <DetectBottom onBottom={bottomReached} />
                </>
              );
            }

            return null;
          })()}
        </div>
      </div>
    </>
  ) : isLoading ? (
    <>
      {navBar}
      <LinearProgress />
    </>
  ) : (
    <NotFound {...props} />
  );
};

export default connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(withPersistentScroll(CommunityPage));
