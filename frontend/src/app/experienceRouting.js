export function resolveRootView(authUser, profileOpen, isProfileSetupRequired) {
  if (!authUser) return "public";
  if (profileOpen || isProfileSetupRequired) return "profile";
  return "app";
}

export function shouldLoadGeneratorData(authUser, step, settingsOpen) {
  return Boolean(authUser) && (step >= 4 || settingsOpen);
}
