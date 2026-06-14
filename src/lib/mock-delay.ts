export async function mockDelay(ms = 450): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
