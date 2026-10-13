let tutorialActive = false;

export function isTutorialActive(): boolean {
  return tutorialActive;
}

export function setTutorialActive(value: boolean): void {
  tutorialActive = value;
}
