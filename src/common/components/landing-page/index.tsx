import React, { useEffect, useState } from "react";
import { _t } from "../../i18n";

import "./_index.scss";
import { queryClient, QueryIdentifiers, useCommunityCache } from "../../core";
import { history } from "../../store";

export default (props: any) => {
  const { global } = props;
  const { data: community } = useCommunityCache(props.global.hive_id);

  useEffect(() => {
    queryClient.invalidateQueries([QueryIdentifiers.COMMUNITY, global.hive_id]);
  }, []);

  return (
    <div
      className={global.isElectron ? "landing-wrapper pt-5" : "landing-wrapper"}
      id="landing-wrapper"
    >
      <div className="top-bg" />
      <div className="tob-bg-algae" />
      <div className="tob-bg-fishes" />
      <div className="sections first-section">
        <div className="text-container text-center">
          <h1>Welcome to {community?.title}!</h1>
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            <p className="mb-3 w-88">{_t("landing-page.what-is-ecency")}</p>
          </div>
          <button
            className="get-started mx-auto"
            onClick={() => history?.push(`/trending/${community?.name}`)}
          >
            {_t("landing-page.get-started")}
          </button>
        </div>
      </div>
    </div>
  );
};
