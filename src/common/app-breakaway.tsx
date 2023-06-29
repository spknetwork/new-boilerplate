import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import EntryIndexContainer from "./pages/";
import { SearchPageContainer, SearchMorePageContainer } from "./pages/search";
import { ProposalsIndexContainer, ProposalDetailContainer } from "./pages/proposals";
import NotFound from "./components/404";
import Tracker from "./tracker";
import {
  AboutPage,
  GuestPostPage,
  ContributePage,
  PrivacyPage,
  WhitePaperPage,
  TosPage,
  FaqPage,
  ContributorsPage
} from "./pages/static";
import routes from "./routes";
import * as ls from "./util/local-storage";
import i18n from "i18next";
import { pageMapDispatchToProps, pageMapStateToProps } from "./pages/common";
import { connect } from "react-redux";
import loadable from "@loadable/component";
import Announcement from "./components/announcement";
import FloatingFAQ from "./components/floating-faq";
import { useMappedStore } from "./store/use-mapped-store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, EntriesCacheManager } from "./core";

// Define lazy pages
const ProfileContainer = loadable(() => import("./pages/profile-breakaway"), {
  fallback: <div>Wait</div>
});
const ProfilePage = (props: any) => <ProfileContainer {...props} />;

const CommunityContainer = loadable(() => import("./pages/community-breakaway"), {
  fallback: <div>Wait</div>
});
const CommunityPage = (props: any) => <CommunityContainer {...props} />;

const DiscoverContainer = loadable(() => import("./pages/discover"), {
  fallback: <div>Wait</div>
});
const DiscoverPage = (props: any) => <DiscoverContainer {...props} />;

const WitnessesContainer = loadable(() => import("./pages/witnesses"), {
  fallback: <div>Wait</div>
});
const WitnessesPage = (props: any) => <WitnessesContainer {...props} />;

const AuthContainer = loadable(() => import("./pages/auth"), {
  fallback: <div>Wait</div>
});
const AuthPage = (props: any) => <AuthContainer {...props} />;

const SubmitContainer = loadable(() => import("./pages/submit-breakaway"), {
  fallback: <div>Wait</div>
});
const SubmitPage = (props: any) => <SubmitContainer {...props} />;

const MarketContainer = loadable(() => import("./pages/market"), {
  fallback: <div>Wait</div>
});
const MarketPage = (props: any) => <MarketContainer {...props} />;

const SignUpContainer = loadable(() => import("./pages/sign-up"), {
  fallback: <div>Wait</div>
});
const SignUpPage = (props: any) => <SignUpContainer {...props} />;

const PurchaseContainer = loadable(() => import("./pages/purchase"), {
  fallback: <div>Wait</div>
});
const PurchasePage = (props: any) => <PurchaseContainer {...props} />;

const DecksPage = loadable(() => import("./pages/decks"), {
  fallback: <div>Wait</div>
});

const App = (props: any) => {
  const { global } = useMappedStore();

  useEffect(() => {
    let pathname = window.location.pathname;
    if (pathname !== "/faq") {
      const currentLang = ls.get("current-language");
      if (currentLang) {
        props.setLang(currentLang);
        i18n.changeLanguage(currentLang);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EntriesCacheManager>
        {/*Excluded from production*/}
        {/*<ReactQueryDevtools initialIsOpen={false} />*/}
        <Tracker />
        <Switch>
          <Route exact={true} path={routes.HOME} component={EntryIndexContainer} />
          <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer} />
          <Route
            exact={true}
            strict={true}
            path={routes.USER_FEED}
            component={EntryIndexContainer}
          />
          <Route exact={true} strict={true} path={routes.PURCHASE} component={PurchasePage} />
          <Route exact={true} strict={true} path={routes.USER} component={ProfilePage} />
          <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfilePage} />
          <Route exact={true} strict={true} path={routes.COMMUNITY} component={CommunityPage} />
          <Route
            exact={true}
            strict={true}
            path={routes.FILTER_TAG}
            component={EntryIndexContainer}
          />
          <Route exact={true} strict={true} path={routes.DISCOVER} component={DiscoverPage} />
          <Route exact={true} path={routes.SEARCH} component={SearchPageContainer} />
          <Route exact={true} path={routes.SEARCH_MORE} component={SearchMorePageContainer} />
          <Route exact={true} strict={true} path={routes.AUTH} component={AuthPage} />
          <Route exact={true} strict={true} path={routes.SUBMIT} component={SubmitPage} />
          <Route exact={true} strict={true} path={routes.MARKET} component={MarketPage} />
          <Route exact={true} strict={true} path={routes.EDIT} component={SubmitPage} />
          <Route exact={true} strict={true} path={routes.SIGN_UP} component={SignUpPage} />
          <Route exact={true} strict={true} path={routes.EDIT_DRAFT} component={SubmitPage} />
          <Route exact={true} strict={true} path={routes.WITNESSES} component={WitnessesPage} />
          <Route
            exact={true}
            strict={true}
            path={routes.PROPOSALS}
            component={ProposalsIndexContainer}
          />
          <Route
            exact={true}
            strict={true}
            path={routes.PROPOSAL_DETAIL}
            component={ProposalDetailContainer}
          />
          <Route exact={true} strict={true} path={routes.ABOUT} component={AboutPage} />
          <Route exact={true} strict={true} path={routes.GUESTS} component={GuestPostPage} />
          <Route exact={true} strict={true} path={routes.CONTRIBUTE} component={ContributePage} />
          <Route exact={true} strict={true} path={routes.PRIVACY} component={PrivacyPage} />
          <Route exact={true} strict={true} path={routes.WHITE_PAPER} component={WhitePaperPage} />
          <Route exact={true} strict={true} path={routes.TOS} component={TosPage} />
          <Route exact={true} strict={true} path={routes.FAQ} component={FaqPage} />
          <Route
            exact={true}
            strict={true}
            path={routes.CONTRIBUTORS}
            component={ContributorsPage}
          />
          <Route
            exact={true}
            strict={true}
            path={routes.DECKS}
            component={global.usePrivate ? DecksPage : NotFound}
          />
          <Route component={NotFound} />
        </Switch>

        <Announcement activeUser={props.activeUser} />
        <FloatingFAQ />
        <div id="popper-container" />
      </EntriesCacheManager>
    </QueryClientProvider>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(App);