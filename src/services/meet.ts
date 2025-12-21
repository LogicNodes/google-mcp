import { google, type Auth } from "googleapis";
import type { calendar_v3 } from "googleapis";

// Note: Google Meet API v2 is relatively new. We'll use a combination of
// the Calendar API (for scheduling meetings with Meet) and the Meet REST API
// for managing meeting artifacts.

export interface MeetingSpace {
  name: string;
  meetingUri?: string;
  meetingCode?: string;
  config?: MeetingConfig;
  activeConference?: ActiveConference;
}

export interface MeetingConfig {
  accessType?: "ACCESS_TYPE_UNSPECIFIED" | "OPEN" | "TRUSTED" | "RESTRICTED";
  entryPointAccess?: "ENTRY_POINT_ACCESS_UNSPECIFIED" | "ALL" | "CREATOR_APP_ONLY";
}

export interface ActiveConference {
  conferenceRecord?: string;
}

export interface ConferenceRecord {
  name: string;
  startTime?: string;
  endTime?: string;
  expireTime?: string;
  space?: string;
}

export interface Participant {
  name: string;
  earliestStartTime?: string;
  latestEndTime?: string;
  signedinUser?: {
    user?: string;
    displayName?: string;
  };
  anonymousUser?: {
    displayName?: string;
  };
  phoneUser?: {
    displayName?: string;
  };
}

export interface ParticipantSession {
  name: string;
  startTime?: string;
  endTime?: string;
}

export interface Recording {
  name: string;
  state?: "STATE_UNSPECIFIED" | "STARTED" | "ENDED" | "FILE_GENERATED";
  startTime?: string;
  endTime?: string;
  driveDestination?: {
    file?: string;
    exportUri?: string;
  };
}

export interface Transcript {
  name: string;
  state?: "STATE_UNSPECIFIED" | "STARTED" | "ENDED" | "FILE_GENERATED";
  startTime?: string;
  endTime?: string;
  docsDestination?: {
    document?: string;
    exportUri?: string;
  };
}

export interface TranscriptEntry {
  name: string;
  participant?: string;
  text?: string;
  languageCode?: string;
  startTime?: string;
  endTime?: string;
}

export interface ScheduleMeetingOptions {
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  timeZone?: string;
  sendUpdates?: "all" | "externalOnly" | "none";
  recurrence?: string[];
}

export interface CreateSpaceOptions {
  accessType?: "OPEN" | "TRUSTED" | "RESTRICTED";
  entryPointAccess?: "ALL" | "CREATOR_APP_ONLY";
}

export class MeetService {
  private readonly calendar: calendar_v3.Calendar;
  // The Meet API client - googleapis types may not be complete for meet_v2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly meet: any;

  constructor(authClient: Auth.OAuth2Client) {
    this.calendar = google.calendar({ version: "v3", auth: authClient });
    // Note: Google Meet REST API v2 may require explicit enabling
    this.meet = google.meet({ version: "v2", auth: authClient });
  }

  // Meeting Space Operations (via Meet API)

  public async createSpace(options: CreateSpaceOptions = {}): Promise<MeetingSpace> {
    const response = await this.meet.spaces.create({
      requestBody: {
        config: {
          accessType: options.accessType,
          entryPointAccess: options.entryPointAccess,
        },
      },
    });

    return this.formatSpace(response.data);
  }

  public async getSpace(spaceName: string): Promise<MeetingSpace> {
    const response = await this.meet.spaces.get({
      name: spaceName,
    });

    return this.formatSpace(response.data);
  }

  public async updateSpace(
    spaceName: string,
    config: MeetingConfig
  ): Promise<MeetingSpace> {
    const updateMask: string[] = [];

    if (config.accessType !== undefined) {
      updateMask.push("config.accessType");
    }
    if (config.entryPointAccess !== undefined) {
      updateMask.push("config.entryPointAccess");
    }

    const response = await this.meet.spaces.patch({
      name: spaceName,
      updateMask: updateMask.join(","),
      requestBody: {
        config,
      },
    });

    return this.formatSpace(response.data);
  }

  public async endActiveConference(spaceName: string): Promise<void> {
    await this.meet.spaces.endActiveConference({
      name: spaceName,
    });
  }

  // Conference Records Operations

