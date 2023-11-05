import React, { RefObject, useContext, useEffect, useRef, useState } from "react";
import { useMount } from "react-use";
import mediumZoom, { Zoom } from "medium-zoom";
import {
  Channel,
  communityModerator,
  Profile,
  PublicMessage
} from "../../managers/message-manager-types";
import { History } from "history";
import { renderPostBody } from "@ecency/render-helper";
import { useMappedStore } from "../../../../store/use-mapped-store";
import UserAvatar from "../../../../components/user-avatar";
import FollowControls from "../../../../components/follow-controls";
import usePrevious from "react-use/lib/usePrevious";
import { _t } from "../../../../i18n";
import ChatsConfirmationModal from "../chats-confirmation-modal";
import { error } from "../../../../components/feedback";
import { CHATPAGE, COMMUNITYADMINROLES, PRIVILEGEDROLES } from "../chat-popup/chat-constants";
import { Theme } from "../../../../store/global/types";
import {
  checkContiguousMessage,
  formatMessageDateAndDay,
  isMessageGif,
  isMessageImage
} from "../../utils";
import { ChatContext } from "../../chat-context-provider";

import "./index.scss";
import { Popover, PopoverContent } from "@ui/popover";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import { ChatMessageItem } from "../chat-message-item";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  username: string;
  from?: string;
  history: History;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
  currentChannelSetter: (channel: Channel) => void;
}

