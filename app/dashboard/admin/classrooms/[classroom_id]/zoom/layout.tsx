/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAdminStackContext } from "@/context/admin/stack-context";
import LoadingComponent from "@/components/common/loading-component";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { classroom_id } = useParams<{ classroom_id: string }>();
  const [loadingLabel, setLoadingLabel] = useState("");

  if (!classroom_id) {
    return <div>Turma não encontrada.</div>;
  }

  const {
    classroomsStack: {
      zoom: {
        accounts: { accounts, accountsLoading, handleGetAllZoomAccounts },
        meetings: {
          meetings,
          meetingsLoading,
          handleGetAllZoomMeetings,
          pastInstances: {
            pastInstances,
            pastInstancesLoading,
            handleGetAllZoomPastInstances,
          },
        },
      },
    },
  } = useAdminStackContext();

  useEffect(() => {
    if (accounts.length === 0) {
      setLoadingLabel("Obtendo dados das contas do Zoom...");
      handleGetAllZoomAccounts(classroom_id);
    }

    if (meetings.length === 0) {
      setLoadingLabel("Obtendo informações das reuniões do Zoom...");
      handleGetAllZoomMeetings(classroom_id);
    }

    if (pastInstances.length === 0) {
      setLoadingLabel(
        "Obtendo informações sobre as instâncias passadas do Zoom..."
      );
      handleGetAllZoomPastInstances(classroom_id);
    }
  }, [classroom_id]);

  if (accountsLoading || meetingsLoading || pastInstancesLoading)
    return <LoadingComponent label={loadingLabel} />;

  return children;
};

export default Layout;