  public async listConferenceRecords(
    options: {
      pageSize?: number;
      pageToken?: string;
      filter?: string;
    } = {}
  ): Promise<{ conferenceRecords: ConferenceRecord[]; nextPageToken?: string }> {
    const response = await this.meet.conferenceRecords.list({
      pageSize: options.pageSize || 50,
      pageToken: options.pageToken,
      filter: options.filter,
    });

    const conferenceRecords = (response.data.conferenceRecords || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (record: any) => this.formatConferenceRecord(record)
    );

    return {
      conferenceRecords,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getConferenceRecord(recordName: string): Promise<ConferenceRecord> {
    const response = await this.meet.conferenceRecords.get({
      name: recordName,
    });

    return this.formatConferenceRecord(response.data);
  }

  // Participant Operations

  public async listParticipants(
    conferenceRecordName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
      filter?: string;
    } = {}
  ): Promise<{ participants: Participant[]; nextPageToken?: string }> {
    const response = await this.meet.conferenceRecords.participants.list({
      parent: conferenceRecordName,
      pageSize: options.pageSize || 100,
      pageToken: options.pageToken,
      filter: options.filter,
    });

    const participants = (response.data.participants || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (participant: any) => this.formatParticipant(participant)
    );

    return {
      participants,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getParticipant(participantName: string): Promise<Participant> {
    const response = await this.meet.conferenceRecords.participants.get({
      name: participantName,
    });

    return this.formatParticipant(response.data);
  }

  public async listParticipantSessions(
    participantName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
      filter?: string;
    } = {}
  ): Promise<{ participantSessions: ParticipantSession[]; nextPageToken?: string }> {
    const response = await this.meet.conferenceRecords.participants.participantSessions.list({
      parent: participantName,
      pageSize: options.pageSize || 100,
      pageToken: options.pageToken,
      filter: options.filter,
    });

    const participantSessions = (response.data.participantSessions || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session: any) => ({
        name: session.name || "",
        startTime: session.startTime || undefined,
        endTime: session.endTime || undefined,
      })
    );

    return {
      participantSessions,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  // Recording Operations

  public async listRecordings(
    conferenceRecordName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
    } = {}
  ): Promise<{ recordings: Recording[]; nextPageToken?: string }> {
    const response = await this.meet.conferenceRecords.recordings.list({
      parent: conferenceRecordName,
      pageSize: options.pageSize || 50,
      pageToken: options.pageToken,
    });

    const recordings = (response.data.recordings || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (recording: any) => this.formatRecording(recording)
    );

    return {
      recordings,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getRecording(recordingName: string): Promise<Recording> {
    const response = await this.meet.conferenceRecords.recordings.get({
      name: recordingName,
    });

    return this.formatRecording(response.data);
  }

  // Transcript Operations

  public async listTranscripts(
    conferenceRecordName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
    } = {}
  ): Promise<{ transcripts: Transcript[]; nextPageToken?: string }> {
    const response = await this.meet.conferenceRecords.transcripts.list({
      parent: conferenceRecordName,
      pageSize: options.pageSize || 50,
      pageToken: options.pageToken,
    });

    const transcripts = (response.data.transcripts || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (transcript: any) => this.formatTranscript(transcript)
    );

    return {
      transcripts,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  public async getTranscript(transcriptName: string): Promise<Transcript> {
    const response = await this.meet.conferenceRecords.transcripts.get({
      name: transcriptName,
    });

    return this.formatTranscript(response.data);
  }

  public async listTranscriptEntries(
    transcriptName: string,
    options: {
      pageSize?: number;
      pageToken?: string;
    } = {}
  ): Promise<{ transcriptEntries: TranscriptEntry[]; nextPageToken?: string }> {
    const response = await this.meet.conferenceRecords.transcripts.entries.list({
      parent: transcriptName,
      pageSize: options.pageSize || 100,
      pageToken: options.pageToken,
    });

    const transcriptEntries = (response.data.transcriptEntries || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entry: any) => ({
        name: entry.name || "",
        participant: entry.participant || undefined,
        text: entry.text || undefined,
        languageCode: entry.languageCode || undefined,
        startTime: entry.startTime || undefined,
        endTime: entry.endTime || undefined,
      })
    );

    return {
      transcriptEntries,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  }

  // Calendar Integration - Schedule a meeting with Google Meet

  public async scheduleMeeting(options: ScheduleMeetingOptions): Promise<{
    eventId: string;
    htmlLink: string;
    meetLink?: string;
    meetingCode?: string;
  }> {
    const event: calendar_v3.Schema$Event = {
      summary: options.summary,
      description: options.description,
      start: {
        dateTime: options.startTime,
        timeZone: options.timeZone || "UTC",
      },
      end: {
        dateTime: options.endTime,
        timeZone: options.timeZone || "UTC",
      },
      attendees: options.attendees?.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      recurrence: options.recurrence,
    };

    const response = await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: options.sendUpdates || "none",
    });

    const meetEntryPoint = response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    );

    return {
      eventId: response.data.id || "",
      htmlLink: response.data.htmlLink || "",
      meetLink: meetEntryPoint?.uri || response.data.hangoutLink || undefined,
      meetingCode: response.data.conferenceData?.conferenceId || undefined,
    };
  }

  public async createInstantMeeting(): Promise<{
    eventId: string;
    htmlLink: string;
    meetLink?: string;
    meetingCode?: string;
  }> {
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    return this.scheduleMeeting({
      summary: "Instant Meeting",
      startTime: now.toISOString(),
      endTime: endTime.toISOString(),
    });
  }

  public async getMeetingByCalendarEvent(eventId: string): Promise<{
    eventId: string;
    summary?: string;
    meetLink?: string;
    meetingCode?: string;
    startTime?: string;
    endTime?: string;
    attendees?: Array<{ email: string; responseStatus?: string }>;
  }> {
    const response = await this.calendar.events.get({
      calendarId: "primary",
      eventId,
    });

    const meetEntryPoint = response.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === "video"
    );

    return {
      eventId: response.data.id || "",
      summary: response.data.summary || undefined,
      meetLink: meetEntryPoint?.uri || response.data.hangoutLink || undefined,
      meetingCode: response.data.conferenceData?.conferenceId || undefined,
      startTime: response.data.start?.dateTime || response.data.start?.date || undefined,
      endTime: response.data.end?.dateTime || response.data.end?.date || undefined,
      attendees: response.data.attendees?.map((a) => ({
        email: a.email || "",
        responseStatus: a.responseStatus || undefined,
      })),
    };
  }

  public async listUpcomingMeetings(
    days = 7
  ): Promise<
    Array<{
      eventId: string;
      summary?: string;
      meetLink?: string;
      startTime?: string;
      endTime?: string;
    }>
  > {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const response = await this.calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const meetings = (response.data.items || [])
      .filter((event) => event.conferenceData || event.hangoutLink)
      .map((event) => {
        const meetEntryPoint = event.conferenceData?.entryPoints?.find(
          (ep) => ep.entryPointType === "video"
        );

        return {
          eventId: event.id || "",
          summary: event.summary || undefined,
          meetLink: meetEntryPoint?.uri || event.hangoutLink || undefined,
          startTime: event.start?.dateTime || event.start?.date || undefined,
          endTime: event.end?.dateTime || event.end?.date || undefined,
        };
      });

    return meetings;
  }

  // Private helpers

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatSpace(space: any): MeetingSpace {
    return {
      name: space.name || "",
      meetingUri: space.meetingUri || undefined,
      meetingCode: space.meetingCode || undefined,
      config: space.config
        ? {
            accessType: space.config.accessType || undefined,
            entryPointAccess: space.config.entryPointAccess || undefined,
          }
        : undefined,
      activeConference: space.activeConference
        ? {
            conferenceRecord: space.activeConference.conferenceRecord || undefined,
          }
        : undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatConferenceRecord(record: any): ConferenceRecord {
    return {
      name: record.name || "",
      startTime: record.startTime || undefined,
      endTime: record.endTime || undefined,
      expireTime: record.expireTime || undefined,
      space: record.space || undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatParticipant(participant: any): Participant {
    return {
      name: participant.name || "",
      earliestStartTime: participant.earliestStartTime || undefined,
      latestEndTime: participant.latestEndTime || undefined,
      signedinUser: participant.signedinUser
        ? {
            user: participant.signedinUser.user || undefined,
            displayName: participant.signedinUser.displayName || undefined,
          }
        : undefined,
      anonymousUser: participant.anonymousUser
        ? {
            displayName: participant.anonymousUser.displayName || undefined,
          }
        : undefined,
      phoneUser: participant.phoneUser
        ? {
            displayName: participant.phoneUser.displayName || undefined,
          }
        : undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatRecording(recording: any): Recording {
    return {
      name: recording.name || "",
      state: recording.state || undefined,
      startTime: recording.startTime || undefined,
      endTime: recording.endTime || undefined,
      driveDestination: recording.driveDestination
        ? {
            file: recording.driveDestination.file || undefined,
            exportUri: recording.driveDestination.exportUri || undefined,
          }
        : undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatTranscript(transcript: any): Transcript {
    return {
      name: transcript.name || "",
      state: transcript.state || undefined,
      startTime: transcript.startTime || undefined,
      endTime: transcript.endTime || undefined,
      docsDestination: transcript.docsDestination
        ? {
            document: transcript.docsDestination.document || undefined,
            exportUri: transcript.docsDestination.exportUri || undefined,
          }
        : undefined,
    };
  }
}

