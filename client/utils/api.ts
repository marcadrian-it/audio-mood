const createURL = (path: string) => {
  return window.location.origin + path;
};

export const updateEntry = async (id: string, content: string) => {
  try {
    const res = await fetch(
      new Request(createURL(`/api/journal/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    data.analysis.color = JSON.stringify(data.analysis.color);

    return {
      data: data.data,
      analysis: data.analysis,
      error: null,
      code: res.status,
      messageForUI: "",
    };
  } catch (error: any) {
    console.error("An error occurred while updating the entry:", error);
    return {
      data: null,
      analysis: null,
      error: error.message,
      code: error.status || 500,
      messageForUI: "An error occurred while updating the entry.",
    };
  }
};

export const deleteEntry = async (id: string) => {
  try {
    const res = await fetch(
      new Request(createURL(`/api/journal/${id}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return {
      data: null,
      error: null,
      code: res.status,
      messageForUI: "Entry deleted successfully.",
    };
  } catch (error: any) {
    console.error("An error occurred while deleting the entry:", error);
    return {
      data: null,
      error: error.message,
      code: error.status || 500,
      messageForUI: "An error occurred while deleting the entry.",
    };
  }
};

export const createNewEntry = async () => {
  try {
    const res = await fetch(
      new Request(createURL("/api/journal"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { data: data.data, error: null, code: res.status, messageForUI: "" };
  } catch (error: any) {
    console.error("An error occurred while creating a new entry:", error);
    return {
      data: null,
      error: error.message,
      code: error.status || 500,
      messageForUI: "An error occurred while creating a new entry.",
    };
  }
};

export const askQuestion = async (question: string) => {
  try {
    const res = await fetch(
      new Request(createURL("/api/question"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })
    );

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { data: data.data, error: null, code: res.status, messageForUI: "" };
  } catch (error: any) {
    console.error("An error occurred while creating a new entry:", error);
    return {
      data: null,
      error: error.message,
      code: error.status || 500,
      messageForUI: "An error occurred while creating a new entry.",
    };
  }
};
