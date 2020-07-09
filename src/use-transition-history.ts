import { TPathOrPaths } from './types';
import { useContext, useCallback } from 'react';
import * as History from 'history';
import { TransitionContext } from './TransitionProvider';
import { matchPath } from "react-router-dom";

function arrarizePath(pathOrPaths: TPathOrPaths) {
  return typeof pathOrPaths === 'string' ? [pathOrPaths] : pathOrPaths ?? [];
}

function removeSearch(path: History.Path) {
  return path.split('?')[0];
}

function removeSearchArray(paths: History.Path[]) {
  return paths.map(removeSearch);
}

function hasPath(pathOrPaths: TPathOrPaths, path: History.Path) {
  const pathsArray = removeSearchArray(arrarizePath(pathOrPaths));

  return pathsArray.some((potentialPath) => {
    console.log("hasPath: matching", path, "to", potentialPath, !!matchPath(removeSearch(path), { path: potentialPath, exact: true, strict: false })); // TODO: remove
    return !!matchPath(
      removeSearch(path), 
      { path: potentialPath, exact: true, strict: false }
    );
  });
}

function isPathEqual(pathA: string, pathB: string) {
  console.log("isPathEqual: matching", pathA, "to", pathB, !!matchPath(pathA, { path: pathB, exact: true, strict: false })); // TODO: remove
  return !!matchPath(pathA, { path: pathB, exact: true, strict: false });
}

export default function () {
  const { listeners, location, push: wrappedPush } = useContext(
    TransitionContext
  );

  console.log(location);

  const push = useCallback(
    async (path: History.Path, state?: History.LocationState) => {
      if (!isPathEqual(path, location.pathname)) {
        await Promise.all(
          listeners
            .filter(
              (listener) =>
                hasPath(listener.path, location.pathname) ||
                (hasPath(listener.from, location.pathname) &&
                  hasPath(listener.to, path))
            )
            .filter((listener) => !!listener.onLeave)
            .map((listener) => listener.onLeave!())
        );
      }

      wrappedPush(path, state);

      if (!isPathEqual(path, location.pathname)) {
        await Promise.all(
          listeners
            .filter(
              (listener) =>
                hasPath(listener.path, path) ||
                (hasPath(listener.from, location.pathname) &&
                  hasPath(listener.to, path))
            )
            .filter((listener) => !!listener.onEnter)
            .map((listener) => listener.onEnter!())
        );
      }
    },
    [location.pathname]
  );

  return {
    push,
  };
}
