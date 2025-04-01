import {
  ZoomMeetingParticipantType,
  ZoomMeetingType,
} from "@/types/zoom/meettings";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const meetingsAPIExample = [
  {
    agenda: "My Meeting 1",
    created_at: "2025-03-23T05:31:16Z",
    duration: 60,
    host_id: "30R7kT7bTIKSNUFEuH_Qlg",
    id: 97763643886,
    join_url: "https://example.com/j/11111",
    pmi: "97891943927",
    start_time: "2025-03-23T06:00:00Z",
    timezone: "America/Los_Angeles",
    topic: "My Meeting 2",
    type: 2,
    uuid: "aDYlohsHRtCd4ii1uC2+hA==",
    participants: [
      {
        id: "30R7kT7bTIKSNUFEuH_Qlg",
        name: "Jill Chill",
        user_id: "27423744",
        registrant_id: "_f08HhPJS82MIVLuuFaJPg",
        user_email: "jchill@example.com",
        join_time: "2022-03-23T06:58:09Z",
        leave_time: "2022-03-23T07:02:28Z",
        duration: 259,
        failover: false,
        status: "in_meeting",
        internal_user: false,
      },
      {
        id: "30R7kT7bTIKSNUFEuH_Qlg",
        name: "Jill Chill",
        user_id: "27423744",
        registrant_id: "_f08HhPJS82MIVLuuFaJPg",
        user_email: "jchill@example.com",
        join_time: "2022-03-23T06:58:09Z",
        leave_time: "2022-03-23T07:02:28Z",
        duration: 259,
        failover: false,
        status: "in_meeting",
        internal_user: false,
      },
      {
        id: "30R7kT7bTIKSNUFEuH_Qlg",
        name: "Jill Chill",
        user_id: "27423744",
        registrant_id: "_f08HhPJS82MIVLuuFaJPg",
        user_email: "jchill@example.com",
        join_time: "2022-03-23T06:58:09Z",
        leave_time: "2022-03-23T07:02:28Z",
        duration: 259,
        failover: false,
        status: "in_meeting",
        internal_user: false,
      },
    ],
    poll_results: [
      {
        id: 93398114182,
        questions: [
          {
            email: "jchill@example.com",
            name: "Jill Chill",
            question_details: [
              {
                answer: "Good",
                date_time: "2022-03-26T05:37:59Z",
                polling_id: "QalIoKWLTJehBJ8e1xRrbQ",
                question: "How are you?",
              },
            ],
          },
        ],
        start_time: "2022-03-26T05:37:59Z",
        uuid: "Vg8IdgluR5WDeWIkpJlElQ==",
      },
    ],
    is_visible_on_schedule: true,
  },
  {
    agenda: "My Meeting",
    created_at: "2025-04-23T05:31:16Z",
    duration: 60,
    host_id: "30R7kT7bTIKSNUFEuH_Qlg",
    id: 87763643887,
    join_url: "https://example.com/j/11111",
    pmi: "97891943927",
    start_time: "2025-04-23T06:00:00Z",
    timezone: "America/Los_Angeles",
    topic: "My Meeting",
    type: 2,
    uuid: "aDYlohsHRtCd4ii1uC2+hAasdasd==",
  },
];

const useZoomAPIMeetingsStack = () => {
  const [meetingsByAPI, setMeetingsByAPI] =
    useState<ZoomMeetingType[]>(meetingsAPIExample);
  const [loading, setLoading] = useState(false);

  const handleGetAllZoomMeetingsByAPI = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/zoom/meetings");

      if (!data) throw "no meetings response from API";

      setMeetingsByAPI(data);
      return true;
    } catch (error) {
      console.error("Error fetching meetings from Zoom API:", error);
      toast.error("Falha ao buscar reuniões da API do Zoom");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleGetAllParticipantsByMeetingIdFromAPI = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/zoom/meetings/participants");

      if (!data) throw "no meetings participants response from API";

      return data as ZoomMeetingParticipantType[];
    } catch (error) {
      console.error(
        "Error fetching meeting participants from Zoom API:",
        error
      );
      toast.error("Falha ao buscar os participantes da reunião da API do Zoom");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    meetingsByAPI,
    setMeetingsByAPI,
    meetingsByAPILoading: loading,
    handleGetAllZoomMeetingsByAPI,
    handleGetAllParticipantsByMeetingIdFromAPI,
  };
};

export interface ZoomAPIMeetingsStackI {
  meetingsByAPI: ZoomMeetingType[];
  meetingsByAPILoading: boolean;
  handleGetAllZoomMeetingsByAPI: () => Promise<boolean>;
  handleGetAllParticipantsByMeetingIdFromAPI: () => Promise<
    false | ZoomMeetingParticipantType[]
  >;
}

export default useZoomAPIMeetingsStack;
