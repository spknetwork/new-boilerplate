import { getRelativeDate } from "../../utils";
import { Link } from "react-router-dom";
import React, { useContext, useMemo } from "react";
import { ChatContext } from "../../chat-context-provider";
import UserAvatar from "../../../../components/user-avatar";
import { classNameObject } from "../../../../helper/class-name-object";
import { useLastMessagesQuery } from "../../queries";
import { DirectContact } from "../../nostr";

interface Props {
  contact: DirectContact;
  username: string;
}

export function ChatSidebarDirectContact({ contact, username }: Props) {
  const { setReceiverPubKey, revealPrivKey, setRevealPrivKey } = useContext(ChatContext);

  const { data: lastMessages } = useLastMessagesQuery();
  const rawUsername = useMemo(() => username?.replace("@", "") ?? "", [username]);
  const lastMessageDate = useMemo(
    () => getRelativeDate(lastMessages[contact.name]?.created),
    [lastMessages]
  );

  return (
    <Link
      className={classNameObject({
        "flex items-center text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800":
          true,
        "bg-gray-100 dark:bg-gray-800": rawUsername === contact.name
      })}
      to={`/chats/@${contact.name}`}
      onClick={() => {
        setReceiverPubKey(contact.pubkey);
        if (revealPrivKey) {
          setRevealPrivKey(false);
        }
      }}
    >
      <UserAvatar username={contact.name} size="medium" />
      <div className="flex flex-col w-[calc(100%-40px-0.75rem)]">
        <div className="flex justify-between w-full items-center">
          <div className="font-semibold truncate dark:text-white">{contact.name}</div>
          <div className="text-xs text-gray-500">{lastMessageDate}</div>
        </div>
        <div className="text-sm text-gray-600 truncate">{lastMessages[contact.name]?.content}</div>
      </div>
    </Link>
  );
}