let zoom: Zoom | null = null;
export default function ChatsChannelMessages(props: Props) {
  const {
    publicMessages,
    history,
    from,
    isScrollToBottom,
    isScrolled,
    currentChannel,
    scrollToBottom,
    currentChannelSetter
  } = props;
  const {
    chat,
    global,
    activeUser,
    ui,
    users,
    deletePublicMessage,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp
  } = useMappedStore();

  const { messageServiceInstance, activeUserKeys, windowWidth, isActiveUserRemoved } =
    useContext(ChatContext);

  let prevGlobal = usePrevious(global);

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const channelMessagesRef = React.createRef<HTMLDivElement>();

  const [communityAdmins, setCommunityAdmins] = useState<string[]>([]);
  const [hoveredMessageId, setHoveredMessageId] = useState("");
  const [step, setStep] = useState(0);
  const [dmMessage, setDmMessage] = useState("");
  const [clickedMessage, setClickedMessage] = useState("");
  const [removedUserId, setRemovedUserID] = useState("");
  const [privilegedUsers, setPrivilegedUsers] = useState<string[]>([]);
  const [hiddenMsgId, setHiddenMsgId] = useState("");
  const [resendMessage, setResendMessage] = useState<PublicMessage>();

  const [showMessageActions, setShowMessageActions] = useState(false);

  useMount(() => {
    if (window.innerWidth <= 768) {
      setShowMessageActions(true);
    }
  });

  useEffect(() => {
    if (prevGlobal?.theme !== global.theme) {
      setBackground();
    }
    prevGlobal = global;
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (publicMessages.length !== 0) {
      zoomInitializer();
    }
    if (!isScrollToBottom && publicMessages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [publicMessages, isScrollToBottom, channelMessagesRef]);

  useEffect(() => {
    if (windowWidth <= 768) {
      setShowMessageActions(true);
    }
  }, [windowWidth]);

  useEffect(() => {
    if (currentChannel) {
      zoomInitializer();
      getPrivilegedUsers(currentChannel?.communityModerators!);
    }
  }, [currentChannel]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as HTMLElement;

      if (!popoverRef.current) {
        return;
      }

      const isAvatarClicked =
        clickedElement.classList.contains("user-avatar") &&
        clickedElement.classList.contains("medium");
      if (
        popoverRef.current &&
        !popoverRef.current?.contains(event.target as Node) &&
        !isAvatarClicked
      ) {
        setClickedMessage("");
      }
    };

    if (channelMessagesRef.current) {
      channelMessagesRef.current.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      if (channelMessagesRef.current) {
        channelMessagesRef.current.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [clickedMessage]);

  const sendDM = (name: string, pubkey: string) => {
    if (dmMessage) {
      messageServiceInstance?.sendDirectMessage(pubkey, dmMessage);
      setClickedMessage("");
      setDmMessage("");
      if (from && from === CHATPAGE) {
        history?.push(`/chats/@${name}`);
      }
    }
  };

  const zoomInitializer = () => {
    const elements: HTMLElement[] = [...document.querySelectorAll<HTMLElement>(".chat-image img")];
    zoom = mediumZoom(elements);
    setBackground();
  };

  const setBackground = () => {
    if (global.theme === Theme.day) {
      zoom?.update({ background: "#ffffff" });
    } else {
      zoom?.update({ background: "#131111" });
    }
  };

  const handleImageClick = (msgId: string, pubkey: string) => {
    if (clickedMessage === msgId) {
      popoverRef.current = null;
      setClickedMessage("");
    } else {
      popoverRef.current = null;
      setClickedMessage(msgId);
      setRemovedUserID(pubkey);
    }
  };

  const getPrivilegedUsers = (communityModerators: communityModerator[]) => {
    const privilegedUsers = communityModerators.filter((user) =>
      PRIVILEGEDROLES.includes(user.role)
    );
    const communityAdmins = communityModerators.filter((user) =>
      COMMUNITYADMINROLES.includes(user.role)
    );

    const privilegedUserNames = privilegedUsers.map((user) => user.name);
    const communityAdminNames = communityAdmins.map((user) => user.name);

    setPrivilegedUsers(privilegedUserNames);
    setCommunityAdmins(communityAdminNames);
  };

  const getProfileName = (creator: string, profiles: Profile[]) => {
    const profile = profiles.find((x) => x.creator === creator);
    return profile?.name;
  };

  const handleConfirm = () => {
    let updatedMetaData = {
      name: currentChannel?.name!,
      about: currentChannel?.about!,
      picture: "",
      communityName: currentChannel?.communityName!,
      communityModerators: currentChannel?.communityModerators,
      hiddenMessageIds: currentChannel?.hiddenMessageIds,
      removedUserIds: currentChannel?.removedUserIds
    };

    switch (step) {
      case 1:
        const updatedHiddenMessages = [...(currentChannel?.hiddenMessageIds || []), hiddenMsgId!];
        updatedMetaData.hiddenMessageIds = updatedHiddenMessages;
        break;
      case 2:
        const updatedRemovedUsers = [...(currentChannel?.removedUserIds || []), removedUserId!];
        updatedMetaData.removedUserIds = updatedRemovedUsers;

        const isRemovedUserModerator = currentChannel?.communityModerators?.find(
          (x) => x.pubkey === removedUserId
        );
        const isModerator = !!isRemovedUserModerator;
        if (isModerator) {
          const NewUpdatedRoles = currentChannel?.communityModerators?.filter(
            (item) => item.pubkey !== removedUserId
          );
          updatedMetaData.communityModerators = NewUpdatedRoles;
        }
        break;
      case 3:
        const newUpdatedRemovedUsers =
          currentChannel &&
          currentChannel?.removedUserIds!.filter((item) => item !== removedUserId);

        updatedMetaData.removedUserIds = newUpdatedRemovedUsers;
        break;
      case 4:
        if (resendMessage) {
          deletePublicMessage(currentChannel.id, resendMessage?.id);
          messageServiceInstance?.sendPublicMessage(
            currentChannel!,
            resendMessage?.content,
            [],
            ""
          );
        }
        break;
      default:
        break;
    }

    try {
      messageServiceInstance?.updateChannel(currentChannel!, updatedMetaData);
      currentChannelSetter({ ...currentChannel!, ...updatedMetaData });
      setStep(0);
    } catch (err) {
      error(_t("chat.error-updating-community"));
    }
  };

  const handelMessageActions = (msgId: string) => {
    if (showMessageActions && hoveredMessageId !== msgId) {
      setHoveredMessageId(msgId);
    } else {
      setHoveredMessageId("");
    }
  };

  return (
    <>
      <div className="channel-messages" ref={channelMessagesRef}>
        {publicMessages.length !== 0 &&
          activeUserKeys &&
          publicMessages.map((pMsg, i) => {
            const dayAndMonth = formatMessageDateAndDay(pMsg, i, publicMessages);

            const isSameUserMessage = checkContiguousMessage(pMsg, i, publicMessages);

            let renderedPreview = renderPostBody(pMsg.content, false, global.canUseWebp);

            renderedPreview = renderedPreview.replace(/<p[^>]*>/g, "");
            renderedPreview = renderedPreview.replace(/<\/p>/g, "");

            const isGif = isMessageGif(pMsg.content);

            const isImage = isMessageImage(pMsg.content);

            const name = getProfileName(pMsg.creator, chat.profiles);

            const popover = (
              <Popover id={`profile-popover`} className="profile-popover">
                <PopoverContent>
                  <div className="profile-box" ref={popoverRef as RefObject<HTMLDivElement>}>
                    <div className="profile-box-content">
                      <div className="profile-box-logo flex justify-center">
                        <UserAvatar username={name!} size="large" />
                      </div>

                      <p className="flex justify-center profile-name">{`@${name!}`}</p>
                      <div
                        className={`flex mb-3 ${
                          communityAdmins.includes(activeUser?.username!) &&
                          name !== currentChannel.communityName
                            ? "justify-between"
                            : "justify-center"
                        }  profile-box-buttons`}
                      >
                        <FollowControls
                          setActiveUser={setActiveUser}
                          updateActiveUser={updateActiveUser}
                          deleteUser={deleteUser}
                          toggleUIProp={toggleUIProp}
                          activeUser={activeUser}
                          targetUsername={name!}
                          where={"chat-box"}
                          ui={ui}
                          users={users}
                        />

                        {communityAdmins.includes(activeUser?.username!) &&
                          name !== currentChannel.communityName && (
                            <>
                              {currentChannel?.removedUserIds?.includes(pMsg.creator) ? (
                                <>
                                  <Button
                                    onClick={() => {
                                      setStep(3);
                                      setClickedMessage("");
                                    }}
                                  >
                                    {_t("chat.unblock")}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => {
                                      setStep(2);
                                      setClickedMessage("");
                                    }}
                                  >
                                    {_t("chat.block")}
                                  </Button>
                                </>
                              )}
                            </>
                          )}
                      </div>

                      <Form
                        onSubmit={(e: React.FormEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          sendDM(name!, pMsg.creator);
                        }}
                      >
                        <FormControl
                          value={dmMessage}
                          autoFocus={true}
                          onChange={(e) => setDmMessage(e.target.value)}
                          required={true}
                          type="text"
                          placeholder={"Send direct message"}
                          autoComplete="off"
                        />
                      </Form>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );

            return (
              <React.Fragment key={pMsg.id}>
                {dayAndMonth && (
                  <div className="custom-divider">
                    <span className="flex justify-center items-center mt-3 custom-divider-text">
                      {dayAndMonth}
                    </span>
                  </div>
                )}

                <ChatMessageItem
                  type={pMsg.creator !== activeUserKeys?.pub ? "receiver" : "sender"}
                  message={pMsg}
                  isSameUser={isSameUserMessage}
                />
              </React.Fragment>
            );
          })}
        {isActiveUserRemoved && (
          <span className="flex justify-center items-center mt-3">
            You have been blocked from this community
          </span>
        )}
      </div>
      {step !== 0 && (
        <ChatsConfirmationModal
          actionType={"Confirmation"}
          content={"Are you sure?"}
          onClose={() => {
            setStep(0);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
