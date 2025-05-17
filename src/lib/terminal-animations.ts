/**
 * Terminal animation utilities for MR.RED
 * Provides functions for creating terminal-style animations and effects
 */

/**
 * Generates a random delay for staggered animations
 * @param min Minimum delay in milliseconds
 * @param max Maximum delay in milliseconds
 * @returns Random delay between min and max
 */
export function randomDelay(min = 100, max = 500): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random glitch effect timing
 * @param intensity Intensity of glitch (0-1)
 * @returns Object with glitch timing properties
 */
export function glitchTiming(intensity = 0.5): {
  duration: number;
  interval: number;
} {
  // Higher intensity = more frequent and longer glitches
  const baseDuration = 150; // ms
  const baseInterval = 5000; // ms
  
  return {
    duration: baseDuration * intensity,
    interval: baseInterval * (1 - intensity * 0.7),
  };
}

/**
 * Creates a typing animation sequence with pauses
 * @param text Text to animate
 * @param typingSpeed Speed of typing (characters per second)
 * @param pauseDuration Duration of pauses in milliseconds
 * @returns Array of sequence steps for TypeAnimation component
 */
export function createTypingSequence(
  text: string,
  typingSpeed = 30,
  pauseDuration = 500
): (string | number)[] {
  // Split text by newlines to create a typing sequence with pauses
  const lines = text.split('\n');
  const sequence: (string | number)[] = [];
  
  let currentText = '';
  
  lines.forEach((line, index) => {
    currentText += (index > 0 ? '\n' : '') + line;
    sequence.push(currentText);
    sequence.push(pauseDuration);
  });
  
  return sequence;
}

/**
 * Creates a boot sequence with timing for terminal initialization
 * @param steps Array of boot sequence steps
 * @param baseDelay Base delay between steps in milliseconds
 * @returns Array of timed boot sequence steps
 */
export function createBootSequence(
  steps: string[],
  baseDelay = 1000
): Array<{ text: string; delay: number }> {
  return steps.map((step, index) => ({
    text: step,
    delay: baseDelay * (index + 1),
  }));
}

/**
 * Simulates a terminal scan line effect
 * @param baseY Base Y position
 * @param amplitude Amplitude of the sine wave
 * @returns Object with y1 and y2 coordinates
 */
export function calculateScanCoordinates(baseY: number, amplitude: number): { y1: number; y2: number } {
  const offset = amplitude * Math.sin(Date.now() / 500);
  return {
    y1: baseY - offset,
    y2: baseY + offset,
  };
}
