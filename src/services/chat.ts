import { google, type chat_v1, type Auth } from "googleapis";

export interface Space {
  name: string;
  displayName?: string;
  type: "TYPE_UNSPECIFIED" | "ROOM" | "DM" | "DIRECT_MESSAGE";
  singleUserBotDm?: boolean;
  threaded?: boolean;
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
  spaceHistoryState?: "HISTORY_STATE_UNSPECIFIED" | "HISTORY_OFF" | "HISTORY_ON";
  externalUserAllowed?: boolean;
  adminInstalled?: boolean;
  createTime?: string;
}

export interface Message {
  name: string;
  sender?: {
    name: string;
    displayName?: string;
    domainId?: string;
    type?: "TYPE_UNSPECIFIED" | "HUMAN" | "BOT";
    isAnonymous?: boolean;
  };
  createTime?: string;
  lastUpdateTime?: string;
  text?: string;
  formattedText?: string;
  cards?: MessageCard[];
  cardsV2?: CardWithId[];
  thread?: {
    name: string;
    threadKey?: string;
  };
  space?: {
    name: string;
    type?: string;
    displayName?: string;
  };
  attachment?: Attachment[];
  argumentText?: string;
  slashCommand?: {
    commandId?: string;
  };
  emojiReactionSummaries?: Array<{
    emoji?: { unicode?: string };
    reactionCount?: number;
  }>;
  privateMessageViewer?: {
    name?: string;
    displayName?: string;
  };
  deletionMetadata?: {
    deletionType?: string;
  };
  quotedMessageMetadata?: {
    name?: string;
    lastUpdateTime?: string;
  };
  accessoryWidgets?: AccessoryWidget[];
}

export interface MessageCard {
  header?: {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    imageStyle?: "IMAGE_STYLE_UNSPECIFIED" | "IMAGE" | "AVATAR";
  };
  sections?: Array<{
    header?: string;
    widgets?: CardWidget[];
    collapsible?: boolean;
    uncollapsibleWidgetsCount?: number;
  }>;
  cardActions?: Array<{
    actionLabel?: string;
    onClick?: OnClick;
  }>;
  name?: string;
}

export interface CardWithId {
  cardId: string;
  card: MessageCard;
}

export interface CardWidget {
  textParagraph?: { text: string };
  image?: {
    imageUrl: string;
    onClick?: OnClick;
    altText?: string;
  };
  decoratedText?: {
    icon?: { knownIcon?: string; iconUrl?: string; altText?: string };
    topLabel?: string;
    text?: string;
    wrapText?: boolean;
    bottomLabel?: string;
    onClick?: OnClick;
    button?: Button;
    switchControl?: {
      name?: string;
      value?: string;
      selected?: boolean;
      onChangeAction?: Action;
      controlType?: "SWITCH" | "CHECKBOX" | "CHECK_BOX";
    };
    startIcon?: { knownIcon?: string; iconUrl?: string; altText?: string };
    endIcon?: { knownIcon?: string; iconUrl?: string; altText?: string };
  };
  buttonList?: {
    buttons?: Button[];
  };
  selectionInput?: {
    name?: string;
    label?: string;
    type?: "CHECK_BOX" | "RADIO_BUTTON" | "SWITCH" | "DROPDOWN" | "MULTI_SELECT";
    items?: Array<{
      text?: string;
      value?: string;
      selected?: boolean;
      startIconUri?: string;
      bottomText?: string;
    }>;
    onChangeAction?: Action;
    multiSelectMaxSelectedItems?: number;
    multiSelectMinQueryLength?: number;
    externalDataSource?: {
      function?: string;
    };
    platformDataSource?: {
      commonDataSource?: "UNKNOWN" | "USER";
      hostAppDataSource?: {
        chatDataSource?: {
          spaceDataSource?: {
            defaultToCurrentSpace?: boolean;
          };
        };
      };
    };
  };
  dateTimePicker?: {
    name?: string;
    label?: string;
    type?: "DATE_AND_TIME" | "DATE_ONLY" | "TIME_ONLY";
    valueMsEpoch?: string;
    timezoneOffsetDate?: number;
    onChangeAction?: Action;
  };
  divider?: Record<string, unknown>;
  grid?: {
    title?: string;
    items?: Array<{
      id?: string;
      image?: {
        imageUri?: string;
        altText?: string;
        cropStyle?: {
          type?: string;
          aspectRatio?: number;
        };
        borderStyle?: {
          type?: string;
          strokeColor?: { red?: number; green?: number; blue?: number; alpha?: number };
          cornerRadius?: number;
        };
      };
      title?: string;
      subtitle?: string;
      layout?: "TEXT_BELOW" | "TEXT_ABOVE";
    }>;
    columnCount?: number;
    onClick?: OnClick;
    borderStyle?: {
      type?: string;
      strokeColor?: { red?: number; green?: number; blue?: number; alpha?: number };
      cornerRadius?: number;
    };
  };
  columns?: {
    columnItems?: Array<{
      horizontalSizeStyle?: "HORIZONTAL_SIZE_STYLE_UNSPECIFIED" | "FILL_AVAILABLE_SPACE" | "FILL_MINIMUM_SPACE";
      horizontalAlignment?: "HORIZONTAL_ALIGNMENT_UNSPECIFIED" | "START" | "CENTER" | "END";
      verticalAlignment?: "VERTICAL_ALIGNMENT_UNSPECIFIED" | "CENTER" | "TOP" | "BOTTOM";
      widgets?: CardWidget[];
    }>;
  };
}

