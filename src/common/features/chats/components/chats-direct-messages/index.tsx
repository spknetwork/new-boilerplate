import React, { useContext, useMemo, useState } from "react";
import { _t } from "../../../../i18n";
import "./index.scss";
import { ChatMessageItem } from "../chat-message-item";
import { Button } from "@ui/button";
import { useInviteViaPostComment } from "../../mutations";
import { FormControl } from "@ui/input";
import { Alert } from "@ui/alert";
import {
  ChatContext,
  checkContiguousMessage,
  DirectContact,
  DirectMessage,
  useDirectMessagesQuery,
  useKeysQuery
} from "@ecency/ns-query";
import { ChatFloatingDate } from "../chat-floating-date";
import { differenceInCalendarDays } from "date-fns";
import { groupMessages } from "../../utils";

interface Props {
  directMessages: DirectMessage[];
  currentContact: DirectContact;
  isPage?: boolean;
}

export default function ChatsDirectMessages(props: Props) {
  const { directMessages } = props;

  const { receiverPubKey } = useContext(ChatContext);

  const [initiatedInviting, setInitiatedInviting] = useState(false);
  const [invitationText, setInvitationText] = useState(
    "Hi! Let's start messaging privately. Register an account on [https://ecency.com/chats](https://ecency.com/chats)"
  );
  const { publicKey } = useKeysQuery();
  const { fetchNextPage } = useDirectMessagesQuery(props.currentContact);

  const {
    mutateAsync: invite,
    isLoading: isInviting,
    isSuccess: isInvited
  } = useInviteViaPostComment(props.currentContact?.name);

  const groupedDirectMessages = useMemo(() => groupMessages(directMessages), [directMessages]);

  return (
    <>
      <div className="direct-messages">
        {receiverPubKey ? (
          <>
            {groupedDirectMessages?.map(([date, messages], i) => {
              const diff =
                i > 0 ? differenceInCalendarDays(date, groupedDirectMessages[i - 1][0]) : 1;
              return (
                <React.Fragment key={date.getTime()}>
                  {diff > 0 && <ChatFloatingDate currentDate={date} isPage={props.isPage} />}
                  {messages.map((message, j) => (
                    <ChatMessageItem
                      showDate={j === messages.length - 1}
                      key={message.id}
                      currentContact={props.currentContact}
                      type={message.creator !== publicKey ? "receiver" : "sender"}
                      message={message}
                      isSameUser={checkContiguousMessage(message, i, directMessages)}
                      onAppear={() =>
                        setTimeout(
                          () =>
                            groupedDirectMessages?.length - 1 === i && messages.length - 1 === j
                              ? document
                                  .querySelector(`[data-message-id="${message.id}"]`)
                                  ?.scrollIntoView()
                              : {},
                          300
                        )
                      }
                      onInViewport={() =>
                        i === groupedDirectMessages.length - 1 &&
                        j === messages.length - 1 &&
                        fetchNextPage({
                          pageParam: message.created * 1000
                        })
                      }
                    />
                  ))}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col justify-center text-center items-center p-4">
            <div className="font-bold">{_t("chat.welcome.oops")}</div>
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              {_t("chat.welcome.user-not-joined-yet")}
            </div>
            {!isInvited &&
              (initiatedInviting ? (
                <div className="flex flex-col gap-4 items-center">
                  <Alert>{_t("chat.specify-invitation-message")}</Alert>
                  <FormControl
                    type="textarea"
                    value={invitationText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInvitationText(e.target.value)
                    }
                  />
                  <Button
                    outline={true}
                    size="sm"
                    disabled={isInviting}
                    onClick={async () => {
                      await invite(invitationText);
                      setInitiatedInviting(false);
                    }}
                  >
                    {_t("chat.send-invite")}
                  </Button>
                </div>
              ) : (
                <Button outline={true} size="sm" onClick={() => setInitiatedInviting(true)}>
                  {_t("chat.invite")}
                </Button>
              ))}
            {isInvited && (
              <Alert className="my-4" appearance="success">
                {_t("chat.successfully-invited")}
              </Alert>
            )}
          </div>
        )}
      </div>
    </>
  );
}
