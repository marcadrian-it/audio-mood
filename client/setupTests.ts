/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";
import { vi } from "vitest";

/* @ts-ignore */
HTMLCanvasElement.prototype.getContext = () => {
  return {
    fillStyle: "",
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    scale: vi.fn(),
  };
};
