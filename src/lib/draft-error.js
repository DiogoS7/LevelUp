/** An error with a message written for the person using the app. */
export class DraftError extends Error {
  constructor(message, { needsClaude = false } = {}) {
    super(message);
    this.name = 'DraftError';
    this.needsClaude = needsClaude;
  }
}
