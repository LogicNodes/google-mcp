import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Auth } from "googleapis";

// Mock googleapis
const mockFormsCreate = vi.fn();
const mockFormsGet = vi.fn();
const mockFormsBatchUpdate = vi.fn();
const mockResponsesList = vi.fn();
const mockResponsesGet = vi.fn();

vi.mock("googleapis", () => ({
  google: {
    forms: vi.fn(() => ({
      forms: {
        create: mockFormsCreate,
        get: mockFormsGet,
        batchUpdate: mockFormsBatchUpdate,
        responses: {
          list: mockResponsesList,
          get: mockResponsesGet,
        },
      },
    })),
  },
}));

import { FormsService } from "../services/forms.js";

describe("FormsService", () => {
  let service: FormsService;
  const mockAuthClient = {} as Auth.OAuth2Client;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FormsService(mockAuthClient);
  });

  describe("createForm", () => {
    it("should create a new form", async () => {
      mockFormsCreate.mockResolvedValue({
        data: {
          formId: "form123",
          info: { title: "Test Form", documentTitle: "Test Form" },
          responderUri: "https://docs.google.com/forms/d/form123/viewform",
        },
      });

      const result = await service.createForm({ title: "Test Form" });

      expect(result.formId).toBe("form123");
      expect(result.title).toBe("Test Form");
      expect(mockFormsCreate).toHaveBeenCalled();
    });

    it("should create form with description", async () => {
      mockFormsCreate.mockResolvedValue({
        data: {
          formId: "form123",
          info: { title: "Survey" },
        },
      });
      mockFormsBatchUpdate.mockResolvedValue({ data: {} });

      await service.createForm({
        title: "Survey",
        description: "A customer survey",
      });

      expect(mockFormsBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: "form123",
          requestBody: expect.objectContaining({
            requests: expect.arrayContaining([
              expect.objectContaining({
                updateFormInfo: expect.objectContaining({
                  info: { description: "A customer survey" },
                }),
              }),
            ]),
          }),
        })
      );
    });
  });

  describe("getForm", () => {
    it("should get form by ID", async () => {
      mockFormsGet.mockResolvedValue({
        data: {
          formId: "form123",
          info: { title: "My Form", description: "Description" },
          items: [
            {
              itemId: "item1",
              title: "Question 1",
              questionItem: {
                question: { questionId: "q1", required: true },
              },
            },
          ],
        },
      });

      const result = await service.getForm("form123");

      expect(result.formId).toBe("form123");
      expect(result.title).toBe("My Form");
      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe("Question 1");
    });
  });

  describe("updateFormInfo", () => {
    it("should update form title", async () => {
      mockFormsBatchUpdate.mockResolvedValue({ data: {} });
      mockFormsGet.mockResolvedValue({
        data: {
          formId: "form123",
          info: { title: "Updated Title" },
          items: [],
        },
      });

      const result = await service.updateFormInfo("form123", {
        title: "Updated Title",
      });

      expect(mockFormsBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: "form123",
        })
      );
      expect(result.title).toBe("Updated Title");
    });
  });

  describe("addQuestion", () => {
    it("should add a short answer question", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "item123" } }],
        },
      });

      const result = await service.addQuestion({
        formId: "form123",
        title: "What is your name?",
        questionType: "short_answer",
        required: true,
      });

      expect(result.itemId).toBe("item123");
      expect(mockFormsBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: "form123",
          requestBody: expect.objectContaining({
            requests: expect.arrayContaining([
              expect.objectContaining({
                createItem: expect.objectContaining({
                  item: expect.objectContaining({
                    title: "What is your name?",
                  }),
                }),
              }),
            ]),
          }),
        })
      );
    });

    it("should add a multiple choice question", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "item456" } }],
        },
      });

      await service.addQuestion({
        formId: "form123",
        title: "Pick a color",
        questionType: "multiple_choice",
        options: ["Red", "Green", "Blue"],
      });

      expect(mockFormsBatchUpdate).toHaveBeenCalled();
    });

    it("should add a linear scale question", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "item789" } }],
        },
      });

      await service.addQuestion({
        formId: "form123",
        title: "Rate this",
        questionType: "linear_scale",
        scaleConfig: {
          low: 1,
          high: 5,
          lowLabel: "Poor",
          highLabel: "Excellent",
        },
      });

      expect(mockFormsBatchUpdate).toHaveBeenCalled();
    });
  });

  describe("deleteItem", () => {
    it("should delete an item", async () => {
      mockFormsBatchUpdate.mockResolvedValue({ data: {} });

      await service.deleteItem("form123", 0);

      expect(mockFormsBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: "form123",
          requestBody: expect.objectContaining({
            requests: expect.arrayContaining([
              expect.objectContaining({
                deleteItem: { location: { index: 0 } },
              }),
            ]),
          }),
        })
      );
    });
  });

  describe("moveItem", () => {
    it("should move an item", async () => {
      mockFormsBatchUpdate.mockResolvedValue({ data: {} });

      await service.moveItem("form123", 0, 2);

      expect(mockFormsBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: "form123",
          requestBody: expect.objectContaining({
            requests: expect.arrayContaining([
              expect.objectContaining({
                moveItem: {
                  originalLocation: { index: 0 },
                  newLocation: { index: 2 },
                },
              }),
            ]),
          }),
        })
      );
    });
  });

  describe("listResponses", () => {
    it("should list form responses", async () => {
      mockResponsesList.mockResolvedValue({
        data: {
          responses: [
            {
              responseId: "resp1",
              createTime: "2024-01-20T10:00:00Z",
              lastSubmittedTime: "2024-01-20T10:05:00Z",
              answers: {
                q1: { questionId: "q1", textAnswers: { answers: [{ value: "John" }] } },
              },
            },
          ],
          nextPageToken: "token123",
        },
      });

      const result = await service.listResponses("form123");

      expect(result.responses).toHaveLength(1);
      expect(result.responses[0].responseId).toBe("resp1");
      expect(result.nextPageToken).toBe("token123");
    });
  });

  describe("getResponse", () => {
    it("should get a specific response", async () => {
      mockResponsesGet.mockResolvedValue({
        data: {
          responseId: "resp1",
          createTime: "2024-01-20T10:00:00Z",
          lastSubmittedTime: "2024-01-20T10:05:00Z",
          respondentEmail: "user@example.com",
          answers: {},
        },
      });

      const result = await service.getResponse("form123", "resp1");

      expect(result.responseId).toBe("resp1");
      expect(result.respondentEmail).toBe("user@example.com");
    });
  });

  describe("addPageBreak", () => {
    it("should add a page break", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "page1" } }],
        },
      });

      const result = await service.addPageBreak("form123", "Section 2");

      expect(result.itemId).toBe("page1");
      expect(result.title).toBe("Section 2");
    });
  });

  describe("addTextItem", () => {
    it("should add a text item", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "text1" } }],
        },
      });

      const result = await service.addTextItem(
        "form123",
        "Instructions",
        "Please read carefully"
      );

      expect(result.itemId).toBe("text1");
      expect(result.title).toBe("Instructions");
    });
  });

  describe("addImage", () => {
    it("should add an image", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "img1" } }],
        },
      });

      const result = await service.addImage("form123", "https://example.com/image.png", {
        title: "Logo",
        altText: "Company logo",
      });

      expect(result.itemId).toBe("img1");
      expect(result.imageItem?.sourceUri).toBe("https://example.com/image.png");
    });
  });

  describe("addVideo", () => {
    it("should add a YouTube video", async () => {
      mockFormsBatchUpdate.mockResolvedValue({
        data: {
          replies: [{ createItem: { itemId: "vid1" } }],
        },
      });

      const result = await service.addVideo(
        "form123",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        { title: "Tutorial" }
      );

      expect(result.itemId).toBe("vid1");
      expect(result.videoItem?.youtubeUri).toBe("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    });
  });

  describe("updateSettings", () => {
    it("should update form settings", async () => {
      mockFormsBatchUpdate.mockResolvedValue({ data: {} });

      await service.updateSettings("form123", { quizMode: true });

      expect(mockFormsBatchUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: "form123",
          requestBody: expect.objectContaining({
            requests: expect.arrayContaining([
              expect.objectContaining({
                updateSettings: expect.objectContaining({
                  settings: { quizSettings: { isQuiz: true } },
                }),
              }),
            ]),
          }),
        })
      );
    });
  });
});

