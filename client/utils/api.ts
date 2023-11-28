const createURL = (path: string) => {
  return window.location.origin + path;
};

export const updateEntry = async (id: string, content: string) => {
  console.log("Start updateEntry");
  console.log("ID:", id);
  console.log("Content:", content);

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
    console.log("Response status:", res.status);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    console.log("Response data:", data);

    data.analysis.color = JSON.stringify(data.analysis.color);
    console.log("Color string:", data.analysis.color);

    console.log("End updateEntry");
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
