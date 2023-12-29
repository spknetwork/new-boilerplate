import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import LinearProgress from "../../../../components/linear-progress";
import ManageChatKey from "../manage-chat-key";
import ChatInput from "../chat-input";
import { usePrevious } from "../../../../util/use-previous";
import "./index.scss";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { useMount } from "react-use";
import { classNameObject } from "../../../../helper/class-name-object";
import { ChatPopupHeader } from "./chat-popup-header";
import { ChatPopupMessagesList } from "./chat-popup-messages-list";
import { ChatPopupSearchUser } from "./chat-popup-search-user";
import { ChatPopupContactsAndChannels } from "./chat-popup-contacts-and-channels";
import { ChatsWelcome } from "../chats-welcome";
import { useGetAccountFullQuery } from "../../../../api/queries";
import {
  ChatContext,
  getUserChatPublicKey,
  useChannelsQuery,
  useDirectContactsQuery,
  useJoinChat,
  useKeysQuery
} from "@ecency/ns-query";
import { uploadChatKeys } from "../../utils/upload-chat-keys";

export const ChatPopUp = () => {
  const { activeUser, global } = useMappedStore();

  const { receiverPubKey, revealPrivateKey, setRevealPrivateKey, setReceiverPubKey } =
    useContext(ChatContext);
  const { isLoading: isJoinChatLoading } = useJoinChat(uploadChatKeys);

  const [currentUser, setCurrentUser] = useState("");

  const { privateKey } = useKeysQuery();
  const { data: directContacts } = useDirectContactsQuery();
  const directContact = useMemo(
    () => directContacts?.find((contact) => contact.pubkey === receiverPubKey),
    [directContacts, receiverPubKey]
  );
  const { data: channels, isLoading: isChannelsLoading } = useChannelsQuery();
  const { data: currentUserAccount } = useGetAccountFullQuery(currentUser);

  const routerLocation = useLocation();
  const prevActiveUser = usePrevious(activeUser);
  const chatBodyDivRef = useRef<HTMLDivElement | null>(null);

  const [expanded, setExpanded] = useState(false);
  const [showSearchUser, setShowSearchUser] = useState(false);
  const [show, setShow] = useState(false);
  const [isCommunity, setIsCommunity] = useState(false);
  const [communityName, setCommunityName] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const hasUserJoinedChat = useMemo(() => !!privateKey, [privateKey]);
  const currentContact = useMemo(
    () => directContacts?.find((dc) => dc.pubkey === receiverPubKey),
    [receiverPubKey]
  );
  const currentChannel = useMemo(
    () => channels?.find((channel) => channel.communityName === communityName),
    [communityName, channels]
  );
  const isCurrentUser = useMemo(() => !!currentUser, [currentUser]);
  const canSendMessage = useMemo(
    () => !currentUser && hasUserJoinedChat && !!privateKey && !isCommunity && !revealPrivateKey,
    [currentUser, hasUserJoinedChat, privateKey, isCommunity, revealPrivateKey]
  );

  useMount(() => {
    setShow(!routerLocation.pathname.match("/chats") && !!activeUser);
  });

  useEffect(() => {
    if (currentUserAccount) {
      setReceiverPubKey(getUserChatPublicKey(currentUserAccount) ?? "");
    }
  }, [currentUserAccount]);

  // Show or hide the popup if current pathname was changed or user changed
  useEffect(() => {
    setShow(!routerLocation.pathname.match("/chats") && !!activeUser);
  }, [routerLocation, activeUser]);

  useEffect(() => {
    if (prevActiveUser?.username !== activeUser?.username) {
      setIsCommunity(false);
      setCurrentUser("");
      setCommunityName("");
    }
  }, [global.theme, activeUser]);

  const handleMessageSvgClick = () => {
    setShowSearchUser(!showSearchUser);
    setExpanded(true);
  };

  const handleBackArrowSvg = () => {
    setCurrentUser("");
    setCommunityName("");
    setIsCommunity(false);
    setShowSearchUser(false);
    setHasMore(true);
    setRevealPrivateKey(false);
  };

  return (
    <>
      {show && (
        <div
          className={classNameObject({
            "chatbox-container": true,
            expanded
          })}
        >
          <ChatPopupHeader
            currentUser={currentUser}
            setExpanded={setExpanded}
            canSendMessage={canSendMessage}
            expanded={expanded}
            isCurrentUser={isCurrentUser}
            communityName={communityName}
            isCommunity={isCommunity}
            handleBackArrowSvg={handleBackArrowSvg}
            handleMessageSvgClick={handleMessageSvgClick}
            showSearchUser={showSearchUser}
          />
          {(isJoinChatLoading || isChannelsLoading) && <LinearProgress />}
          <div
            className={`chat-body h-full ${
              currentUser ? "current-user" : isCommunity ? "community" : ""
            } ${
              !hasUserJoinedChat ? "flex items-center justify-center" : hasMore ? "no-scroll" : ""
            }`}
            ref={chatBodyDivRef}
          >
            {hasUserJoinedChat && !revealPrivateKey ? (
              <>
                {currentUser.length !== 0 || communityName.length !== 0 ? (
                  <ChatPopupMessagesList
                    currentContact={currentContact}
                    currentChannel={currentChannel}
                  />
                ) : showSearchUser ? (
                  <ChatPopupSearchUser setCurrentUser={setCurrentUser} />
                ) : (
                  <ChatPopupContactsAndChannels
                    communityClicked={(community: string) => {
                      setIsCommunity(true);
                      setCommunityName(community);
                      setCurrentUser("");
                      setReceiverPubKey("");
                    }}
                    setShowSearchUser={setShowSearchUser}
                    userClicked={(username) => {
                      setCurrentUser(username);
                      setCommunityName("");
                    }}
                  />
                )}
              </>
            ) : revealPrivateKey ? (
              <div className="p-4">
                <ManageChatKey />
              </div>
            ) : (
              <ChatsWelcome />
            )}
          </div>
          <div className="pl-2">
            {((isCurrentUser && receiverPubKey) || isCommunity) && (
              <ChatInput
                currentContact={currentContact}
                currentChannel={currentChannel ?? undefined}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};