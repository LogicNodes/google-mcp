import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Auth } from "googleapis";

// Mock googleapis
const mockSpacesCreate = vi.fn();
const mockSpacesGet = vi.fn();
const mockSpacesPatch = vi.fn();
const mockSpacesEndActiveConference = vi.fn();
const mockConferenceRecordsList = vi.fn();
const mockConferenceRecordsGet = vi.fn();
const mockParticipantsList = vi.fn();
const mockParticipantsGet = vi.fn();
const mockParticipantSessionsList = vi.fn();
const mockRecordingsList = vi.fn();
const mockRecordingsGet = vi.fn();
const mockTranscriptsList = vi.fn();
const mockTranscriptsGet = vi.fn();
const mockTranscriptEntriesList = vi.fn();
const mockCalendarEventsInsert = vi.fn();
const mockCalendarEventsGet = vi.fn();
const mockCalendarEventsList = vi.fn();

vi.mock("googleapis", () => ({
  google: {
    meet: vi.fn(() => ({
      spaces: {
        create: mockSpacesCreate,
        get: mockSpacesGet,
        patch: mockSpacesPatch,
        endActiveConference: mockSpacesEndActiveConference,
      },
      conferenceRecords: {
        list: mockConferenceRecordsList,
        get: mockConferenceRecordsGet,
        participants: {
          list: mockParticipantsList,
          get: mockParticipantsGet,
          participantSessions: {
            list: mockParticipantSessionsList,
          },
        },
        recordings: {
          list: mockRecordingsList,
          get: mockRecordingsGet,
        },
        transcripts: {
          list: mockTranscriptsList,
          get: mockTranscriptsGet,
          entries: {
            list: mockTranscriptEntriesList,
          },
        },
      },
    })),
    calendar: vi.fn(() => ({
      events: {
        insert: mockCalendarEventsInsert,
        get: mockCalendarEventsGet,
        list: mockCalendarEventsList,
      },
    })),
  },
}));

import { MeetService } from "../services/meet.js";

