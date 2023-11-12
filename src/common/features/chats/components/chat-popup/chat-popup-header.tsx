import Tooltip from "../../../../components/tooltip";
import { _t } from "../../../../i18n";
import { Button } from "@ui/button";
import { addMessageSvg, arrowBackSvg, expandArrow, extendedView } from "../../../../img/svg";
import ChatsCommunityDropdownMenu from "../chats-community-actions";
import { history } from "../../../../store";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import { classNameObject } from "../../../../helper/class-name-object";
import React, { useContext } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { ChatContext } from "../../chat-context-provider";
import { useKeysQuery } from "../../queries/keys-query";

interface Props {
  currentUser: string;
  communityName: string;
  showSearchUser: boolean;
  expanded: boolean;
  canSendMessage: boolean;
  isCommunity: boolean;
  isCurrentUser: boolean;
  handleBackArrowSvg: () => void;
  handleMessageSvgClick: () => void;
  handleExtendedView: () => void;
  setExpanded: (v: boolean) => void;
}

export function ChatPopupHeader({
  currentUser,
  communityName,
  showSearchUser,
  expanded,
  canSendMessage,
  isCommunity,
  isCurrentUser,
  handleBackArrowSvg,
  handleMessageSvgClick,
  handleExtendedView,
  setExpanded
}: Props) {
  const { revealPrivKey, setRevealPrivKey } = useContext(ChatContext);

  const { privateKey } = useKeysQuery();

  return (
    <div className="flex items-center justify-between border-b border-[--border-color] px-4 py-2 gap-2">
      <div className="flex items-center gap-2">
        {(currentUser || communityName || showSearchUser || revealPrivKey) && expanded && (
          <Tooltip content={_t("chat.back")}>
            <Button
              size="sm"
              noPadding={true}
              appearance="link"
              onClick={handleBackArrowSvg}
              icon={arrowBackSvg}
            />
          </Tooltip>
        )}
        <div className="flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
          {(currentUser || isCommunity) && (
            <UserAvatar username={isCurrentUser ? currentUser : communityName || ""} size="small" />
          )}

          <div className="text-lg truncate max-w-[180px] font-semibold">
            {currentUser
              ? currentUser
              : isCommunity
              ? communityName
              : showSearchUser
              ? _t("chat.new-message")
              : revealPrivKey
              ? _t("chat.manage-chat-key")
              : _t("chat.messages")}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Tooltip content={_t("chat.extended-view")}>
          <Button
            noPadding={true}
            size="sm"
            appearance="link"
            icon={extendedView}
            onClick={handleExtendedView}
          />
        </Tooltip>
        {canSendMessage && (
          <Tooltip content={_t("chat.new-message")}>
            <Button
              noPadding={true}
              size="sm"
              appearance="link"
              icon={addMessageSvg}
              onClick={handleMessageSvgClick}
            />
          </Tooltip>
        )}
        {isCommunity && <ChatsCommunityDropdownMenu history={history!} username={communityName} />}
        {!isCommunity && !isCurrentUser && privateKey && (
          <div className="simple-menu" onClick={() => setExpanded(true)}>
            <ChatsDropdownMenu
              history={history!}
              onManageChatKey={() => setRevealPrivKey(!revealPrivKey)}
            />
          </div>
        )}
        <Tooltip content={expanded ? _t("chat.collapse") : _t("chat.expand")}>
          <Button
            noPadding={true}
            size="sm"
            appearance="link"
            className={classNameObject({
              "duration-300": true,
              "rotate-180": !expanded
            })}
            onClick={() => setExpanded(!expanded)}
            icon={expandArrow}
          />
        </Tooltip>
      </div>
    </div>
  );
}