export interface OnClick {
  action?: Action;
  openLink?: {
    url?: string;
    openAs?: "FULL_SIZE" | "OVERLAY";
    onClose?: "NOTHING" | "RELOAD";
  };
  openDynamicLinkAction?: Action;
  card?: MessageCard;
}

export interface Action {
  function?: string;
  parameters?: Array<{
    key?: string;
    value?: string;
  }>;
  loadIndicator?: "SPINNER" | "NONE";
  persistValues?: boolean;
  interaction?: "INTERACTION_UNSPECIFIED" | "OPEN_DIALOG";
}

export interface Button {
  text?: string;
  icon?: { knownIcon?: string; iconUrl?: string; altText?: string };
  color?: { red?: number; green?: number; blue?: number; alpha?: number };
  onClick?: OnClick;
  disabled?: boolean;
  altText?: string;
}

export interface Attachment {
  name?: string;
  contentName?: string;
  contentType?: string;
  thumbnailUri?: string;
  downloadUri?: string;
  attachmentDataRef?: {
    resourceName?: string;
    attachmentUploadToken?: string;
  };
  driveDataRef?: {
    driveFileId?: string;
  };
  source?: "DRIVE_FILE" | "UPLOADED_CONTENT";
}

export interface AccessoryWidget {
  buttonList?: {
    buttons?: Button[];
  };
}

export interface Member {
  name: string;
  state?: "MEMBER_STATE_UNSPECIFIED" | "JOINED" | "INVITED" | "NOT_A_MEMBER";
  role?: "MEMBERSHIP_ROLE_UNSPECIFIED" | "ROLE_MEMBER" | "ROLE_MANAGER";
  member?: {
    name: string;
    displayName?: string;
    domainId?: string;
    type?: "TYPE_UNSPECIFIED" | "HUMAN" | "BOT";
  };
  groupMember?: {
    name: string;
  };
  createTime?: string;
  deleteTime?: string;
}

export interface CreateSpaceOptions {
  displayName: string;
  spaceType?: "SPACE" | "GROUP_CHAT" | "DIRECT_MESSAGE";
  externalUserAllowed?: boolean;
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
}

