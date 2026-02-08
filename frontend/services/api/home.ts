import { API_URL } from "@/config/api";
import { fetchWithAuth } from "@/lib/utils/api";

export interface HomeInfo {
    app_name: string;
    description: string;
    version: string;
    next_step?: string;
}

export async function getHome(): Promise<HomeInfo> {
    const res = await fetchWithAuth(`${API_URL}/home`);
    return {
        app_name: res.app_name ?? res.data?.app_name ?? "IntelliHR",
        description: res.description ?? res.data?.description ?? "",
        version: res.version ?? res.data?.version ?? "1.0.0",
        next_step: res.next_step ?? res.data?.next_step,
    };
}
