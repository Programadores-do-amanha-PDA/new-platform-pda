"use client";

import { useMemo, useState } from "react";
import { useClassroomStore } from "./store";

export const useClassroomListData = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const { classrooms } = useClassroomStore();

    const displayedClassrooms = useMemo(() => {
        let filtered = classrooms;

        // search filter by name
        if (searchQuery.trim()) {
            filtered = filtered.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return filtered;
    }, [classrooms, searchQuery]);

    return {
        searchQuery,
        setSearchQuery,
        displayedClassrooms,
    };
};