export interface SendMessageOptions {
  spaceName: string;
  text?: string;
  cards?: MessageCard[];
  threadKey?: string;
  messageReplyOption?: "MESSAGE_REPLY_OPTION_UNSPECIFIED" | "REPLY_MESSAGE_FALLBACK_TO_NEW_THREAD" | "REPLY_MESSAGE_OR_FAIL";
  messageId?: string;
  accessoryWidgets?: AccessoryWidget[];
}

export interface UpdateMessageOptions {
  messageName: string;
  text?: string;
  cards?: MessageCard[];
  accessoryWidgets?: AccessoryWidget[];
}

export class ChatService {
  private readonly chat: chat_v1.Chat;

  constructor(authClient: Auth.OAuth2Client) {
    this.chat = google.chat({ version: "v1", auth: authClient });
  }

  // Space Operations

  public async listSpaces(
    pageSize = 100,
    pageToken?: string
  ): Promise<{ spaces: Space[]; nextPageToken?: string }> {
    const response = await this.chat.spaces.list({
      pageSize,
      pageToken,
    });

    const spaces = (response.data.spaces || []).map((space) =>
      this.formatSpace(space)
    );

    return {
      spaces,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getSpace(spaceName: string): Promise<Space> {
    const response = await this.chat.spaces.get({
      name: spaceName,
    });

    return this.formatSpace(response.data);
  }

  public async createSpace(options: CreateSpaceOptions): Promise<Space> {
    const response = await this.chat.spaces.create({
      requestBody: {
        displayName: options.displayName,
        spaceType: options.spaceType || "SPACE",
        externalUserAllowed: options.externalUserAllowed,
        spaceDetails: options.spaceDetails,
      },
    });

    return this.formatSpace(response.data);
  }

  public async updateSpace(
    spaceName: string,
    options: {
      displayName?: string;
      spaceDetails?: {
        description?: string;
        guidelines?: string;
      };
    }
  ): Promise<Space> {
    const updateMask: string[] = [];

    if (options.displayName !== undefined) {
      updateMask.push("displayName");
    }
    if (options.spaceDetails !== undefined) {
      if (options.spaceDetails.description !== undefined) {
        updateMask.push("spaceDetails.description");
      }
      if (options.spaceDetails.guidelines !== undefined) {
        updateMask.push("spaceDetails.guidelines");
      }
    }

    const response = await this.chat.spaces.patch({
      name: spaceName,
      updateMask: updateMask.join(","),
      requestBody: {
        displayName: options.displayName,
        spaceDetails: options.spaceDetails,
      },
    });

    return this.formatSpace(response.data);
  }

  public async deleteSpace(spaceName: string): Promise<void> {
    await this.chat.spaces.delete({
      name: spaceName,
    });
  }

  public async findDirectMessage(userId: string): Promise<Space | null> {
    const response = await this.chat.spaces.findDirectMessage({
      name: userId,
    });

    if (response.data.name) {
      return this.formatSpace(response.data);
    }

    return null;
  }

  // Message Operations

  public async listMessages(
    spaceName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
      filter?: string;
      orderBy?: string;
      showDeleted?: boolean;
    } = {}
  ): Promise<{ messages: Message[]; nextPageToken?: string }> {
    const response = await this.chat.spaces.messages.list({
      parent: spaceName,
      pageSize: options.pageSize || 100,
      pageToken: options.pageToken,
      filter: options.filter,
      orderBy: options.orderBy,
      showDeleted: options.showDeleted,
    });

    const messages = (response.data.messages || []).map((msg) =>
      this.formatMessage(msg)
    );

    return {
      messages,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getMessage(messageName: string): Promise<Message> {
    const response = await this.chat.spaces.messages.get({
      name: messageName,
    });

    return this.formatMessage(response.data);
  }

  public async sendMessage(options: SendMessageOptions): Promise<Message> {
    const response = await this.chat.spaces.messages.create({
      parent: options.spaceName,
      messageReplyOption: options.messageReplyOption,
      messageId: options.messageId,
      requestBody: {
        text: options.text,
        cardsV2: options.cards?.map((card, index) => ({
          cardId: `card_${index}`,
          card,
        })),
        thread: options.threadKey
          ? { threadKey: options.threadKey }
          : undefined,
        accessoryWidgets: options.accessoryWidgets,
      },
    });

    return this.formatMessage(response.data);
  }

  public async updateMessage(options: UpdateMessageOptions): Promise<Message> {
    const updateMask: string[] = [];

    if (options.text !== undefined) {
      updateMask.push("text");
    }
    if (options.cards !== undefined) {
      updateMask.push("cardsV2");
    }
    if (options.accessoryWidgets !== undefined) {
      updateMask.push("accessoryWidgets");
    }

    const response = await this.chat.spaces.messages.patch({
      name: options.messageName,
      updateMask: updateMask.join(","),
      requestBody: {
        text: options.text,
        cardsV2: options.cards?.map((card, index) => ({
          cardId: `card_${index}`,
          card,
        })),
        accessoryWidgets: options.accessoryWidgets,
      },
    });

    return this.formatMessage(response.data);
  }

  public async deleteMessage(messageName: string, force = false): Promise<void> {
    await this.chat.spaces.messages.delete({
      name: messageName,
      force,
    });
  }

  // Reaction Operations

  public async addReaction(
    messageName: string,
    emoji: string
  ): Promise<void> {
    await this.chat.spaces.messages.reactions.create({
      parent: messageName,
      requestBody: {
        emoji: {
          unicode: emoji,
        },
      },
    });
  }

  public async removeReaction(reactionName: string): Promise<void> {
    await this.chat.spaces.messages.reactions.delete({
      name: reactionName,
    });
  }

  public async listReactions(
    messageName: string,
    pageSize = 50,
    pageToken?: string,
    filter?: string
  ): Promise<{
    reactions: Array<{
      name: string;
      user?: { name: string; displayName?: string };
      emoji?: { unicode?: string };
    }>;
    nextPageToken?: string;
  }> {
    const response = await this.chat.spaces.messages.reactions.list({
      parent: messageName,
      pageSize,
      pageToken,
      filter,
    });

    const reactions = (response.data.reactions || []).map((r) => ({
      name: r.name || "",
      user: r.user
        ? {
            name: r.user.name || "",
            displayName: r.user.displayName || undefined,
          }
        : undefined,
      emoji: r.emoji
        ? {
            unicode: r.emoji.unicode || undefined,
          }
        : undefined,
    }));

    return {
      reactions,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  // Member Operations

  public async listMembers(
    spaceName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
      filter?: string;
      showGroups?: boolean;
      showInvited?: boolean;
    } = {}
  ): Promise<{ members: Member[]; nextPageToken?: string }> {
    const response = await this.chat.spaces.members.list({
      parent: spaceName,
      pageSize: options.pageSize || 100,
      pageToken: options.pageToken,
      filter: options.filter,
      showGroups: options.showGroups,
      showInvited: options.showInvited,
    });

    const members = (response.data.memberships || []).map((m) =>
      this.formatMember(m)
    );

    return {
      members,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getMember(memberName: string): Promise<Member> {
    const response = await this.chat.spaces.members.get({
      name: memberName,
    });

    return this.formatMember(response.data);
  }

  public async addMember(
    spaceName: string,
    userId: string,
    role: "ROLE_MEMBER" | "ROLE_MANAGER" = "ROLE_MEMBER"
  ): Promise<Member> {
    const response = await this.chat.spaces.members.create({
      parent: spaceName,
      requestBody: {
        member: {
          name: userId,
          type: "HUMAN",
        },
        role,
      },
    });

    return this.formatMember(response.data);
  }

  public async updateMemberRole(
    memberName: string,
    role: "ROLE_MEMBER" | "ROLE_MANAGER"
  ): Promise<Member> {
    const response = await this.chat.spaces.members.patch({
      name: memberName,
      updateMask: "role",
      requestBody: {
        role,
      },
    });

    return this.formatMember(response.data);
  }

  public async removeMember(memberName: string): Promise<void> {
    await this.chat.spaces.members.delete({
      name: memberName,
    });
  }

  // Private helpers

  private formatSpace(space: chat_v1.Schema$Space): Space {
    return {
      name: space.name || "",
      displayName: space.displayName || undefined,
      type: (space.type as Space["type"]) || "TYPE_UNSPECIFIED",
      singleUserBotDm: space.singleUserBotDm || undefined,
      threaded: space.threaded || undefined,
      spaceDetails: space.spaceDetails
        ? {
            description: space.spaceDetails.description || undefined,
            guidelines: space.spaceDetails.guidelines || undefined,
          }
        : undefined,
      spaceHistoryState: (space.spaceHistoryState as Space["spaceHistoryState"]) || undefined,
      externalUserAllowed: space.externalUserAllowed || undefined,
      adminInstalled: space.adminInstalled || undefined,
      createTime: space.createTime || undefined,
    };
  }

  private formatMessage(message: chat_v1.Schema$Message): Message {
    return {
      name: message.name || "",
      sender: message.sender
        ? {
            name: message.sender.name || "",
            displayName: message.sender.displayName || undefined,
            domainId: message.sender.domainId || undefined,
            type: (message.sender.type as Message["sender"]extends { type?: infer T } ? T : never) || undefined,
            isAnonymous: message.sender.isAnonymous || undefined,
          }
        : undefined,
      createTime: message.createTime || undefined,
      lastUpdateTime: message.lastUpdateTime || undefined,
      text: message.text || undefined,
      formattedText: message.formattedText || undefined,
      cards: message.cards as MessageCard[] | undefined,
      cardsV2: message.cardsV2 as CardWithId[] | undefined,
      thread: message.thread
        ? {
            name: message.thread.name || "",
            threadKey: message.thread.threadKey || undefined,
          }
        : undefined,
      space: message.space
        ? {
            name: message.space.name || "",
            type: message.space.type || undefined,
            displayName: message.space.displayName || undefined,
          }
        : undefined,
      attachment: message.attachment as Attachment[] | undefined,
      argumentText: message.argumentText || undefined,
      slashCommand: message.slashCommand
        ? {
            commandId: message.slashCommand.commandId
              ? String(message.slashCommand.commandId)
              : undefined,
          }
        : undefined,
      emojiReactionSummaries: message.emojiReactionSummaries?.map((e) => ({
        emoji: e.emoji ? { unicode: e.emoji.unicode || undefined } : undefined,
        reactionCount: e.reactionCount || undefined,
      })),
      privateMessageViewer: message.privateMessageViewer
        ? {
            name: message.privateMessageViewer.name || undefined,
            displayName: message.privateMessageViewer.displayName || undefined,
          }
        : undefined,
      deletionMetadata: message.deletionMetadata
        ? {
            deletionType: message.deletionMetadata.deletionType || undefined,
          }
        : undefined,
      quotedMessageMetadata: message.quotedMessageMetadata
        ? {
            name: message.quotedMessageMetadata.name || undefined,
            lastUpdateTime: message.quotedMessageMetadata.lastUpdateTime || undefined,
          }
        : undefined,
      accessoryWidgets: message.accessoryWidgets as AccessoryWidget[] | undefined,
    };
  }

  private formatMember(member: chat_v1.Schema$Membership): Member {
    return {
      name: member.name || "",
      state: (member.state as Member["state"]) || undefined,
      role: (member.role as Member["role"]) || undefined,
      member: member.member
        ? {
            name: member.member.name || "",
            displayName: member.member.displayName || undefined,
            domainId: member.member.domainId || undefined,
            type: (member.member.type as Member["member"]extends { type?: infer T } ? T : never) || undefined,
          }
        : undefined,
      groupMember: member.groupMember
        ? {
            name: member.groupMember.name || "",
          }
        : undefined,
      createTime: member.createTime || undefined,
      deleteTime: member.deleteTime || undefined,
    };
  }
}

