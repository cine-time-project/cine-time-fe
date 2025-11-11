"use server";

import { revalidatePath } from "next/cache";
import { CONTACT_LIST_API, contactMessageByIdApi } from "@/helpers/api-routes";
import { getAuthHeader } from "@/helpers/auth-helpers";

/**
 * Server Action: Fetches all contact messages
 * @returns {Promise<Object>} Response object with ok, message, data
 */
export async function getAllContactMessagesAction() {
  try {
    const authHeaders = await getAuthHeader();

    const res = await fetch(CONTACT_LIST_API, {
      method: "GET",
      headers: authHeaders,
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        ok: false,
        message: `Failed to fetch messages: ${res.status}`,
        data: null,
      };
    }

    const data = await res.json();
    return {
      ok: true,
      message: "Success",
      data,
    };
  } catch (error) {
    console.error("Get contact messages error:", error);
    return {
      ok: false,
      message: error.message || "Unknown error",
      data: null,
    };
  }
}

/**
 * Server Action: Deletes a contact message
 * @param {string|number} id - Message ID to delete
 * @returns {Promise<Object>} Response object
 */
export async function deleteContactMessageAction(id) {
  try {
    const authHeaders = await getAuthHeader();

    const res = await fetch(contactMessageByIdApi(id), {
      method: "DELETE",
      headers: authHeaders,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: errorData.message || `Failed to delete message: ${res.status}`,
      };
    }

    const data = await res.json();

    // Revalidate page
    revalidatePath("/admin/contact-messages");

    return {
      ok: true,
      message: data.message || "Message deleted successfully",
    };
  } catch (error) {
    console.error("Delete contact message error:", error);
    return {
      ok: false,
      message: error.message || "Unknown error occurred",
    };
  }
}
