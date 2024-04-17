"use client";

import { askQuestion } from "@/utils/api";
import React, { useState } from "react";

const Question = () => {
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { data } = await askQuestion(value);
    setResponse(data);
    setValue("");
    setIsLoading(false);
  };
  return (
    <div data-testid="question" className="text-black">
      <form onSubmit={handleSubmit}>
        <input
          disabled={isLoading}
          type="text"
          value={value}
          onChange={onChange}
          className="border text-black border-gray-300 px-4 py-2 text-lg rounded-lg"
          placeholder="Ask a question..."
        />
        <button
          disabled={isLoading}
          type="submit"
          className="bg-blue-500 px-4 py-2 rounded-lg text-lg text-white  hover:bg-blue-600 hover:shadow-lg transition duration-300 ease-in-out transform"
        >
          Ask
        </button>
      </form>
      {isLoading && <div>Loading...</div>}
      {response && <div>{response}</div>}
    </div>
  );
};

export default Question;
