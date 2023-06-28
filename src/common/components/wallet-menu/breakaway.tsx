import React, { Component } from "react";

import { Link } from "react-router-dom";

import { Global } from "../../store/global/types";

import _c from "../../util/fix-class-names";

import defaults from "../../constants/defaults.json";
import { hiveSvg, spkSvg } from "../../img/svg";
import { hiveEngineSvg } from "../../img/svg";
import "./_index.scss";
import { ActiveUser } from "../../store/active-user/types";
import { getCommunity } from "../../api/bridge";
import { Community } from "../../store/communities/types";

interface Props {
  global: Global;
  username: string;
  active: string;
  activeUser: ActiveUser | null;
}

interface State {
  communityData: Community | null;
}

export default class WalletMenu extends Component<Props> {
  state: State = {
    communityData: null
  };

  componentDidMount(): void {
    const {
      activeUser,
      global: { hive_id }
    } = this.props;
    getCommunity(hive_id, activeUser?.username).then((data) =>
      this.setState({ ...this.state, communityData: data })
    );
  }

  render() {
    const {
      global: { isElectron, usePrivate, hive_id },
      username,
      active
    } = this.props;
    const logo = isElectron
      ? "./img/logo-small-transparent.png"
      : `${defaults.imageServer}/u/${hive_id}/avatar/lardge`;

    return (
      <div className="wallet-menu">
        {usePrivate && (
          <Link
            className={_c(`menu-item ecency ${active === "ecency" ? "active" : ""}`)}
            to={`/@${username}/points`}
          >
            <span className="title">Community</span>
            <span className="sub-title">Points</span>
            <span className="platform-logo">
              <img alt="ecency" src={logo} />
            </span>
          </Link>
        )}
        <Link
          className={_c(`menu-item hive ${active === "hive" ? "active" : ""}`)}
          to={`/@${username}/wallet`}
        >
          <span className="title">Hive</span>
          <span className="sub-title">Wallet</span>
          <span className="platform-logo">{hiveSvg}</span>
        </Link>
        <Link
          className={_c(`menu-item hive-engine ${active === "engine" ? "active" : ""}`)}
          to={`/@${username}/engine`}
        >
          <span className="title">Engine</span>
          <span className="sub-title">Tokens</span>
          <span className="platform-logo">{hiveEngineSvg}</span>
        </Link>
        <Link
          className={_c(`menu-item spk ${active === "spk" ? "active" : ""}`)}
          to={`/@${username}/spk`}
        >
          <span className="title">SPK</span>
          <span className="sub-title">Tokens</span>
          <span className="platform-logo">{spkSvg}</span>
        </Link>
      </div>
    );
  }
}
