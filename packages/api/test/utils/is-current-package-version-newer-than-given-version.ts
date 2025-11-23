export const isInstalledPackageVersionNewerThanGivenVersion = (
  installedPackageVersion: string,
  givenPackageVersion: string
): boolean => {
  const installedPackageVersionParts = installedPackageVersion.split('.');
  const givenPackageVersionParts = givenPackageVersion.split('.');

  for (let i = 0; i < installedPackageVersionParts.length; i++) {
    const installedVersionPart = Number(installedPackageVersionParts[i]);
    const givenVersionPart = Number(givenPackageVersionParts[i]);

    if (installedVersionPart > givenVersionPart) {
      return true;
    }

    if (installedVersionPart < givenVersionPart) {
      return false;
    }
  }

  return false;
};