describe("MeetService", () => {
  let service: MeetService;
  const mockAuthClient = {} as Auth.OAuth2Client;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MeetService(mockAuthClient);
  });

  describe("createSpace", () => {
    it("should create a meeting space", async () => {
      mockSpacesCreate.mockResolvedValue({
        data: {
          name: "spaces/abc123",
          meetingUri: "https://meet.google.com/abc-defg-hij",
          meetingCode: "abc-defg-hij",
        },
      });

      const result = await service.createSpace();

      expect(result.name).toBe("spaces/abc123");
      expect(result.meetingUri).toBe("https://meet.google.com/abc-defg-hij");
      expect(result.meetingCode).toBe("abc-defg-hij");
    });

    it("should create space with config", async () => {
      mockSpacesCreate.mockResolvedValue({
        data: {
          name: "spaces/xyz789",
          config: { accessType: "RESTRICTED" },
        },
      });

      const result = await service.createSpace({ accessType: "RESTRICTED" });

      expect(result.config?.accessType).toBe("RESTRICTED");
    });
  });

  describe("getSpace", () => {
    it("should get a meeting space", async () => {
      mockSpacesGet.mockResolvedValue({
        data: {
          name: "spaces/abc123",
          meetingUri: "https://meet.google.com/abc-defg-hij",
          activeConference: { conferenceRecord: "conferenceRecords/conf123" },
        },
      });

      const result = await service.getSpace("spaces/abc123");

      expect(result.name).toBe("spaces/abc123");
      expect(result.activeConference?.conferenceRecord).toBe("conferenceRecords/conf123");
    });
  });

  describe("updateSpace", () => {
    it("should update space config", async () => {
      mockSpacesPatch.mockResolvedValue({
        data: {
          name: "spaces/abc123",
          config: { accessType: "TRUSTED" },
        },
      });

      const result = await service.updateSpace("spaces/abc123", {
        accessType: "TRUSTED",
      });

      expect(result.config?.accessType).toBe("TRUSTED");
    });
  });

  describe("endActiveConference", () => {
    it("should end active conference", async () => {
      mockSpacesEndActiveConference.mockResolvedValue({});

      await service.endActiveConference("spaces/abc123");

      expect(mockSpacesEndActiveConference).toHaveBeenCalledWith({
        name: "spaces/abc123",
      });
    });
  });

  describe("listConferenceRecords", () => {
    it("should list conference records", async () => {
      mockConferenceRecordsList.mockResolvedValue({
        data: {
          conferenceRecords: [
            {
              name: "conferenceRecords/conf123",
              startTime: "2024-01-20T10:00:00Z",
              endTime: "2024-01-20T11:00:00Z",
              space: "spaces/abc123",
            },
          ],
          nextPageToken: "token456",
        },
      });

      const result = await service.listConferenceRecords();

      expect(result.conferenceRecords).toHaveLength(1);
      expect(result.conferenceRecords[0].name).toBe("conferenceRecords/conf123");
      expect(result.nextPageToken).toBe("token456");
    });
  });

  describe("getConferenceRecord", () => {
    it("should get a conference record", async () => {
      mockConferenceRecordsGet.mockResolvedValue({
        data: {
          name: "conferenceRecords/conf123",
          startTime: "2024-01-20T10:00:00Z",
          endTime: "2024-01-20T11:00:00Z",
        },
      });

      const result = await service.getConferenceRecord("conferenceRecords/conf123");

      expect(result.name).toBe("conferenceRecords/conf123");
      expect(result.startTime).toBe("2024-01-20T10:00:00Z");
    });
  });

  describe("listParticipants", () => {
    it("should list participants", async () => {
      mockParticipantsList.mockResolvedValue({
        data: {
          participants: [
            {
              name: "conferenceRecords/conf123/participants/p1",
              signedinUser: { user: "users/123", displayName: "John" },
            },
            {
              name: "conferenceRecords/conf123/participants/p2",
              anonymousUser: { displayName: "Guest" },
            },
          ],
        },
      });

      const result = await service.listParticipants("conferenceRecords/conf123");

      expect(result.participants).toHaveLength(2);
      expect(result.participants[0].signedinUser?.displayName).toBe("John");
      expect(result.participants[1].anonymousUser?.displayName).toBe("Guest");
    });
  });

  describe("getParticipant", () => {
    it("should get a participant", async () => {
      mockParticipantsGet.mockResolvedValue({
        data: {
          name: "conferenceRecords/conf123/participants/p1",
          signedinUser: { user: "users/123", displayName: "John" },
          earliestStartTime: "2024-01-20T10:00:00Z",
          latestEndTime: "2024-01-20T11:00:00Z",
        },
      });

      const result = await service.getParticipant(
        "conferenceRecords/conf123/participants/p1"
      );

      expect(result.signedinUser?.displayName).toBe("John");
    });
  });

  describe("listParticipantSessions", () => {
    it("should list participant sessions", async () => {
      mockParticipantSessionsList.mockResolvedValue({
        data: {
          participantSessions: [
            {
              name: "conferenceRecords/conf123/participants/p1/participantSessions/s1",
              startTime: "2024-01-20T10:00:00Z",
              endTime: "2024-01-20T10:30:00Z",
            },
          ],
        },
      });

      const result = await service.listParticipantSessions(
        "conferenceRecords/conf123/participants/p1"
      );

      expect(result.participantSessions).toHaveLength(1);
    });
  });

  describe("listRecordings", () => {
    it("should list recordings", async () => {
      mockRecordingsList.mockResolvedValue({
        data: {
          recordings: [
            {
              name: "conferenceRecords/conf123/recordings/rec1",
              state: "FILE_GENERATED",
              driveDestination: {
                file: "files/file123",
                exportUri: "https://drive.google.com/file/d/file123",
              },
            },
          ],
        },
      });

      const result = await service.listRecordings("conferenceRecords/conf123");

      expect(result.recordings).toHaveLength(1);
      expect(result.recordings[0].state).toBe("FILE_GENERATED");
    });
  });

  describe("getRecording", () => {
    it("should get a recording", async () => {
      mockRecordingsGet.mockResolvedValue({
        data: {
          name: "conferenceRecords/conf123/recordings/rec1",
          state: "FILE_GENERATED",
          startTime: "2024-01-20T10:00:00Z",
          endTime: "2024-01-20T11:00:00Z",
        },
      });

      const result = await service.getRecording(
        "conferenceRecords/conf123/recordings/rec1"
      );

      expect(result.state).toBe("FILE_GENERATED");
    });
  });

  describe("listTranscripts", () => {
    it("should list transcripts", async () => {
      mockTranscriptsList.mockResolvedValue({
        data: {
          transcripts: [
            {
              name: "conferenceRecords/conf123/transcripts/t1",
              state: "FILE_GENERATED",
              docsDestination: {
                document: "documents/doc123",
                exportUri: "https://docs.google.com/document/d/doc123",
              },
            },
          ],
        },
      });

      const result = await service.listTranscripts("conferenceRecords/conf123");

      expect(result.transcripts).toHaveLength(1);
      expect(result.transcripts[0].state).toBe("FILE_GENERATED");
    });
  });

  describe("getTranscript", () => {
    it("should get a transcript", async () => {
      mockTranscriptsGet.mockResolvedValue({
        data: {
          name: "conferenceRecords/conf123/transcripts/t1",
          state: "FILE_GENERATED",
        },
      });

      const result = await service.getTranscript(
        "conferenceRecords/conf123/transcripts/t1"
      );

      expect(result.state).toBe("FILE_GENERATED");
    });
  });

  describe("listTranscriptEntries", () => {
    it("should list transcript entries", async () => {
      mockTranscriptEntriesList.mockResolvedValue({
        data: {
          transcriptEntries: [
            {
              name: "conferenceRecords/conf123/transcripts/t1/entries/e1",
              participant: "conferenceRecords/conf123/participants/p1",
              text: "Hello everyone",
              startTime: "2024-01-20T10:01:00Z",
            },
          ],
        },
      });

      const result = await service.listTranscriptEntries(
        "conferenceRecords/conf123/transcripts/t1"
      );

      expect(result.transcriptEntries).toHaveLength(1);
      expect(result.transcriptEntries[0].text).toBe("Hello everyone");
    });
  });

  describe("scheduleMeeting", () => {
    it("should schedule a meeting", async () => {
      mockCalendarEventsInsert.mockResolvedValue({
        data: {
          id: "event123",
          htmlLink: "https://calendar.google.com/event?eid=event123",
          conferenceData: {
            conferenceId: "abc-defg-hij",
            entryPoints: [
              { entryPointType: "video", uri: "https://meet.google.com/abc-defg-hij" },
            ],
          },
        },
      });

      const result = await service.scheduleMeeting({
        summary: "Team Meeting",
        startTime: "2024-01-20T10:00:00Z",
        endTime: "2024-01-20T11:00:00Z",
      });

      expect(result.eventId).toBe("event123");
      expect(result.meetLink).toBe("https://meet.google.com/abc-defg-hij");
      expect(result.meetingCode).toBe("abc-defg-hij");
    });

    it("should schedule meeting with attendees", async () => {
      mockCalendarEventsInsert.mockResolvedValue({
        data: {
          id: "event456",
          htmlLink: "https://calendar.google.com/event",
          hangoutLink: "https://meet.google.com/xyz-abcd-efg",
        },
      });

      await service.scheduleMeeting({
        summary: "Project Review",
        startTime: "2024-01-20T14:00:00Z",
        endTime: "2024-01-20T15:00:00Z",
        attendees: ["user1@example.com", "user2@example.com"],
        sendUpdates: "all",
      });

      expect(mockCalendarEventsInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            summary: "Project Review",
            attendees: [{ email: "user1@example.com" }, { email: "user2@example.com" }],
          }),
          sendUpdates: "all",
        })
      );
    });
  });

  describe("createInstantMeeting", () => {
    it("should create an instant meeting", async () => {
      mockCalendarEventsInsert.mockResolvedValue({
        data: {
          id: "instant123",
          htmlLink: "https://calendar.google.com/event",
          hangoutLink: "https://meet.google.com/now-meet-now",
        },
      });

      const result = await service.createInstantMeeting();

      expect(result.eventId).toBe("instant123");
      expect(result.meetLink).toBe("https://meet.google.com/now-meet-now");
    });
  });

  describe("getMeetingByCalendarEvent", () => {
    it("should get meeting from calendar event", async () => {
      mockCalendarEventsGet.mockResolvedValue({
        data: {
          id: "event123",
          summary: "Team Sync",
          conferenceData: {
            conferenceId: "abc-defg-hij",
            entryPoints: [
              { entryPointType: "video", uri: "https://meet.google.com/abc-defg-hij" },
            ],
          },
          start: { dateTime: "2024-01-20T10:00:00Z" },
          end: { dateTime: "2024-01-20T11:00:00Z" },
          attendees: [{ email: "user@example.com", responseStatus: "accepted" }],
        },
      });

      const result = await service.getMeetingByCalendarEvent("event123");

      expect(result.eventId).toBe("event123");
      expect(result.summary).toBe("Team Sync");
      expect(result.meetLink).toBe("https://meet.google.com/abc-defg-hij");
      expect(result.attendees).toHaveLength(1);
    });
  });

  describe("listUpcomingMeetings", () => {
    it("should list upcoming meetings", async () => {
      mockCalendarEventsList.mockResolvedValue({
        data: {
          items: [
            {
              id: "event1",
              summary: "Meeting 1",
              hangoutLink: "https://meet.google.com/meet1",
              start: { dateTime: "2024-01-21T10:00:00Z" },
              end: { dateTime: "2024-01-21T11:00:00Z" },
            },
            {
              id: "event2",
              summary: "Meeting 2",
              conferenceData: {
                entryPoints: [
                  { entryPointType: "video", uri: "https://meet.google.com/meet2" },
                ],
              },
              start: { dateTime: "2024-01-22T14:00:00Z" },
              end: { dateTime: "2024-01-22T15:00:00Z" },
            },
            {
              id: "event3",
              summary: "No Meet Event",
              start: { dateTime: "2024-01-23T09:00:00Z" },
              end: { dateTime: "2024-01-23T10:00:00Z" },
            },
          ],
        },
      });

      const result = await service.listUpcomingMeetings(7);

      // Should filter out events without Meet links
      expect(result).toHaveLength(2);
      expect(result[0].meetLink).toBe("https://meet.google.com/meet1");
      expect(result[1].meetLink).toBe("https://meet.google.com/meet2");
    });
  });
});

