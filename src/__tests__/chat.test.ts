import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Auth } from "googleapis";

// Mock googleapis
const mockSpacesList = vi.fn();
const mockSpacesGet = vi.fn();
const mockSpacesCreate = vi.fn();
const mockSpacesPatch = vi.fn();
const mockSpacesDelete = vi.fn();
const mockSpacesFindDirectMessage = vi.fn();
const mockMessagesList = vi.fn();
const mockMessagesGet = vi.fn();
const mockMessagesCreate = vi.fn();
const mockMessagesPatch = vi.fn();
const mockMessagesDelete = vi.fn();
const mockReactionsCreate = vi.fn();
const mockReactionsDelete = vi.fn();
const mockReactionsList = vi.fn();
const mockMembersList = vi.fn();
const mockMembersGet = vi.fn();
const mockMembersCreate = vi.fn();
const mockMembersPatch = vi.fn();
const mockMembersDelete = vi.fn();

vi.mock("googleapis", () => ({
  google: {
    chat: vi.fn(() => ({
      spaces: {
        list: mockSpacesList,
        get: mockSpacesGet,
        create: mockSpacesCreate,
        patch: mockSpacesPatch,
        delete: mockSpacesDelete,
        findDirectMessage: mockSpacesFindDirectMessage,
        messages: {
          list: mockMessagesList,
          get: mockMessagesGet,
          create: mockMessagesCreate,
          patch: mockMessagesPatch,
          delete: mockMessagesDelete,
          reactions: {
            create: mockReactionsCreate,
            delete: mockReactionsDelete,
            list: mockReactionsList,
          },
        },
        members: {
          list: mockMembersList,
          get: mockMembersGet,
          create: mockMembersCreate,
          patch: mockMembersPatch,
          delete: mockMembersDelete,
        },
      },
    })),
  },
}));

import { ChatService } from "../services/chat.js";

