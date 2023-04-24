import { UserAvatar } from "../../user-avatar";
import { FullAccount } from "../../../store/accounts/types";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Button, Dropdown } from "react-bootstrap";
import { brightnessSvg } from "../../../img/svg";
import { Theme } from "../../../store/global/types";
import { _t } from "../../../i18n";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  items: {
    label: string;
    onClick: () => void;
  }[];
}

export const DeckToolbarUser = ({ isExpanded, items, setIsExpanded }: Props) => {
  const { activeUser, global, toggleTheme, toggleUIProp } = useMappedStore();

  return (
    <div
      className={
        "user d-flex align-items-center " +
        (isExpanded ? "justify-content-start" : "justify-content-center")
      }
    >
      {activeUser ? (
        <Dropdown onClick={() => setIsExpanded(true)}>
          <Dropdown.Toggle variant="link">
            <UserAvatar size="medium" global={global} username={activeUser?.username} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {items.map(({ label, onClick }) => (
              <Dropdown.Item onClick={() => onClick()} key={label}>
                {label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <UserAvatar
          size="medium"
          global={global}
          username=""
          onClick={() => toggleUIProp("login")}
        />
      )}
      {isExpanded ? (
        activeUser ? (
          <>
            <div className="content">
              <div className="name">{(activeUser.data as FullAccount).name}</div>
              <div className="username">@{activeUser.username}</div>
            </div>
            <div
              className={"switch-theme " + (global.theme === Theme.night ? "switched" : "")}
              onClick={() => toggleTheme()}
            >
              {brightnessSvg}
            </div>
          </>
        ) : (
          <Button className="w-100" variant="outline-primary" onClick={() => toggleUIProp("login")}>
            {_t("g.login")}
          </Button>
        )
      ) : (
        <></>
      )}
    </div>
  );
};