describe("ChatService", () => {
  let service: ChatService;
  const mockAuthClient = {} as Auth.OAuth2Client;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ChatService(mockAuthClient);
  });

  describe("listSpaces", () => {
    it("should list spaces", async () => {
      mockSpacesList.mockResolvedValue({
        data: {
          spaces: [
            { name: "spaces/AAAAA", displayName: "General", type: "ROOM" },
            { name: "spaces/BBBBB", displayName: "Random", type: "ROOM" },
          ],
          nextPageToken: "token123",
        },
      });

      const result = await service.listSpaces();

      expect(result.spaces).toHaveLength(2);
      expect(result.spaces[0].name).toBe("spaces/AAAAA");
      expect(result.spaces[0].displayName).toBe("General");
      expect(result.nextPageToken).toBe("token123");
    });
  });

  describe("getSpace", () => {
    it("should get a space by name", async () => {
      mockSpacesGet.mockResolvedValue({
        data: {
          name: "spaces/AAAAA",
          displayName: "General",
          type: "ROOM",
          threaded: true,
        },
      });

      const result = await service.getSpace("spaces/AAAAA");

      expect(result.name).toBe("spaces/AAAAA");
      expect(result.displayName).toBe("General");
      expect(result.threaded).toBe(true);
    });
  });

  describe("createSpace", () => {
    it("should create a space", async () => {
      mockSpacesCreate.mockResolvedValue({
        data: {
          name: "spaces/CCCCC",
          displayName: "New Space",
          type: "SPACE",
        },
      });

      const result = await service.createSpace({ displayName: "New Space" });

      expect(result.name).toBe("spaces/CCCCC");
      expect(result.displayName).toBe("New Space");
      expect(mockSpacesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            displayName: "New Space",
            spaceType: "SPACE",
          }),
        })
      );
    });

    it("should create space with details", async () => {
      mockSpacesCreate.mockResolvedValue({
        data: {
          name: "spaces/DDDDD",
          displayName: "Team Chat",
          type: "SPACE",
          spaceDetails: {
            description: "Team discussions",
            guidelines: "Be nice",
          },
        },
      });

      await service.createSpace({
        displayName: "Team Chat",
        spaceDetails: {
          description: "Team discussions",
          guidelines: "Be nice",
        },
      });

      expect(mockSpacesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            displayName: "Team Chat",
            spaceDetails: {
              description: "Team discussions",
              guidelines: "Be nice",
            },
          }),
        })
      );
    });
  });

  describe("updateSpace", () => {
    it("should update a space", async () => {
      mockSpacesPatch.mockResolvedValue({
        data: {
          name: "spaces/AAAAA",
          displayName: "Updated Name",
        },
      });

      const result = await service.updateSpace("spaces/AAAAA", {
        displayName: "Updated Name",
      });

      expect(result.displayName).toBe("Updated Name");
    });
  });

  describe("deleteSpace", () => {
    it("should delete a space", async () => {
      mockSpacesDelete.mockResolvedValue({});

      await service.deleteSpace("spaces/AAAAA");

      expect(mockSpacesDelete).toHaveBeenCalledWith({ name: "spaces/AAAAA" });
    });
  });

  describe("findDirectMessage", () => {
    it("should find direct message", async () => {
      mockSpacesFindDirectMessage.mockResolvedValue({
        data: {
          name: "spaces/DMXYZ",
          type: "DM",
        },
      });

      const result = await service.findDirectMessage("users/123");

      expect(result?.name).toBe("spaces/DMXYZ");
    });

    it("should return null if not found", async () => {
      mockSpacesFindDirectMessage.mockResolvedValue({ data: {} });

      const result = await service.findDirectMessage("users/999");

      expect(result).toBeNull();
    });
  });

  describe("listMessages", () => {
    it("should list messages", async () => {
      mockMessagesList.mockResolvedValue({
        data: {
          messages: [
            { name: "spaces/AAAAA/messages/111", text: "Hello" },
            { name: "spaces/AAAAA/messages/222", text: "World" },
          ],
        },
      });

      const result = await service.listMessages("spaces/AAAAA");

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].text).toBe("Hello");
    });
  });

  describe("getMessage", () => {
    it("should get a message", async () => {
      mockMessagesGet.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/messages/111",
          text: "Hello World",
          sender: { name: "users/123", displayName: "John" },
        },
      });

      const result = await service.getMessage("spaces/AAAAA/messages/111");

      expect(result.name).toBe("spaces/AAAAA/messages/111");
      expect(result.text).toBe("Hello World");
      expect(result.sender?.displayName).toBe("John");
    });
  });

  describe("sendMessage", () => {
    it("should send a message", async () => {
      mockMessagesCreate.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/messages/333",
          text: "New message",
        },
      });

      const result = await service.sendMessage({
        spaceName: "spaces/AAAAA",
        text: "New message",
      });

      expect(result.name).toBe("spaces/AAAAA/messages/333");
      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          parent: "spaces/AAAAA",
          requestBody: expect.objectContaining({
            text: "New message",
          }),
        })
      );
    });

    it("should send threaded message", async () => {
      mockMessagesCreate.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/messages/444",
          text: "Reply",
          thread: { threadKey: "thread123" },
        },
      });

      await service.sendMessage({
        spaceName: "spaces/AAAAA",
        text: "Reply",
        threadKey: "thread123",
      });

      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            thread: { threadKey: "thread123" },
          }),
        })
      );
    });
  });

  describe("updateMessage", () => {
    it("should update a message", async () => {
      mockMessagesPatch.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/messages/111",
          text: "Updated text",
        },
      });

      const result = await service.updateMessage({
        messageName: "spaces/AAAAA/messages/111",
        text: "Updated text",
      });

      expect(result.text).toBe("Updated text");
    });
  });

  describe("deleteMessage", () => {
    it("should delete a message", async () => {
      mockMessagesDelete.mockResolvedValue({});

      await service.deleteMessage("spaces/AAAAA/messages/111");

      expect(mockMessagesDelete).toHaveBeenCalledWith({
        name: "spaces/AAAAA/messages/111",
        force: false,
      });
    });

    it("should force delete a message", async () => {
      mockMessagesDelete.mockResolvedValue({});

      await service.deleteMessage("spaces/AAAAA/messages/111", true);

      expect(mockMessagesDelete).toHaveBeenCalledWith({
        name: "spaces/AAAAA/messages/111",
        force: true,
      });
    });
  });

  describe("addReaction", () => {
    it("should add a reaction", async () => {
      mockReactionsCreate.mockResolvedValue({});

      await service.addReaction("spaces/AAAAA/messages/111", "👍");

      expect(mockReactionsCreate).toHaveBeenCalledWith({
        parent: "spaces/AAAAA/messages/111",
        requestBody: {
          emoji: { unicode: "👍" },
        },
      });
    });
  });

  describe("removeReaction", () => {
    it("should remove a reaction", async () => {
      mockReactionsDelete.mockResolvedValue({});

      await service.removeReaction("spaces/AAAAA/messages/111/reactions/R1");

      expect(mockReactionsDelete).toHaveBeenCalledWith({
        name: "spaces/AAAAA/messages/111/reactions/R1",
      });
    });
  });

  describe("listReactions", () => {
    it("should list reactions", async () => {
      mockReactionsList.mockResolvedValue({
        data: {
          reactions: [
            {
              name: "spaces/AAAAA/messages/111/reactions/R1",
              emoji: { unicode: "👍" },
              user: { name: "users/123", displayName: "John" },
            },
          ],
        },
      });

      const result = await service.listReactions("spaces/AAAAA/messages/111");

      expect(result.reactions).toHaveLength(1);
      expect(result.reactions[0].emoji?.unicode).toBe("👍");
    });
  });

  describe("listMembers", () => {
    it("should list members", async () => {
      mockMembersList.mockResolvedValue({
        data: {
          memberships: [
            {
              name: "spaces/AAAAA/members/123",
              member: { name: "users/123", displayName: "John" },
              role: "ROLE_MEMBER",
            },
          ],
        },
      });

      const result = await service.listMembers("spaces/AAAAA");

      expect(result.members).toHaveLength(1);
      expect(result.members[0].member?.displayName).toBe("John");
    });
  });

  describe("getMember", () => {
    it("should get a member", async () => {
      mockMembersGet.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/members/123",
          member: { name: "users/123", displayName: "John" },
          role: "ROLE_MANAGER",
        },
      });

      const result = await service.getMember("spaces/AAAAA/members/123");

      expect(result.member?.displayName).toBe("John");
      expect(result.role).toBe("ROLE_MANAGER");
    });
  });

  describe("addMember", () => {
    it("should add a member", async () => {
      mockMembersCreate.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/members/456",
          member: { name: "users/456", displayName: "Jane" },
          role: "ROLE_MEMBER",
        },
      });

      const result = await service.addMember("spaces/AAAAA", "users/456");

      expect(result.member?.displayName).toBe("Jane");
    });

    it("should add member with role", async () => {
      mockMembersCreate.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/members/456",
          role: "ROLE_MANAGER",
        },
      });

      await service.addMember("spaces/AAAAA", "users/456", "ROLE_MANAGER");

      expect(mockMembersCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            role: "ROLE_MANAGER",
          }),
        })
      );
    });
  });

  describe("updateMemberRole", () => {
    it("should update member role", async () => {
      mockMembersPatch.mockResolvedValue({
        data: {
          name: "spaces/AAAAA/members/123",
          role: "ROLE_MANAGER",
        },
      });

      const result = await service.updateMemberRole(
        "spaces/AAAAA/members/123",
        "ROLE_MANAGER"
      );

      expect(result.role).toBe("ROLE_MANAGER");
    });
  });

  describe("removeMember", () => {
    it("should remove a member", async () => {
      mockMembersDelete.mockResolvedValue({});

      await service.removeMember("spaces/AAAAA/members/123");

      expect(mockMembersDelete).toHaveBeenCalledWith({
        name: "spaces/AAAAA/members/123",
      });
    });
  });
});

